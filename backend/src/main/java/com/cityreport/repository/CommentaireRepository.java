package com.cityreport.repository;

import com.cityreport.model.Commentaire;
import com.cityreport.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    
    @Query("SELECT c FROM Commentaire c JOIN FETCH c.auteur WHERE c.signalement = :signalement ORDER BY c.dateCreation ASC")
    List<Commentaire> findBySignalement(@Param("signalement") Signalement signalement);
}


