package com.weddingapp.api.service;

import com.weddingapp.api.entity.PasswordResetToken;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.repository.PasswordResetTokenRepository;
import com.weddingapp.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {

  private final PasswordResetTokenRepository tokenRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailService emailService;
  private final String appBaseUrl;

  public PasswordResetService(
      PasswordResetTokenRepository tokenRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      EmailService emailService,
      @Value("${app.base-url}") String appBaseUrl
  ) {
    this.tokenRepository = tokenRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.emailService = emailService;
    this.appBaseUrl = appBaseUrl;
  }

  @Transactional
  public boolean requestPasswordReset(String email) {
    User user = userRepository.findByEmail(email).orElse(null);

    if (user == null) {
      return true;
    }

    tokenRepository.deleteByUserId(user.getId());

    PasswordResetToken resetToken = new PasswordResetToken(user);
    tokenRepository.save(resetToken);

    String resetUrl = appBaseUrl + "/reset-password/" + resetToken.getToken();
    emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetUrl);

    return true;
  }

  @Transactional
  public boolean resetPassword(String token, String newPassword) {
    PasswordResetToken resetToken = tokenRepository.findByToken(token)
        .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link."));

    if (resetToken.isExpired()) {
      tokenRepository.delete(resetToken);
      throw new IllegalArgumentException("This reset link has expired. Please request a new one.");
    }

    User user = resetToken.getUser();
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    tokenRepository.delete(resetToken);

    return true;
  }
}