package com.cityreport.dto;

import com.cityreport.model.Signalement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalementRequest {
    @NotBlank(message = "Le titre est requis")
    private String titre;
    
    @NotBlank(message = "La description est requise")
    private String description;
    
    @NotBlank(message = "La catégorie est requise")
    private String categorie;
    
    @NotNull(message = "La priorité est requise")
    private Signalement.Priorite priorite;
    
    @NotNull(message = "La latitude est requise")
    private Double latitude;
    
    @NotNull(message = "La longitude est requise")
    private Double longitude;
    
    private String adresse;
    
    private String photoUrl;
}
