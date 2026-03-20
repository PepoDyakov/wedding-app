package com.weddingapp.api.service;

import com.weddingapp.api.dto.AddGuestInput;
import com.weddingapp.api.entity.Guest;
import com.weddingapp.api.entity.RsvpStatus;
import com.weddingapp.api.entity.Wedding;
import com.weddingapp.api.repository.GuestRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Validated
public class GuestService {
  private final GuestRepository guestRepository;

  public GuestService(GuestRepository guestRepository) {
    this.guestRepository = guestRepository;
  }

  public Guest addGuest(Wedding wedding, @Valid AddGuestInput input) {
    if (guestRepository.existsByWeddingIdAndEmail(wedding.getId(), input.getEmail())) {
      throw new IllegalArgumentException("A guest with this email already exists.");
    }

    Guest guest = new Guest(wedding, input.getFirstName(), input.getLastName(), input.getEmail());
    return guestRepository.save(guest);
  }

  public List<Guest> getGuestsByWedding(Long weddingId) {
    return guestRepository.findByWeddingId(weddingId);
  }

  public Optional<Guest> getGuestById(Long id) {
    return guestRepository.findById(id);
  }

  public Optional<Guest> getGuestByToken(String invitationToken) {
    return guestRepository.findByInvitationToken(invitationToken);
  }

  public Guest updateRsvpStatus(Long guestId, RsvpStatus rsvpStatus) {
    Guest guest = guestRepository.findById(guestId).orElseThrow(() -> new IllegalArgumentException("Guest not found."));

    guest.setRsvpStatus(rsvpStatus);
    guest.setUpdatedAt(LocalDateTime.now());

    return guestRepository.save(guest);
  }

  public Guest updateRsvpStatusByToken(String invitationToken, RsvpStatus status) {
    Guest guest = guestRepository.findByInvitationToken(invitationToken)
        .orElseThrow(() -> new IllegalArgumentException("Invalid invitation token."));

    guest.setRsvpStatus(status);
    guest.setUpdatedAt(LocalDateTime.now());

    return guestRepository.save(guest);
  }

  public boolean deleteGuest(Long guestId) {
    Guest guest = guestRepository.findById(guestId)
        .orElseThrow(() -> new IllegalArgumentException("Guest not found."));

    guestRepository.delete(guest);
    return true;
  }
}
