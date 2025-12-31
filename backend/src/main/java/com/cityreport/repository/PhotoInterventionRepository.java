package com.cityreport.repository;

import com.cityreport.model.PhotoIntervention;
import com.cityreport.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoInterventionRepository extends JpaRepository<PhotoIntervention, Long> {
    @Query("SELECT p FROM PhotoIntervention p JOIN FETCH p.technicien WHERE p.signalement = :signalement ORDER BY p.dateAjout ASC")
    List<PhotoIntervention> findBySignalement(@Param("signalement") Signalement signalement);
}

