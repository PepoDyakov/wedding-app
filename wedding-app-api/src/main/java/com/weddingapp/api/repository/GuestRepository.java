package com.weddingapp.api.repository;

import com.weddingapp.api.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Long> {
  List<Guest> findByWeddingId(Long weddingId);

  boolean existsByWeddingIdAndEmail(Long weddingId, String email);

  Optional<Guest> findByInvitationToken(String invitationToken);
}
