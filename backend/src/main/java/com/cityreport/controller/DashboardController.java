package com.cityreport.controller;

import com.cityreport.dto.DashboardStats;
import com.cityreport.exception.ForbiddenException;
import com.cityreport.model.User;
import com.cityreport.service.DashboardService;
import com.cityreport.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final UserService userService;
    
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les admins peuvent accéder aux statistiques du dashboard
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent accéder à cette ressource");
        }
        
        DashboardStats stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}

