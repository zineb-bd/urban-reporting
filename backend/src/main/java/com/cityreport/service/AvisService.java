package com.cityreport.service;

import com.cityreport.exception.ResourceNotFoundException;
import com.cityreport.model.Avis;
import com.cityreport.model.User;
import com.cityreport.repository.AvisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvisService {
    
    private final AvisRepository avisRepository;
    
    @Transactional
    public Avis create(User user, Integer note, String commentaire) {
        // Vérifier si l'utilisateur a déjà un avis
        Avis existingAvis = avisRepository.findByUserId(user.getId()).orElse(null);
        
        if (existingAvis != null) {
            existingAvis.setNote(note);
            existingAvis.setCommentaire(commentaire);
            return avisRepository.save(existingAvis);
        }
        
        Avis avis = new Avis();
        avis.setUser(user);
        avis.setNote(note);
        avis.setCommentaire(commentaire);
        
        return avisRepository.save(avis);
    }
    
    @Transactional
    public Avis update(Long id, User user, Integer note, String commentaire) {
        Avis avis = avisRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé"));
        
        // Vérifier que l'avis appartient à l'utilisateur
        if (!avis.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cet avis");
        }
        
        avis.setNote(note);
        avis.setCommentaire(commentaire);
        
        return avisRepository.save(avis);
    }
    
    public Avis getMyAvis(User user) {
        return avisRepository.findByUserId(user.getId())
            .orElse(null);
    }
    
    public List<Avis> getLatestAvis(int limit) {
        return avisRepository.findAllOrderByDateCreationDesc()
            .stream()
            .limit(limit)
            .toList();
    }
    
    @Transactional
    public void delete(Long id, User user) {
        Avis avis = avisRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé"));
        
        // Vérifier que l'avis appartient à l'utilisateur
        if (!avis.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cet avis");
        }
        
        avisRepository.delete(avis);
    }
    
    public List<Avis> getAllAvis() {
        return avisRepository.findAllOrderByDateCreationDesc();
    }
}

