package com.cityreport.config;

import com.cityreport.model.User;
import com.cityreport.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Créer des utilisateurs de démonstration si la base est vide
        if (userRepository.count() == 0) {
            // Admin
            User admin = new User();
            admin.setNom("Durand");
            admin.setPrenom("Pierre");
            admin.setEmail("admin@mail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            
            // Technicien
            User technicien = new User();
            technicien.setNom("Martin");
            technicien.setPrenom("Sophie");
            technicien.setEmail("technicien@mail.com");
            technicien.setPassword(passwordEncoder.encode("technicien123"));
            technicien.setRole(User.Role.TECHNICIEN);
            userRepository.save(technicien);
            
            // Citoyen
            User citoyen = new User();
            citoyen.setNom("Dupont");
            citoyen.setPrenom("Jean");
            citoyen.setEmail("citoyen@mail.com");
            citoyen.setPassword(passwordEncoder.encode("citoyen123"));
            citoyen.setRole(User.Role.CITOYEN);
            userRepository.save(citoyen);
            
            System.out.println("Utilisateurs de démonstration créés avec succès!");
        }
    }
}
