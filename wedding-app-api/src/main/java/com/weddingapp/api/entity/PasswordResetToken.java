package com.weddingapp.api.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 36)
  private String token;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private LocalDateTime expiresAt;

  @Column(nullable = false)
  private LocalDateTime createdAt;

  protected PasswordResetToken() {
  }

  public PasswordResetToken(User user) {
    this.user = user;
    this.token = UUID.randomUUID().toString();
    this.expiresAt = LocalDateTime.now().plusHours(1);
    this.createdAt = LocalDateTime.now();
  }

  public Long getId() {
    return id;
  }

  public String getToken() {
    return token;
  }

  public User getUser() {
    return user;
  }

  public LocalDateTime getExpiresAt() {
    return expiresAt;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public boolean isExpired() {
    return LocalDateTime.now().isAfter(expiresAt);
  }
}