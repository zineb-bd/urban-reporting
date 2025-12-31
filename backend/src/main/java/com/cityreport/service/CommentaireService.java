package com.cityreport.service;

import com.cityreport.dto.CommentaireRequest;
import com.cityreport.exception.BadRequestException;
import com.cityreport.exception.ForbiddenException;
import com.cityreport.exception.ResourceNotFoundException;
import com.cityreport.model.Commentaire;
import com.cityreport.model.Notification;
import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.repository.CommentaireRepository;
import com.cityreport.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentaireService {
    
    private final CommentaireRepository commentaireRepository;
    private final SignalementRepository signalementRepository;
    private NotificationService notificationService;
    
    // Injection optionnelle pour éviter les dépendances circulaires
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @Transactional
    public Commentaire create(Long signalementId, CommentaireRequest request, User auteur) {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé avec l'ID: " + signalementId));
        
        if (request.getContenu() == null || request.getContenu().trim().isEmpty()) {
            throw new BadRequestException("Le contenu du commentaire ne peut pas être vide");
        }
        
        Commentaire commentaire = new Commentaire();
        commentaire.setContenu(request.getContenu().trim());
        commentaire.setSignalement(signalement);
        commentaire.setAuteur(auteur);
        
        Commentaire saved = commentaireRepository.save(commentaire);
        
        // Créer des notifications pour l'ajout de commentaire
        if (notificationService != null) {
            try {
                // Notification pour le créateur du signalement (si différent de l'auteur)
                if (!signalement.getUser().getId().equals(auteur.getId())) {
                    notificationService.create(
                        signalement.getUser(),
                        "Nouveau commentaire",
                        auteur.getPrenom() + " " + auteur.getNom() + " a ajouté un commentaire sur votre signalement: \"" + signalement.getTitre() + "\"",
                        Notification.Type.COMMENTAIRE_AJOUTE,
                        signalement
                    );
                }
                
                // Notification pour le technicien assigné (si différent de l'auteur)
                if (signalement.getTechnicien() != null && !signalement.getTechnicien().getId().equals(auteur.getId())) {
                    notificationService.create(
                        signalement.getTechnicien(),
                        "Nouveau commentaire",
                        auteur.getPrenom() + " " + auteur.getNom() + " a ajouté un commentaire sur le signalement: \"" + signalement.getTitre() + "\"",
                        Notification.Type.COMMENTAIRE_AJOUTE,
                        signalement
                    );
                }
            } catch (Exception e) {
                // Ignorer les erreurs de notification
            }
        }
        
        return saved;
    }
    
    public List<Commentaire> findBySignalement(Long signalementId) {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement non trouvé avec l'ID: " + signalementId));
        
        return commentaireRepository.findBySignalement(signalement);
    }
    
    @Transactional
    public void delete(Long commentaireId, User user) {
        Commentaire commentaire = commentaireRepository.findById(commentaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé avec l'ID: " + commentaireId));
        
        // Seul l'auteur du commentaire peut le supprimer
        if (!commentaire.getAuteur().getId().equals(user.getId()) && 
            user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Vous n'avez pas l'autorisation de supprimer ce commentaire");
        }
        
        Signalement signalement = commentaire.getSignalement();
        User createurSignalement = signalement.getUser();
        User technicien = signalement.getTechnicien();
        
        commentaireRepository.deleteById(commentaireId);
        
        // Créer des notifications pour la suppression du commentaire
        if (notificationService != null) {
            try {
                // Notification pour le créateur du signalement (si différent de l'auteur du commentaire)
                if (!createurSignalement.getId().equals(user.getId())) {
                    notificationService.create(
                        createurSignalement,
                        "Commentaire supprimé",
                        "Un commentaire sur votre signalement \"" + signalement.getTitre() + "\" a été supprimé",
                        Notification.Type.COMMENTAIRE_SUPPRIME,
                        signalement
                    );
                }
                
                // Notification pour le technicien assigné (si différent de l'auteur du commentaire)
                if (technicien != null && !technicien.getId().equals(user.getId())) {
                    notificationService.create(
                        technicien,
                        "Commentaire supprimé",
                        "Un commentaire sur le signalement \"" + signalement.getTitre() + "\" a été supprimé",
                        Notification.Type.COMMENTAIRE_SUPPRIME,
                        signalement
                    );
                }
            } catch (Exception e) {
                // Ignorer les erreurs de notification
            }
        }
    }
}

