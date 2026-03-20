package com.weddingapp.api.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "guest_preferences")
public class GuestPreference {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "guest_id", nullable = false, unique = true)
  private Guest guest;

  @Column(length = 500)
  private String foodPreference;

  @Column(length = 500)
  private String drinkPreference;

  @Column(length = 500)
  private String musicPreference;

  @Column(length = 1000)
  private String dietaryRestrictions;

  @Column(length = 1000)
  private String additionalNotes;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  protected GuestPreference() {
  }

  public GuestPreference(Guest guest) {
    this.guest = guest;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  public Long getId() {
    return id;
  }

  public Guest getGuest() {
    return guest;
  }

  public String getFoodPreference() {
    return foodPreference;
  }

  public void setFoodPreference(String foodPreference) {
    this.foodPreference = foodPreference;
  }

  public String getDrinkPreference() {
    return drinkPreference;
  }

  public void setDrinkPreference(String drinkPreference) {
    this.drinkPreference = drinkPreference;
  }

  public String getMusicPreference() {
    return musicPreference;
  }

  public void setMusicPreference(String musicPreference) {
    this.musicPreference = musicPreference;
  }

  public String getDietaryRestrictions() {
    return dietaryRestrictions;
  }

  public void setDietaryRestrictions(String dietaryRestrictions) {
    this.dietaryRestrictions = dietaryRestrictions;
  }

  public String getAdditionalNotes() {
    return additionalNotes;
  }

  public void setAdditionalNotes(String additionalNotes) {
    this.additionalNotes = additionalNotes;
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
