package com.cityreport.service;

import com.cityreport.dto.DashboardStats;
import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.repository.SignalementRepository;
import com.cityreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final SignalementRepository signalementRepository;
    private final UserRepository userRepository;
    
    public DashboardStats getDashboardStats() {
        List<Signalement> allSignalements = signalementRepository.findAll();
        
        long total = allSignalements.size();
        long nouveaux = allSignalements.stream()
                .filter(s -> s.getStatut() == Signalement.Statut.NOUVEAU)
                .count();
        long enAttente = allSignalements.stream()
                .filter(s -> s.getStatut() == Signalement.Statut.EN_ATTENTE)
                .count();
        long enCours = allSignalements.stream()
                .filter(s -> s.getStatut() == Signalement.Statut.EN_COURS)
                .count();
        long resolus = allSignalements.stream()
                .filter(s -> s.getStatut() == Signalement.Statut.RESOLU)
                .count();
        
        // Résolus ce mois (depuis le début du mois)
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long resolusCeMois = allSignalements.stream()
                .filter(s -> s.getStatut() == Signalement.Statut.RESOLU)
                .filter(s -> s.getDateCreation() != null && s.getDateCreation().isAfter(startOfMonth))
                .count();
        
        // Signalements récents (5 derniers)
        List<DashboardStats.RecentSignalement> recentSignalements = allSignalements.stream()
                .sorted((s1, s2) -> {
                    if (s1.getDateCreation() == null && s2.getDateCreation() == null) return 0;
                    if (s1.getDateCreation() == null) return 1;
                    if (s2.getDateCreation() == null) return -1;
                    return s2.getDateCreation().compareTo(s1.getDateCreation());
                })
                .limit(5)
                .map(s -> new DashboardStats.RecentSignalement(
                    s.getId(),
                    s.getTitre(),
                    s.getStatut().name(),
                    s.getPriorite().name(),
                    s.getDateCreation() != null ? s.getDateCreation().toString() : ""
                ))
                .collect(Collectors.toList());
        
        // Statistiques des techniciens
        List<User> techniciens = userRepository.findByRole(User.Role.TECHNICIEN);
        List<DashboardStats.TechnicienStats> techniciensStats = techniciens.stream()
                .map(tech -> {
                    List<Signalement> techSignalements = signalementRepository.findByTechnicien(tech);
                    long actifs = techSignalements.stream()
                            .filter(s -> s.getStatut() != Signalement.Statut.RESOLU)
                            .count();
                    long resolusTech = techSignalements.stream()
                            .filter(s -> s.getStatut() == Signalement.Statut.RESOLU)
                            .count();
                    
                    return new DashboardStats.TechnicienStats(
                        tech.getId(),
                        tech.getNom(),
                        tech.getPrenom(),
                        actifs,
                        resolusTech
                    );
                })
                .collect(Collectors.toList());
        
        return new DashboardStats(
            total,
            nouveaux,
            enAttente,
            enCours,
            resolus,
            resolusCeMois,
            recentSignalements,
            techniciensStats
        );
    }
}

