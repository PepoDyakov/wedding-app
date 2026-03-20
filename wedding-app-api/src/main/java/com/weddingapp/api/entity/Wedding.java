package com.weddingapp.api.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weddings")
public class Wedding {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private String title;

  @Column(length = 500)
  private String description;

  @Column(nullable = false)
  private LocalDate weddingDate;

  @Column(nullable = false, length = 300)
  private String venue;

  @Column(length = 500)
  private String venueAddress;

  @Column(length = 2000)
  private String customMessage;

  @Column(length = 7)
  private String themeColor;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  protected Wedding() {
  }

  public Wedding(User user, String title, String description, LocalDate weddingDate,
                 String venue, String venueAddress, String customMessage, String themeColor) {
    this.user = user;
    this.title = title;
    this.description = description;
    this.weddingDate = weddingDate;
    this.venue = venue;
    this.venueAddress = venueAddress;
    this.customMessage = customMessage;
    this.themeColor = themeColor;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  public Long getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public LocalDate getWeddingDate() {
    return weddingDate;
  }

  public void setWeddingDate(LocalDate weddingDate) {
    this.weddingDate = weddingDate;
  }

  public String getVenue() {
    return venue;
  }

  public void setVenue(String venue) {
    this.venue = venue;
  }

  public String getVenueAddress() {
    return venueAddress;
  }

  public void setVenueAddress(String venueAddress) {
    this.venueAddress = venueAddress;
  }

  public String getCustomMessage() {
    return customMessage;
  }

  public void setCustomMessage(String customMessage) {
    this.customMessage = customMessage;
  }

  public String getThemeColor() {
    return themeColor;
  }

  public void setThemeColor(String themeColor) {
    this.themeColor = themeColor;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
