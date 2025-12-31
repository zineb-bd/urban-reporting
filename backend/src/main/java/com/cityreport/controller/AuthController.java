package com.cityreport.controller;

import com.cityreport.dto.AuthResponse;
import com.cityreport.dto.LoginRequest;
import com.cityreport.dto.RegisterRequest;
import com.cityreport.exception.BadRequestException;
import com.cityreport.exception.UnauthorizedException;
import com.cityreport.model.Notification;
import com.cityreport.model.User;
import com.cityreport.security.JwtUtil;
import com.cityreport.service.NotificationService;
import com.cityreport.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final NotificationService notificationService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());
        
        // Créer une notification de bienvenue pour le nouvel utilisateur
        try {
            notificationService.create(
                user,
                "Bienvenue sur CitéConnect !",
                "Votre compte a été créé avec succès. Vous pouvez maintenant créer des signalements et suivre leur résolution.",
                Notification.Type.COMPTE_CREE,
                null
            );
        } catch (Exception e) {
            // Ignorer les erreurs de notification
        }
        
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Email ou mot de passe incorrect");
        }
        
        User user = userService.findByEmail(request.getEmail());
        
        // Si un rôle est spécifié dans la requête, vérifier qu'il correspond
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            if (!user.getRole().name().equalsIgnoreCase(request.getRole())) {
                throw new BadRequestException("Rôle incorrect pour cet utilisateur");
            }
        }
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());
        
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}
