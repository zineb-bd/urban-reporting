package com.cityreport.config;

import com.cityreport.service.NotificationService;
import com.cityreport.service.SignalementService;
import com.cityreport.service.CommentaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class NotificationConfig implements CommandLineRunner {
    
    private final NotificationService notificationService;
    private final SignalementService signalementService;
    private final CommentaireService commentaireService;
    
    @Override
    public void run(String... args) {
        // Injecter NotificationService dans les autres services après leur création
        // pour éviter les dépendances circulaires
        signalementService.setNotificationService(notificationService);
        commentaireService.setNotificationService(notificationService);
    }
}
