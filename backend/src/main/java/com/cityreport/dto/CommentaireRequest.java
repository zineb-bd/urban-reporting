package com.cityreport.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentaireRequest {
    @NotBlank(message = "Le contenu du commentaire est requis")
    private String contenu;
}


