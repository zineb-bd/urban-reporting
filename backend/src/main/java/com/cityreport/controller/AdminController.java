package com.cityreport.controller;

import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.service.SignalementService;
import com.cityreport.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {
    
    private final SignalementService signalementService;
    private final UserService userService;
    
    @GetMapping("/rapports")
    public ResponseEntity<Map<String, Object>> generateReport(
            @RequestParam(required = false, defaultValue = "tous") String periode,
            @RequestParam(required = false, defaultValue = "tous") String statut,
            @RequestParam(required = false, defaultValue = "toutes") String categorie) {
        
        // Vérifier que l'utilisateur est un admin
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        if (user == null || user.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        // Calculer les dates selon la période
        final LocalDateTime dateFin = LocalDateTime.now();
        final LocalDateTime dateDebut;
        
        switch (periode) {
            case "semaine":
                dateDebut = LocalDateTime.now().minusWeeks(1);
                break;
            case "mois":
                dateDebut = LocalDateTime.now().minusMonths(1);
                break;
            case "trimestre":
                dateDebut = LocalDateTime.now().minusMonths(3);
                break;
            case "annee":
                dateDebut = LocalDateTime.now().minusYears(1);
                break;
            default:
                dateDebut = null; // Toutes les périodes
        }
        
        // Récupérer tous les signalements
        Signalement.Statut statutEnum = null;
        if (statut != null && !statut.equals("tous")) {
            try {
                statutEnum = Signalement.Statut.valueOf(statut.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignorer si le statut est invalide
            }
        }
        
        List<Signalement> allSignalements = signalementService.findByFilters(statutEnum, 
                categorie.equals("toutes") ? null : categorie, null);
        
        // Filtrer par période si nécessaire
        final LocalDateTime finalDateDebut = dateDebut;
        if (finalDateDebut != null) {
            allSignalements = allSignalements.stream()
                    .filter(s -> s.getDateCreation() != null && 
                            s.getDateCreation().isAfter(finalDateDebut) && 
                            s.getDateCreation().isBefore(dateFin))
                    .collect(Collectors.toList());
        }
        
        // Calculer les statistiques
        long total = allSignalements.size();
        long nouveau = allSignalements.stream().filter(s -> s.getStatut() == Signalement.Statut.NOUVEAU).count();
        long enAttente = allSignalements.stream().filter(s -> s.getStatut() == Signalement.Statut.EN_ATTENTE).count();
        long enCours = allSignalements.stream().filter(s -> s.getStatut() == Signalement.Statut.EN_COURS).count();
        long resolu = allSignalements.stream().filter(s -> s.getStatut() == Signalement.Statut.RESOLU).count();
        
        // Grouper par catégorie
        Map<String, Long> parCategorie = allSignalements.stream()
                .collect(Collectors.groupingBy(
                        Signalement::getCategorie,
                        Collectors.counting()
                ));
        
        // Grouper par priorité
        Map<String, Long> parPriorite = allSignalements.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getPriorite().name(),
                        Collectors.counting()
                ));
        
        // Construire le rapport
        Map<String, Object> rapport = new HashMap<>();
        rapport.put("dateGeneration", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        rapport.put("periode", periode);
        rapport.put("filtres", Map.of(
                "statut", statut,
                "categorie", categorie
        ));
        rapport.put("statistiques", Map.of(
                "total", total,
                "nouveau", nouveau,
                "enAttente", enAttente,
                "enCours", enCours,
                "resolu", resolu
        ));
        rapport.put("parCategorie", parCategorie);
        rapport.put("parPriorite", parPriorite);
        rapport.put("signalements", allSignalements.stream()
                .map(s -> Map.of(
                        "id", s.getId(),
                        "titre", s.getTitre(),
                        "categorie", s.getCategorie(),
                        "statut", s.getStatut().name(),
                        "priorite", s.getPriorite().name(),
                        "dateCreation", s.getDateCreation() != null ? 
                                s.getDateCreation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "",
                        "adresse", s.getAdresse() != null ? s.getAdresse() : ""
                ))
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=rapport-signalements-" + LocalDate.now() + ".json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(rapport);
    }
}

