package com.cityreport.service;

import com.cityreport.model.Notification;
import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    @Transactional
    public Notification create(User user, String titre, String message, Notification.Type type, Signalement signalement) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitre(titre);
        notification.setMessage(message);
        notification.setType(type);
        notification.setSignalement(signalement);
        notification.setLu(false);
        
        return notificationRepository.save(notification);
    }
    
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByDateCreationDesc(user);
    }
    
    public Long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }
    
    @Transactional
    public Notification markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        
        // Vérifier que la notification appartient à l'utilisateur
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'avez pas l'autorisation de modifier cette notification");
        }
        
        if (!notification.getLu()) {
            notification.setLu(true);
            notification = notificationRepository.save(notification);
        }
        
        return notification;
    }
    
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndLu(user, false);
        if (!unreadNotifications.isEmpty()) {
            unreadNotifications.forEach(n -> n.setLu(true));
            notificationRepository.saveAll(unreadNotifications);
        }
    }
    
    @Transactional
    public void delete(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        
        // Vérifier que la notification appartient à l'utilisateur
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'avez pas l'autorisation de supprimer cette notification");
        }
        
        notificationRepository.deleteById(notificationId);
    }
}

