package com.weddingapp.api.repository;

import com.weddingapp.api.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

  Optional<PasswordResetToken> findByToken(String token);

  void deleteByUserId(Long userId);
}