package com.weddingapp.api.service;

import com.weddingapp.api.dto.CreateWeddingInput;
import com.weddingapp.api.dto.UpdateWeddingInput;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.entity.Wedding;
import com.weddingapp.api.repository.WeddingRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Validated
public class WeddingService {
  private WeddingRepository weddingRepository;

  public WeddingService(WeddingRepository weddingRepository) {
    this.weddingRepository = weddingRepository;
  }

  public Wedding createWedding(User user, @Valid CreateWeddingInput input) {
    Wedding wedding = new Wedding(user, input.getTitle(), input.getDescription(), input.getWeddingDate(), input.getVenue(), input.getVenueAddress(), input.getCustomMessage(), input.getThemeColor());
    return weddingRepository.save(wedding);
  }

  public List<Wedding> getWeddingsByUser(Long userId) {
    return weddingRepository.findByUserId(userId);
  }

  public Optional<Wedding> getWeddingById(Long id) {
    return weddingRepository.findById(id);
  }

  public Wedding updateWedding(User user, @Valid UpdateWeddingInput input) {
    Wedding wedding = weddingRepository.findById(input.getId())
        .orElseThrow(() -> new IllegalArgumentException("Wedding not found."));

    if (!wedding.getUser().getId().equals(user.getId())) {
      throw new RuntimeException("You do not have permission to edit this wedding.");
    }

    wedding.setTitle(input.getTitle());
    wedding.setDescription(input.getDescription());
    wedding.setWeddingDate(input.getWeddingDate());
    wedding.setVenue(input.getVenue());
    wedding.setVenueAddress(input.getVenueAddress());
    wedding.setCustomMessage(input.getCustomMessage());
    wedding.setThemeColor(input.getThemeColor());
    wedding.setUpdatedAt(LocalDateTime.now());

    return weddingRepository.save(wedding);
  }

  public boolean deleteWedding(Long weddingId, User user) {
    Wedding wedding = weddingRepository.findById(weddingId)
        .orElseThrow(() -> new IllegalArgumentException("Wedding not found."));

    if (!wedding.getUser().getId().equals(user.getId())) {
      throw new RuntimeException("You do not have permission to delete this wedding.");
    }

    weddingRepository.delete(wedding);
    return true;
  }
}
