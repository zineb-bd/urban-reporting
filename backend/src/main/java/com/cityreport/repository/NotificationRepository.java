package com.cityreport.repository;

import com.cityreport.model.Notification;
import com.cityreport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n LEFT JOIN FETCH n.signalement WHERE n.user = :user ORDER BY n.dateCreation DESC")
    List<Notification> findByUserOrderByDateCreationDesc(@Param("user") User user);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.lu = false")
    Long countUnreadByUser(@Param("user") User user);
    
    List<Notification> findByUserAndLu(User user, Boolean lu);
}

