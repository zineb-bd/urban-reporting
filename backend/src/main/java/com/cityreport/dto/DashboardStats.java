package com.cityreport.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalSignalements;
    private long nouveauxSignalements;
    private long enAttente;
    private long enCours;
    private long resolus;
    private long resolusCeMois;
    private List<RecentSignalement> recentSignalements;
    private List<TechnicienStats> techniciensStats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSignalement {
        private Long id;
        private String titre;
        private String statut;
        private String priorite;
        private String dateCreation;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicienStats {
        private Long id;
        private String nom;
        private String prenom;
        private long actifs;
        private long resolus;
    }
}

