package com.cityreport.controller;

import com.cityreport.dto.ContactRequest;
import com.cityreport.exception.ForbiddenException;
import com.cityreport.model.ContactMessage;
import com.cityreport.model.User;
import com.cityreport.service.ContactService;
import com.cityreport.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContactController {
    
    private final ContactService contactService;
    private final UserService userService;
    
    @PostMapping
    public ResponseEntity<ContactMessage> sendContactMessage(@Valid @RequestBody ContactRequest request) {
        ContactMessage message = contactService.createContactMessage(request);
        return ResponseEntity.ok(message);
    }
    
    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        // Seuls les admins peuvent voir tous les messages de contact
        if (user.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Seuls les administrateurs peuvent accéder à cette liste");
        }
        
        List<ContactMessage> messages = contactService.getAllMessages();
        return ResponseEntity.ok(messages);
    }
}

