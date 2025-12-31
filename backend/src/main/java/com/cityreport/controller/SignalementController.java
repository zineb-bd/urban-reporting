package com.cityreport.controller;

import com.cityreport.dto.CommentaireRequest;
import com.cityreport.dto.SignalementRequest;
import com.cityreport.exception.BadRequestException;
import com.cityreport.exception.ForbiddenException;
import com.cityreport.model.Commentaire;
import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.model.Notification;
import com.cityreport.model.PhotoIntervention;
import com.cityreport.repository.SignalementRepository;
import com.cityreport.service.CommentaireService;
import com.cityreport.service.NotificationService;
import com.cityreport.service.PhotoInterventionService;
import com.cityreport.service.SignalementService;
import com.cityreport.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signalements")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SignalementController {
    
    private final SignalementService signalementService;
    private final SignalementRepository signalementRepository;
    private final UserService userService;
    private final CommentaireService commentaireService;
    private final NotificationService notificationService;
    private final PhotoInterventionService photoInterventionService;
    
    @GetMapping("/public")
    public ResponseEntity<List<Signalement>> getAllSignalementsPublic(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String search) {
        
        Signalement.Statut statutEnum = null;
        if (statut != null && !statut.isEmpty()) {
            try {
                statutEnum = Signalement.Statut.valueOf(statut.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Statut invalide: " + statut);
            }
        }
        
        List<Signalement> signalements = signalementService.findByFilters(statutEnum, categorie, search);
        return ResponseEntity.ok(signalements);
    }
    
    @GetMapping
    public ResponseEntity<List<Signalement>> getAllSignalements(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String search) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        if (user == null) {
            throw new BadRequestException("Utilisateur non trouvé: " + email);
        }
        
        // Les admins et techniciens voient tous les signalements
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.TECHNICIEN) {
            Signalement.Statut statutEnum = null;
            if (statut != null && !statut.isEmpty()) {
                try {
                    statutEnum = Signalement.Statut.valueOf(statut.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Statut invalide: " + statut);
                }
            }
            List<Signalement> signalements = signalementService.findByFilters(statutEnum, categorie, search);
            return ResponseEntity.ok(signalements);
        }
        
        // Les citoyens voient seulement leurs signalements
        List<Signalement> signalements = signalementService.findByUser(user);
        return ResponseEntity.ok(signalements);
    }
    
    @GetMapping("/mes-signalements")
    public ResponseEntity<List<Signalement>> getMesSignalements() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        List<Signalement> signalements = signalementService.findByUser(user);
        return ResponseEntity.ok(signalements);
    }
    
    @GetMapping("/mes-assignations")
    public ResponseEntity<List<Signalement>> getMesAssignations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les techniciens peuvent voir leurs assignations
        if (user.getRole() != User.Role.TECHNICIEN) {
            throw new ForbiddenException("Seuls les techniciens peuvent accéder à leurs assignations");
        }
        
        List<Signalement> signalements = signalementService.findAssignedSignalements(user);
        return ResponseEntity.ok(signalements);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Signalement> getSignalementById(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        Signalement signalement = signalementService.findById(id);
        
        // Vérifier les permissions d'accès
        signalementService.verifyOwnership(id, user);
        
        return ResponseEntity.ok(signalement);
    }
    
    @PostMapping
    public ResponseEntity<Signalement> createSignalement(@Valid @RequestBody SignalementRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        Signalement signalement = signalementService.create(request, user);
        
        // Créer une notification pour les admins (nouveau signalement)
        try {
            List<User> admins = userService.findByRole(User.Role.ADMIN);
            for (User admin : admins) {
                notificationService.create(
                    admin,
                    "Nouveau signalement",
                    "Un nouveau signalement a été créé: \"" + signalement.getTitre() + "\" par " + user.getPrenom() + " " + user.getNom(),
                    Notification.Type.SIGNALEMENT_CREE,
                    signalement
                );
            }
        } catch (Exception e) {
            // Ignorer les erreurs de notification pour ne pas bloquer la création
        }
        
        return ResponseEntity.ok(signalement);
    }
    
    @PatchMapping("/{id}/statut")
    public ResponseEntity<Signalement> updateStatut(
            @PathVariable Long id,
            @RequestParam Signalement.Statut statut,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les techniciens assignés peuvent modifier le statut
        if (user.getRole() != User.Role.TECHNICIEN) {
            throw new ForbiddenException("Seuls les techniciens peuvent modifier le statut d'un signalement");
        }
        
        Signalement signalement = signalementService.findById(id);
        // Vérifier que le technicien est assigné et a accepté la mission
        if (signalement.getTechnicien() == null || !signalement.getTechnicien().getId().equals(user.getId())) {
            throw new ForbiddenException("Vous n'êtes pas assigné à ce signalement");
        }
        if (signalement.getAccepteAssignation() == null || !signalement.getAccepteAssignation()) {
            throw new ForbiddenException("Vous devez accepter la mission avant de modifier le statut");
        }
        
        signalement = signalementService.updateStatut(id, statut);
        
        // Si le statut est RESOLU et que des données de résolution sont fournies, les sauvegarder
        if (statut == Signalement.Statut.RESOLU && requestBody != null) {
            if (requestBody.containsKey("commentairesTechniques")) {
                signalement.setCommentairesTechniques((String) requestBody.get("commentairesTechniques"));
            }
            if (requestBody.containsKey("tempsPasseMinutes")) {
                Object tempsObj = requestBody.get("tempsPasseMinutes");
                if (tempsObj != null) {
                    if (tempsObj instanceof Integer) {
                        signalement.setTempsPasseMinutes((Integer) tempsObj);
                    } else if (tempsObj instanceof Number) {
                        signalement.setTempsPasseMinutes(((Number) tempsObj).intValue());
                    }
                }
            }
            signalement = signalementRepository.save(signalement);
        }
        
        return ResponseEntity.ok(signalement);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Signalement> updateSignalement(
            @PathVariable Long id,
            @Valid @RequestBody SignalementRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        Signalement signalement = signalementService.update(id, request, user);
        return ResponseEntity.ok(signalement);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSignalement(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        Signalement signalement = signalementService.findById(id);
        
        // Vérifier que l'utilisateur est admin ou propriétaire du signalement
        if (user.getRole() != User.Role.ADMIN && !signalement.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Vous n'avez pas l'autorisation de supprimer ce signalement");
        }
        
        signalementService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/assigner")
    public ResponseEntity<Signalement> assignTechnicien(
            @PathVariable Long id,
            @RequestParam Long technicienId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les admins peuvent assigner un technicien
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent assigner un technicien");
        }
        
        Signalement signalement = signalementService.assignTechnicien(id, technicienId);
        return ResponseEntity.ok(signalement);
    }
    
    @PostMapping("/{id}/commentaires")
    public ResponseEntity<Commentaire> createCommentaire(
            @PathVariable Long id,
            @Valid @RequestBody CommentaireRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        Commentaire commentaire = commentaireService.create(id, request, user);
        return ResponseEntity.ok(commentaire);
    }
    
    @GetMapping("/{id}/commentaires")
    public ResponseEntity<List<Commentaire>> getCommentaires(@PathVariable Long id) {
        List<Commentaire> commentaires = commentaireService.findBySignalement(id);
        return ResponseEntity.ok(commentaires);
    }
    
    @DeleteMapping("/commentaires/{commentaireId}")
    public ResponseEntity<Void> deleteCommentaire(@PathVariable Long commentaireId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        commentaireService.delete(commentaireId, user);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/photo")
    public ResponseEntity<Signalement> updatePhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        String photoUrl = request.get("photoUrl");
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            throw new BadRequestException("L'URL de la photo est requise");
        }
        
        Signalement signalement = signalementService.updatePhoto(id, photoUrl, user);
        return ResponseEntity.ok(signalement);
    }
    
    @PostMapping("/{id}/accepter")
    public ResponseEntity<Signalement> accepterAssignation(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les techniciens peuvent accepter une assignation
        if (user.getRole() != User.Role.TECHNICIEN) {
            throw new ForbiddenException("Seuls les techniciens peuvent accepter une assignation");
        }
        
        Signalement signalement = signalementService.accepterAssignation(id, user);
        return ResponseEntity.ok(signalement);
    }
    
    @PostMapping("/{id}/refuser")
    public ResponseEntity<Signalement> refuserAssignation(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les techniciens peuvent refuser une assignation
        if (user.getRole() != User.Role.TECHNICIEN) {
            throw new ForbiddenException("Seuls les techniciens peuvent refuser une assignation");
        }
        
        String justification = request.get("justification");
        Signalement signalement = signalementService.refuserAssignation(id, justification, user);
        return ResponseEntity.ok(signalement);
    }
    
    @PostMapping("/{id}/photos-intervention")
    public ResponseEntity<PhotoIntervention> ajouterPhotoIntervention(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les techniciens peuvent ajouter des photos d'intervention
        if (user.getRole() != User.Role.TECHNICIEN) {
            throw new ForbiddenException("Seuls les techniciens peuvent ajouter des photos d'intervention");
        }
        
        String photoUrl = request.get("photoUrl");
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            throw new BadRequestException("L'URL de la photo est requise");
        }
        
        PhotoIntervention photo = photoInterventionService.ajouterPhoto(id, photoUrl, user);
        return ResponseEntity.ok(photo);
    }
    
    @GetMapping("/{id}/photos-intervention")
    public ResponseEntity<List<PhotoIntervention>> getPhotosIntervention(@PathVariable Long id) {
        List<PhotoIntervention> photos = photoInterventionService.getPhotosBySignalement(id);
        return ResponseEntity.ok(photos);
    }
    
    @PostMapping("/{id}/admin/accepter")
    public ResponseEntity<Signalement> accepterSignalementAdmin(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les admins peuvent accepter un signalement
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent accepter un signalement");
        }
        
        Signalement signalement = signalementService.accepterSignalementAdmin(id);
        return ResponseEntity.ok(signalement);
    }
    
    @PostMapping("/{id}/admin/refuser")
    public ResponseEntity<Void> refuserSignalementAdmin(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les admins peuvent refuser un signalement
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent refuser un signalement");
        }
        
        signalementService.refuserSignalementAdmin(id);
        return ResponseEntity.noContent().build();
    }
}

