package com.weddingapp.api.service;

import com.weddingapp.api.dto.AddGuestInput;
import com.weddingapp.api.entity.Guest;
import com.weddingapp.api.entity.RsvpStatus;
import com.weddingapp.api.entity.Wedding;
import com.weddingapp.api.repository.GuestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuestServiceTest {

  @Mock
  private GuestRepository guestRepository;

  @InjectMocks
  private GuestService guestService;

  private Wedding wedding;
  private Guest guest;
  private AddGuestInput validInput;

  @BeforeEach
  void setUp() {
    wedding = mock(Wedding.class);

    guest = new Guest(wedding, "Alice", "Smith", "alice@example.com");

    validInput = new AddGuestInput();
    validInput.setWeddingId(1L);
    validInput.setFirstName("Alice");
    validInput.setLastName("Smith");
    validInput.setEmail("alice@example.com");
  }

  @Nested
  @DisplayName("addGuest")
  class AddGuest {

    @Test
    @DisplayName("should add guest successfully")
    void shouldAddGuest() {
      when(wedding.getId()).thenReturn(1L);
      when(guestRepository.existsByWeddingIdAndEmail(1L, "alice@example.com"))
          .thenReturn(false);
      when(guestRepository.save(any(Guest.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Guest result = guestService.addGuest(wedding, validInput);

      assertNotNull(result);
      assertEquals("Alice", result.getFirstName());
      assertEquals("Smith", result.getLastName());
      assertEquals("alice@example.com", result.getEmail());
      assertNotNull(result.getInvitationToken());

      verify(guestRepository).save(any(Guest.class));
    }

    @Test
    @DisplayName("should throw when duplicate email in same wedding")
    void shouldThrowWhenDuplicateEmail() {
      when(wedding.getId()).thenReturn(1L);
      when(guestRepository.existsByWeddingIdAndEmail(1L, "alice@example.com"))
          .thenReturn(true);

      IllegalArgumentException exception = assertThrows(
          IllegalArgumentException.class,
          () -> guestService.addGuest(wedding, validInput)
      );

      assertEquals(
          "A guest with this email already exists.",
          exception.getMessage()
      );
      verify(guestRepository, never()).save(any(Guest.class));
    }
  }

  @Nested
  @DisplayName("getGuestsByWedding")
  class GetGuestsByWedding {

    @Test
    @DisplayName("should return guests for a wedding")
    void shouldReturnGuests() {
      Guest guest2 = new Guest(wedding, "Bob", "Jones", "bob@example.com");
      when(guestRepository.findByWeddingId(1L)).thenReturn(List.of(guest, guest2));

      List<Guest> result = guestService.getGuestsByWedding(1L);

      assertEquals(2, result.size());
    }

    @Test
    @DisplayName("should return empty list when no guests")
    void shouldReturnEmptyList() {
      when(guestRepository.findByWeddingId(1L)).thenReturn(List.of());

      List<Guest> result = guestService.getGuestsByWedding(1L);

      assertTrue(result.isEmpty());
    }
  }

  @Nested
  @DisplayName("getGuestByToken")
  class GetGuestByToken {

    @Test
    @DisplayName("should return guest when token is valid")
    void shouldReturnGuestByToken() {
      String token = guest.getInvitationToken();
      when(guestRepository.findByInvitationToken(token))
          .thenReturn(Optional.of(guest));

      Optional<Guest> result = guestService.getGuestByToken(token);

      assertTrue(result.isPresent());
      assertEquals("Alice", result.get().getFirstName());
    }

    @Test
    @DisplayName("should return empty when token is invalid")
    void shouldReturnEmptyForInvalidToken() {
      when(guestRepository.findByInvitationToken("invalid-token"))
          .thenReturn(Optional.empty());

      Optional<Guest> result = guestService.getGuestByToken("invalid-token");

      assertTrue(result.isEmpty());
    }
  }

  @Nested
  @DisplayName("updateRsvpStatusByToken")
  class UpdateRsvpStatusByToken {

    @Test
    @DisplayName("should update RSVP status")
    void shouldUpdateRsvpStatus() {
      String token = guest.getInvitationToken();
      when(guestRepository.findByInvitationToken(token))
          .thenReturn(Optional.of(guest));
      when(guestRepository.save(any(Guest.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Guest result = guestService.updateRsvpStatusByToken(token, RsvpStatus.ACCEPTED);

      assertEquals(RsvpStatus.ACCEPTED, result.getRsvpStatus());
      verify(guestRepository).save(guest);
    }

    @Test
    @DisplayName("should throw when token not found")
    void shouldThrowWhenTokenNotFound() {
      when(guestRepository.findByInvitationToken("invalid-token"))
          .thenReturn(Optional.empty());

      assertThrows(
          RuntimeException.class,
          () -> guestService.updateRsvpStatusByToken("invalid-token", RsvpStatus.ACCEPTED)
      );

      verify(guestRepository, never()).save(any(Guest.class));
    }
  }

  @Nested
  @DisplayName("deleteGuest")
  class DeleteGuest {

    @Test
    @DisplayName("should delete guest successfully")
    void shouldDeleteGuest() {
      when(guestRepository.findById(1L)).thenReturn(Optional.of(guest));

      boolean result = guestService.deleteGuest(1L);

      assertTrue(result);
      verify(guestRepository).delete(guest);
    }

    @Test
    @DisplayName("should throw when guest not found")
    void shouldThrowWhenGuestNotFound() {
      when(guestRepository.findById(99L)).thenReturn(Optional.empty());

      assertThrows(
          IllegalArgumentException.class,
          () -> guestService.deleteGuest(99L)
      );

      verify(guestRepository, never()).delete(any(Guest.class));
    }
  }
}