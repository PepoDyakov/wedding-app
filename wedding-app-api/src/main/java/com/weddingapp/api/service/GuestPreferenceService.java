package com.weddingapp.api.service;

import com.weddingapp.api.dto.SubmitPreferencesInput;
import com.weddingapp.api.entity.Guest;
import com.weddingapp.api.entity.GuestPreference;
import com.weddingapp.api.repository.GuestPreferenceRepository;
import com.weddingapp.api.repository.GuestRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Validated
public class GuestPreferenceService {
  private final GuestPreferenceRepository guestPreferenceRepository;
  private final GuestRepository guestRepository;

  public GuestPreferenceService(GuestPreferenceRepository guestPreferenceRepository, GuestRepository guestRepository) {
    this.guestPreferenceRepository = guestPreferenceRepository;
    this.guestRepository = guestRepository;
  }

  public GuestPreference submitPreferences(@Valid SubmitPreferencesInput input) {
    Guest guest = guestRepository.findByInvitationToken(input.getToken()).orElseThrow(() -> new IllegalArgumentException("Invalid invitation token"));

    GuestPreference preference = guestPreferenceRepository.findByGuestId(guest.getId()).orElse(new GuestPreference(guest));

    preference.setFoodPreference(input.getFoodPreference());
    preference.setDrinkPreference(input.getDrinkPreference());
    preference.setMusicPreference(input.getMusicPreference());
    preference.setDietaryRestrictions(input.getDietaryRestrictions());
    preference.setAdditionalNotes(input.getAdditionalNotes());
    preference.setUpdatedAt(LocalDateTime.now());

    return guestPreferenceRepository.save(preference);
  }

  public Optional<GuestPreference> getPreferencesByToken(String invitationToken) {
    Guest guest = guestRepository.findByInvitationToken(invitationToken).orElseThrow(() -> new IllegalArgumentException("Invalid invitation token"));

    return guestPreferenceRepository.findByGuestId(guest.getId());
  }
}
