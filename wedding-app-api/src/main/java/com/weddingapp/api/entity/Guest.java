package com.weddingapp.api.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "guests")
public class Guest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "wedding_id", nullable = false)
  private Wedding wedding;

  @Column(nullable = false, length = 100)
  private String firstName;

  @Column(nullable = false, length = 100)
  private String lastName;

  @Column(nullable = false, length = 255)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private RsvpStatus rsvpStatus;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @Column(nullable = false, unique = true, length = 36)
  private String invitationToken;

  protected Guest() {
  }

  public Guest(Wedding wedding, String firstName, String lastName, String email) {
    this.wedding = wedding;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.rsvpStatus = RsvpStatus.PENDING;
    this.invitationToken = UUID.randomUUID().toString();
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  public Long getId() {
    return id;
  }

  public Wedding getWedding() {
    return wedding;
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

  public RsvpStatus getRsvpStatus() {
    return rsvpStatus;
  }

  public void setRsvpStatus(RsvpStatus rsvpStatus) {
    this.rsvpStatus = rsvpStatus;
  }

  public String getInvitationToken() {
    return invitationToken;
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
