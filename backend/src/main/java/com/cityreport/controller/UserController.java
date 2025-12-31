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
}


