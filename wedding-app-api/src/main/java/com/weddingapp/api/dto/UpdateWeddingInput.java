package com.weddingapp.api.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateWeddingInput {

  @NotNull(message = "Wedding ID is required.")
  private Long id;

  @NotBlank(message = "Title is required.")
  @Size(max = 200, message = "Title must be 200 characters or fewer.")
  private String title;

  @Size(max = 500, message = "Description must be 500 characters or fewer.")
  private String description;

  @NotNull(message = "Wedding date is required.")
  @FutureOrPresent(message = "Wedding date must be today or in the future.")
  private LocalDate weddingDate;

  @NotBlank(message = "Venue is required.")
  @Size(max = 300, message = "Venue must be 300 characters or fewer.")
  private String venue;

  @Size(max = 500, message = "Venue address must be 500 characters or fewer.")
  private String venueAddress;

  @Size(max = 2000, message = "Custom message must be 2000 characters or fewer.")
  private String customMessage;

  @Size(min = 7, max = 7, message = "Theme color must be a valid hex code (e.g. #3498db).")
  private String themeColor;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
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
}