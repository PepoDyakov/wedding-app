package com.weddingapp.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AddGuestInput {

  @NotNull(message = "Wedding ID is required.")
  private Long weddingId;

  @NotBlank(message = "First name is required.")
  @Size(max = 100, message = "First name must be 100 characters or fewer.")
  private String firstName;

  @NotBlank(message = "Last name is required.")
  @Size(max = 100, message = "Last name must be 100 characters or fewer.")
  private String lastName;

  @NotBlank(message = "Email is required.")
  @Email(message = "Please provide a valid email address.")
  @Size(max = 255, message = "Email must be 255 characters or fewer.")
  private String email;

  public Long getWeddingId() {
    return weddingId;
  }

  public void setWeddingId(Long weddingId) {
    this.weddingId = weddingId;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
}