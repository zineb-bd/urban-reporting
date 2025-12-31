package com.cityreport.service;

import com.cityreport.dto.ContactRequest;
import com.cityreport.model.ContactMessage;
import com.cityreport.model.Notification;
import com.cityreport.model.User;
import com.cityreport.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {
    
    private final ContactMessageRepository contactMessageRepository;
    private final NotificationService notificationService;
    private final UserService userService;
    
    @Transactional
    public ContactMessage createContactMessage(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setNom(request.getNom());
        message.setPrenom(request.getPrenom());
        message.setEmail(request.getEmail());
        message.setTelephone(request.getTelephone());
        message.setMessage(request.getMessage());
        
        ContactMessage saved = contactMessageRepository.save(message);
        
        // Créer une notification pour tous les admins dans une transaction séparée
        // pour éviter que les erreurs de notification n'annulent la sauvegarde du message
        createNotificationsForAdmins(request);
        
        return saved;
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotificationsForAdmins(ContactRequest request) {
        try {
            List<User> admins = userService.findByRole(User.Role.ADMIN);
            for (User admin : admins) {
                notificationService.create(
                    admin,
                    "Nouveau message de contact",
                    String.format("Message de %s %s (%s - %s):\n\n%s", 
                        request.getPrenom(), 
                        request.getNom(),
                        request.getEmail(),
                        request.getTelephone(),
                        request.getMessage()),
                    Notification.Type.CONTACT,
                    null
                );
            }
        } catch (Exception e) {
            // Ignorer les erreurs de notification pour ne pas bloquer la création
            // Log l'erreur mais ne pas la propager
            System.err.println("Erreur lors de la création de la notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAll();
    }
}

