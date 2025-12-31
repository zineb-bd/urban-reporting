package com.cityreport.service;

import com.cityreport.dto.RegisterRequest;
import com.cityreport.exception.BadRequestException;
import com.cityreport.exception.ResourceNotFoundException;
import com.cityreport.model.User;
import com.cityreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Un utilisateur avec cet email existe déjà");
        }
        
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Les mots de passe ne correspondent pas");
        }
        
        try {
            User.Role role = User.Role.valueOf(request.getRole().toUpperCase());
            User user = new User();
            user.setNom(request.getNom());
            user.setPrenom(request.getPrenom());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setTelephone(request.getTelephone());
            user.setAdresse(request.getAdresse());
            user.setRole(role);
            
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Rôle invalide: " + request.getRole());
        }
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + email));
    }
    
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + id));
    }
    
    public List<User> findTechniciens() {
        return userRepository.findByRole(User.Role.TECHNICIEN);
    }
    
    public List<User> findByRole(User.Role role) {
        return userRepository.findByRole(role);
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);
        // Ne pas permettre la suppression d'un admin
        if (user.getRole() == User.Role.ADMIN) {
            throw new BadRequestException("Impossible de supprimer un administrateur");
        }
        userRepository.deleteById(id);
    }
    
    @Transactional
    public User toggleUserStatus(Long id) {
        User user = findById(id);
        // Ne pas permettre la désactivation d'un admin
        if (user.getRole() == User.Role.ADMIN) {
            throw new BadRequestException("Impossible de désactiver un administrateur");
        }
        user.setEnabled(!user.getEnabled());
        return userRepository.save(user);
    }
}
