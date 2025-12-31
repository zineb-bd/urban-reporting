package com.cityreport.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;
    
    @Column(nullable = false)
    private Boolean lu = false;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signalement_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "commentaires"})
    private Signalement signalement;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (lu == null) {
            lu = false;
        }
    }
    
    public enum Type {
        SIGNALEMENT_CREE,
        SIGNALEMENT_ASSIGNE,
        STATUT_MODIFIE,
        COMMENTAIRE_AJOUTE,
        COMMENTAIRE_SUPPRIME,
        SIGNALEMENT_RESOLU,
        SIGNALEMENT_SUPPRIME,
        COMPTE_CREE,
        CONTACT
    }
}

