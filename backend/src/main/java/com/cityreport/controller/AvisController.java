package com.cityreport.controller;

import com.cityreport.model.Avis;
import com.cityreport.model.User;
import com.cityreport.service.AvisService;
import com.cityreport.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avis")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AvisController {
    
    private final AvisService avisService;
    private final UserService userService;
    
    @PostMapping
    public ResponseEntity<Avis> createAvis(@RequestBody Map<String, Object> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Vérifier que l'utilisateur est un citoyen
        if (user.getRole() != User.Role.CITOYEN) {
            return ResponseEntity.badRequest().build();
        }
        
        Integer note = (Integer) request.get("note");
        String commentaire = (String) request.get("commentaire");
        
        Avis avis = avisService.create(user, note, commentaire);
        return ResponseEntity.ok(avis);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Avis> updateAvis(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        Integer note = (Integer) request.get("note");
        String commentaire = (String) request.get("commentaire");
        
        Avis avis = avisService.update(id, user, note, commentaire);
        return ResponseEntity.ok(avis);
    }
    
    @GetMapping("/my")
    public ResponseEntity<Avis> getMyAvis() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        Avis avis = avisService.getMyAvis(user);
        if (avis == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(avis);
    }
    
    @GetMapping("/latest")
    public ResponseEntity<List<Avis>> getLatestAvis(@RequestParam(defaultValue = "3") int limit) {
        List<Avis> avis = avisService.getLatestAvis(limit);
        return ResponseEntity.ok(avis);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvis(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        avisService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping
    public ResponseEntity<List<Avis>> getAllAvis() {
        List<Avis> avis = avisService.getAllAvis();
        return ResponseEntity.ok(avis);
    }
}

