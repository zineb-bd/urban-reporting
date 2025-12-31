package com.cityreport.repository;

import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    @Query("SELECT s FROM Signalement s JOIN FETCH s.user WHERE s.user = :user")
    List<Signalement> findByUser(@Param("user") User user);
    List<Signalement> findByStatut(Signalement.Statut statut);
    List<Signalement> findByCategorie(String categorie);
    
    @Query("SELECT DISTINCT s FROM Signalement s JOIN FETCH s.user WHERE " +
           "(:statut IS NULL OR s.statut = :statut) AND " +
           "(:categorie IS NULL OR s.categorie = :categorie)")
    List<Signalement> findByFilters(@Param("statut") Signalement.Statut statut,
                                    @Param("categorie") String categorie);
    
    @Query("SELECT s FROM Signalement s JOIN FETCH s.user JOIN FETCH s.technicien WHERE s.technicien = :technicien")
    List<Signalement> findByTechnicien(@Param("technicien") User technicien);
}

