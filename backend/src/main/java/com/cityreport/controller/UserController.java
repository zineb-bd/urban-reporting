package com.cityreport.controller;

import com.cityreport.exception.ForbiddenException;
import com.cityreport.model.User;
import com.cityreport.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/techniciens")
    public ResponseEntity<List<User>> getTechniciens() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les admins peuvent voir la liste des techniciens
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent accéder à cette liste");
        }
        
        List<User> techniciens = userService.findTechniciens();
        return ResponseEntity.ok(techniciens);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les admins peuvent voir tous les utilisateurs
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent accéder à cette liste");
        }
        
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);
        
        // Seuls les admins peuvent supprimer des utilisateurs
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent supprimer des utilisateurs");
        }
        
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email);
        
        // Seuls les admins peuvent activer/désactiver des comptes
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent modifier le statut des utilisateurs");
        }
        
        User updatedUser = userService.toggleUserStatus(id);
        return ResponseEntity.ok(updatedUser);
    }
}


