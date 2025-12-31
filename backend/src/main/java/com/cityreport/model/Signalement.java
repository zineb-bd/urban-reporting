package com.cityreport.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "signalements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Signalement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String titre;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    @Column(nullable = false, length = 100)
    private String categorie;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priorite priorite;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(columnDefinition = "TEXT")
    private String adresse;
    
    @Column(columnDefinition = "TEXT")
    private String photoUrl;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User technicien;
    
    @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "signalement"})
    @OrderBy("dateCreation ASC")
    private List<Commentaire> commentaires;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (statut == null) {
            statut = Statut.NOUVEAU;
        }
    }
    
    public enum Statut {
        NOUVEAU, EN_ATTENTE, EN_COURS, RESOLU
    }
    
    public enum Priorite {
        BASSE, MOYENNE, HAUTE
    }
}
