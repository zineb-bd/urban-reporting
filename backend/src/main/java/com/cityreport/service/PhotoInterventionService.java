package com.cityreport.service;

import com.cityreport.exception.ForbiddenException;
import com.cityreport.exception.ResourceNotFoundException;
import com.cityreport.model.PhotoIntervention;
import com.cityreport.model.Signalement;
import com.cityreport.model.User;
import com.cityreport.repository.PhotoInterventionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoInterventionService {
    
    private final PhotoInterventionRepository photoInterventionRepository;
    private final SignalementService signalementService;
    
    @Transactional
    public PhotoIntervention ajouterPhoto(Long signalementId, String photoUrl, User technicien) {
        Signalement signalement = signalementService.findById(signalementId);
        
        // Vérifier que le technicien est bien assigné et a accepté la mission
        if (signalement.getTechnicien() == null || !signalement.getTechnicien().getId().equals(technicien.getId())) {
            throw new ForbiddenException("Vous n'êtes pas assigné à ce signalement");
        }
        
        if (signalement.getAccepteAssignation() == null || !signalement.getAccepteAssignation()) {
            throw new ForbiddenException("Vous devez accepter la mission avant d'ajouter des photos d'intervention");
        }
        
        // Vérifier que le signalement est résolu (les photos ne peuvent être ajoutées que lorsque le statut est RESOLU)
        if (signalement.getStatut() != Signalement.Statut.RESOLU) {
            throw new ForbiddenException("Les photos d'intervention ne peuvent être ajoutées que lorsque le signalement est marqué comme résolu");
        }
        
        PhotoIntervention photo = new PhotoIntervention();
        photo.setSignalement(signalement);
        photo.setPhotoUrl(photoUrl);
        photo.setTechnicien(technicien);
        
        return photoInterventionRepository.save(photo);
    }
    
    public List<PhotoIntervention> getPhotosBySignalement(Long signalementId) {
        Signalement signalement = signalementService.findById(signalementId);
        return photoInterventionRepository.findBySignalement(signalement);
    }
}

