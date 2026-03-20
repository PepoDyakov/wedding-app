package com.weddingapp.api.repository;

import com.weddingapp.api.entity.GuestPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuestPreferenceRepository extends JpaRepository<GuestPreference, Long> {
  Optional<GuestPreference> findByGuestId(Long guestId);

  boolean existsByGuestId(Long guestId);
}
