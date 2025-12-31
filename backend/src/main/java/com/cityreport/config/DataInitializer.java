package com.cityreport.config;

import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.repository.SignalementRepository;
import com.cityreport.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final SignalementRepository signalementRepository;
    private final PasswordEncoder passwordEncoder;
    
    public DataInitializer(UserRepository userRepository, 
                          SignalementRepository signalementRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.signalementRepository = signalementRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Créer des utilisateurs de démonstration si la base est vide
        if (userRepository.count() == 0) {
            // Admin
            User admin = new User();
            admin.setNom("BOUGHEDDA");
            admin.setPrenom("ZINEB");
            admin.setEmail("admin@mail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            
            // Technicien
            User technicien = new User();
            technicien.setNom("Martin");
            technicien.setPrenom("Sophie");
            technicien.setEmail("technicien@mail.com");
            technicien.setPassword(passwordEncoder.encode("technicien123"));
            technicien.setRole(User.Role.TECHNICIEN);
            technicien.setEnabled(true);
            userRepository.save(technicien);
            
            // Citoyen
            User citoyen = new User();
            citoyen.setNom("Dupont");
            citoyen.setPrenom("Jean");
            citoyen.setEmail("citoyen@mail.com");
            citoyen.setPassword(passwordEncoder.encode("citoyen123"));
            citoyen.setRole(User.Role.CITOYEN);
            citoyen.setEnabled(true);
            userRepository.save(citoyen);
            
            System.out.println("Utilisateurs de démonstration créés avec succès!");
        }
        
        // Créer ou récupérer le citoyen Zineb
        User zineb = userRepository.findByEmail("zineb@mail.com").orElse(null);
        if (zineb == null) {
            zineb = new User();
            zineb.setNom("Zineb");
            zineb.setPrenom("Zineb");
            zineb.setEmail("zineb@mail.com");
            zineb.setPassword(passwordEncoder.encode("zineb123"));
            zineb.setRole(User.Role.CITOYEN);
            zineb.setTelephone("0612345678");
            zineb.setAdresse("Rabat, Maroc");
            zineb.setEnabled(true);
            zineb = userRepository.save(zineb);
            System.out.println("Utilisateur Zineb créé avec succès!");
        }
        
        // Créer ou récupérer le technicien Hiba
        User hiba = userRepository.findByEmail("hiba@mail.com").orElse(null);
        if (hiba == null) {
            hiba = new User();
            hiba.setNom("Hiba");
            hiba.setPrenom("Hiba");
            hiba.setEmail("hiba@mail.com");
            hiba.setPassword(passwordEncoder.encode("hiba123"));
            hiba.setRole(User.Role.TECHNICIEN);
            hiba.setTelephone("0612345679");
            hiba.setAdresse("Rabat, Maroc");
            hiba.setEnabled(true);
            hiba = userRepository.save(hiba);
            System.out.println("Technicien Hiba créé avec succès!");
        }
        
        // Créer des signalements pour Zineb si elle n'en a pas encore
        if (signalementRepository.findByUser(zineb).isEmpty()) {
            // Signalement 1: Nid de poule - Assigné à Hiba
            Signalement signalement1 = new Signalement();
            signalement1.setTitre("Nid de poule important avenue Mohammed V");
            signalement1.setDescription("Il y a un grand nid de poule sur l'avenue Mohammed V, juste après le croisement avec la rue Hassan II. Il fait environ 50 cm de diamètre et 20 cm de profondeur. C'est très dangereux pour les véhicules et les motos.");
            signalement1.setCategorie("Nids de poule");
            signalement1.setStatut(Signalement.Statut.EN_ATTENTE);
            signalement1.setPriorite(Signalement.Priorite.HAUTE);
            signalement1.setLatitude(34.0209);
            signalement1.setLongitude(-6.8416);
            signalement1.setAdresse("Avenue Mohammed V, Rabat, Maroc");
            signalement1.setPhotoUrl("/pothole-zineb.png");
            signalement1.setUser(zineb);
            signalement1.setTechnicien(hiba);
            signalement1.setDateCreation(LocalDateTime.now().minusDays(2));
            signalementRepository.save(signalement1);
            
            // Signalement 2: Éclairage public - Assigné à Hiba
            Signalement signalement2 = new Signalement();
            signalement2.setTitre("Lampadaire éteint rue de la Paix");
            signalement2.setDescription("Le lampadaire situé au numéro 45 de la rue de la Paix est éteint depuis plus d'une semaine. Cela crée un problème de sécurité la nuit, surtout pour les piétons.");
            signalement2.setCategorie("Éclairage public");
            signalement2.setStatut(Signalement.Statut.EN_ATTENTE);
            signalement2.setPriorite(Signalement.Priorite.MOYENNE);
            signalement2.setLatitude(34.0150);
            signalement2.setLongitude(-6.8320);
            signalement2.setAdresse("Rue de la Paix, Rabat, Maroc");
            signalement2.setPhotoUrl("/street-light-zineb.png");
            signalement2.setUser(zineb);
            signalement2.setTechnicien(hiba);
            signalement2.setDateCreation(LocalDateTime.now().minusDays(5));
            signalementRepository.save(signalement2);
            
            // Signalement 3: Déchets - Assigné à Hiba
            Signalement signalement3 = new Signalement();
            signalement3.setTitre("Dépôt sauvage de déchets place de la Mairie");
            signalement3.setDescription("Des sacs poubelles ont été déposés de manière sauvage sur la place de la Mairie. Il y a une accumulation importante de déchets qui attirent les animaux et créent une mauvaise odeur.");
            signalement3.setCategorie("Déchets");
            signalement3.setStatut(Signalement.Statut.EN_COURS);
            signalement3.setPriorite(Signalement.Priorite.MOYENNE);
            signalement3.setLatitude(34.0250);
            signalement3.setLongitude(-6.8500);
            signalement3.setAdresse("Place de la Mairie, Rabat, Maroc");
            signalement3.setPhotoUrl("/garbage-bags.jpg");
            signalement3.setUser(zineb);
            signalement3.setTechnicien(hiba);
            signalement3.setDateCreation(LocalDateTime.now().minusDays(10));
            signalementRepository.save(signalement3);
            
            // Signalement 4: Infrastructure - Assigné à Hiba
            Signalement signalement4 = new Signalement();
            signalement4.setTitre("Trottoir endommagé boulevard Zerktouni");
            signalement4.setDescription("Plusieurs dalles du trottoir sont cassées ou manquantes sur le boulevard Zerktouni, entre les numéros 120 et 150. Cela représente un danger pour les piétons, surtout les personnes âgées et les personnes à mobilité réduite.");
            signalement4.setCategorie("Infrastructure");
            signalement4.setStatut(Signalement.Statut.RESOLU);
            signalement4.setPriorite(Signalement.Priorite.HAUTE);
            signalement4.setLatitude(34.0100);
            signalement4.setLongitude(-6.8400);
            signalement4.setAdresse("Boulevard Zerktouni, Rabat, Maroc");
            signalement4.setPhotoUrl("/broken-sidewalk.png");
            signalement4.setUser(zineb);
            signalement4.setTechnicien(hiba);
            signalement4.setDateCreation(LocalDateTime.now().minusDays(20));
            signalementRepository.save(signalement4);
            
            // Signalement 5: Espaces verts - Assigné à Hiba
            Signalement signalement5 = new Signalement();
            signalement5.setTitre("Arbre mort à enlever parc Hassan II");
            signalement5.setDescription("Un grand arbre dans le parc Hassan II est mort et présente des risques de chute. Il faudrait le couper et le remplacer pour la sécurité des visiteurs.");
            signalement5.setCategorie("Espaces verts");
            signalement5.setStatut(Signalement.Statut.EN_ATTENTE);
            signalement5.setPriorite(Signalement.Priorite.BASSE);
            signalement5.setLatitude(34.0300);
            signalement5.setLongitude(-6.8300);
            signalement5.setAdresse("Parc Hassan II, Rabat, Maroc");
            signalement5.setPhotoUrl("/placeholder.jpg");
            signalement5.setUser(zineb);
            signalement5.setTechnicien(hiba);
            signalement5.setDateCreation(LocalDateTime.now().minusDays(1));
            signalementRepository.save(signalement5);
            
            // Signalement 6: Signalisation - NON assigné (pour que l'admin puisse l'assigner)
            Signalement signalement6 = new Signalement();
            signalement6.setTitre("Panneau de signalisation tombé rue Allal Ben Abdellah");
            signalement6.setDescription("Un panneau de signalisation indiquant une limitation de vitesse est tombé et gît sur le trottoir. Il faudrait le remettre en place ou le remplacer.");
            signalement6.setCategorie("Signalisation");
            signalement6.setStatut(Signalement.Statut.NOUVEAU);
            signalement6.setPriorite(Signalement.Priorite.HAUTE);
            signalement6.setLatitude(34.0200);
            signalement6.setLongitude(-6.8350);
            signalement6.setAdresse("Rue Allal Ben Abdellah, Rabat, Maroc");
            signalement6.setPhotoUrl("/pothole.png");
            signalement6.setUser(zineb);
            // Pas de technicien assigné - l'admin pourra l'assigner
            signalement6.setDateCreation(LocalDateTime.now().minusDays(7));
            signalementRepository.save(signalement6);
            
            System.out.println("6 signalements créés pour Zineb avec succès!");
            System.out.println("5 signalements assignés à Hiba, 1 signalement non assigné (pour l'admin)");
        }
    }
}
