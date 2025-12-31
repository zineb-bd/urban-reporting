package com.cityreport.repository;

import com.cityreport.model.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {
    
    @Query("SELECT a FROM Avis a JOIN FETCH a.user WHERE a.user.id = :userId")
    Optional<Avis> findByUserId(Long userId);
    
    @Query("SELECT a FROM Avis a JOIN FETCH a.user ORDER BY a.dateCreation DESC")
    List<Avis> findAllOrderByDateCreationDesc();
}

