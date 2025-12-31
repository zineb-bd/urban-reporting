package com.cityreport.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "photos_intervention")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoIntervention {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signalement_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Signalement signalement;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String photoUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User technicien;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateAjout;
    
    @PrePersist
    protected void onCreate() {
        dateAjout = LocalDateTime.now();
    }
}

