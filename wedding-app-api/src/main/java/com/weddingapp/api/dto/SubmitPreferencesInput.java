package com.weddingapp.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SubmitPreferencesInput {

  @NotBlank(message = "Invitation token is required.")
  private String token;

  @Size(max = 500, message = "Food preference must be 500 characters or fewer.")
  private String foodPreference;

  @Size(max = 500, message = "Drink preference must be 500 characters or fewer.")
  private String drinkPreference;

  @Size(max = 500, message = "Music preference must be 500 characters or fewer.")
  private String musicPreference;

  @Size(max = 1000, message = "Dietary restrictions must be 1000 characters or fewer.")
  private String dietaryRestrictions;

  @Size(max = 1000, message = "Additional notes must be 1000 characters or fewer.")
  private String additionalNotes;

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
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
}