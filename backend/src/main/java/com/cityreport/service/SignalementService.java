package com.cityreport.service;

import com.cityreport.dto.SignalementRequest;
import com.cityreport.exception.BadRequestException;
import com.cityreport.exception.ForbiddenException;
import com.cityreport.exception.ResourceNotFoundException;
import com.cityreport.model.Notification;
import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SignalementService {
    
    private final SignalementRepository signalementRepository;
    private final UserService userService;
    private NotificationService notificationService;
    
    // Injection optionnelle pour éviter les dépendances circulaires
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @Transactional
    public Signalement create(SignalementRequest request, User user) {
        // Validation des coordonnées
        if (request.getLatitude() < -90 || request.getLatitude() > 90) {
            throw new BadRequestException("La latitude doit être entre -90 et 90");
        }
        if (request.getLongitude() < -180 || request.getLongitude() > 180) {
            throw new BadRequestException("La longitude doit être entre -180 et 180");
        }
        
        Signalement signalement = new Signalement();
        signalement.setTitre(request.getTitre());
        signalement.setDescription(request.getDescription());
        signalement.setCategorie(request.getCategorie());
        signalement.setPriorite(request.getPriorite());
        signalement.setLatitude(request.getLatitude());
        signalement.setLongitude(request.getLongitude());
        signalement.setAdresse(request.getAdresse());
        signalement.setPhotoUrl(request.getPhotoUrl());
        signalement.setUser(user);
        signalement.setStatut(Signalement.Statut.NOUVEAU);
        
        Signalement saved = signalementRepository.save(signalement);
        
        // Créer une notification pour les admins (nouveau signalement)
        // Note: Les notifications pour les admins seront créées dans le contrôleur si nécessaire
        
        return saved;
    }
    
    public List<Signalement> findAll() {
        return signalementRepository.findAll();
    }
    
    public Signalement findById(Long id) {
        return signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé avec l'ID: " + id));
    }
    
    public List<Signalement> findByUser(User user) {
        return signalementRepository.findByUser(user);
    }
    
    public List<Signalement> findAssignedSignalements(User technicien) {
        return signalementRepository.findByTechnicien(technicien);
    }
    
    public List<Signalement> findByFilters(Signalement.Statut statut, String categorie, String search) {
        List<Signalement> results = signalementRepository.findByFilters(statut, categorie);
        
        // Filtrer par recherche texte côté Java pour éviter les problèmes avec LOWER() sur TEXT dans PostgreSQL
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            results = results.stream()
                .filter(s -> 
                    (s.getTitre() != null && s.getTitre().toLowerCase().contains(searchLower)) ||
                    (s.getDescription() != null && s.getDescription().toLowerCase().contains(searchLower))
                )
                .collect(java.util.stream.Collectors.toList());
        }
        
        return results;
    }
    
    @Transactional
    public Signalement updateStatut(Long id, Signalement.Statut statut) {
        Signalement signalement = findById(id);
        Signalement.Statut oldStatut = signalement.getStatut();
        signalement.setStatut(statut);
        Signalement saved = signalementRepository.save(signalement);
        
        // Créer des notifications pour le changement de statut
        if (notificationService != null && !oldStatut.equals(statut)) {
            try {
                // Notification pour le créateur du signalement
                notificationService.create(
                    signalement.getUser(),
                    "Statut modifié",
                    "Le statut de votre signalement \"" + signalement.getTitre() + "\" a été modifié en: " + getStatutLabel(statut),
                    statut == Signalement.Statut.RESOLU ? Notification.Type.SIGNALEMENT_RESOLU : Notification.Type.STATUT_MODIFIE,
                    saved
                );
                
                // Notification pour le technicien assigné si présent
                if (signalement.getTechnicien() != null) {
                    notificationService.create(
                        signalement.getTechnicien(),
                        "Statut modifié",
                        "Le statut du signalement \"" + signalement.getTitre() + "\" a été modifié en: " + getStatutLabel(statut),
                        Notification.Type.STATUT_MODIFIE,
                        saved
                    );
                }
            } catch (Exception e) {
                // Ignorer les erreurs de notification
            }
        }
        
        return saved;
    }
    
    private String getStatutLabel(Signalement.Statut statut) {
        return switch (statut) {
            case NOUVEAU -> "Nouveau";
            case EN_ATTENTE -> "En attente";
            case EN_COURS -> "En cours";
            case RESOLU -> "Résolu";
        };
    }
    
    @Transactional
    public void delete(Long id) {
        Signalement signalement = findById(id);
        User createur = signalement.getUser();
        User technicien = signalement.getTechnicien();
        
        signalementRepository.deleteById(id);
        
        // Créer des notifications pour la suppression
        if (notificationService != null) {
            try {
                // Notification pour le créateur du signalement
                notificationService.create(
                    createur,
                    "Signalement supprimé",
                    "Votre signalement \"" + signalement.getTitre() + "\" a été supprimé",
                    Notification.Type.SIGNALEMENT_SUPPRIME,
                    null
                );
                
                // Notification pour le technicien assigné si présent
                if (technicien != null) {
                    notificationService.create(
                        technicien,
                        "Signalement supprimé",
                        "Le signalement \"" + signalement.getTitre() + "\" qui vous était assigné a été supprimé",
                        Notification.Type.SIGNALEMENT_SUPPRIME,
                        null
                    );
                }
            } catch (Exception e) {
                // Ignorer les erreurs de notification
            }
        }
    }
    
    public void verifyOwnership(Long signalementId, User user) {
        Signalement signalement = findById(signalementId);
        if (!signalement.getUser().getId().equals(user.getId()) && 
            user.getRole() != User.Role.ADMIN && 
            user.getRole() != User.Role.TECHNICIEN) {
            throw new ForbiddenException("Vous n'avez pas l'autorisation d'accéder à ce signalement");
        }
    }
    
    @Transactional
    public Signalement assignTechnicien(Long signalementId, Long technicienId) {
        User technicien = userService.findById(technicienId);
        
        if (technicien.getRole() != User.Role.TECHNICIEN) {
            throw new BadRequestException("L'utilisateur spécifié n'est pas un technicien");
        }
        
        Signalement signalement = findById(signalementId);
        signalement.setTechnicien(technicien);
        
        // Si le statut est NOUVEAU, le passer automatiquement à EN_ATTENTE
        if (signalement.getStatut() == Signalement.Statut.NOUVEAU) {
            signalement.setStatut(Signalement.Statut.EN_ATTENTE);
        }
        
        Signalement saved = signalementRepository.save(signalement);
        
        // Créer des notifications pour l'assignation
        if (notificationService != null) {
            try {
                // Notification pour le technicien assigné
                notificationService.create(
                    technicien,
                    "Nouvelle assignation",
                    "Un signalement vous a été assigné: \"" + signalement.getTitre() + "\"",
                    Notification.Type.SIGNALEMENT_ASSIGNE,
                    saved
                );
                
                // Notification pour le créateur du signalement
                notificationService.create(
                    signalement.getUser(),
                    "Technicien assigné",
                    "Un technicien a été assigné à votre signalement: \"" + signalement.getTitre() + "\"",
                    Notification.Type.SIGNALEMENT_ASSIGNE,
                    saved
                );
            } catch (Exception e) {
                // Ignorer les erreurs de notification
            }
        }
        
        return saved;
    }
    
    @Transactional
    public Signalement updatePhoto(Long id, String photoUrl, User user) {
        Signalement signalement = findById(id);
        
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if (!signalement.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Vous n'avez pas l'autorisation de modifier la photo de ce signalement");
        }
        
        signalement.setPhotoUrl(photoUrl);
        return signalementRepository.save(signalement);
    }
}
