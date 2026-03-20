package com.weddingapp.api.service;

import com.weddingapp.api.dto.CreateWeddingInput;
import com.weddingapp.api.dto.UpdateWeddingInput;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.entity.Wedding;
import com.weddingapp.api.repository.WeddingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeddingServiceTest {

  @Mock
  private WeddingRepository weddingRepository;

  @InjectMocks
  private WeddingService weddingService;

  private User user;
  private CreateWeddingInput createInput;

  @BeforeEach
  void setUp() {
    user = mock(User.class);

    createInput = new CreateWeddingInput();
    createInput.setTitle("John & Jane's Wedding");
    createInput.setWeddingDate(LocalDate.of(2026, 9, 20));
    createInput.setVenue("Rose Garden Estate");
    createInput.setDescription("A beautiful ceremony");
    createInput.setVenueAddress("123 Garden Lane");
    createInput.setCustomMessage("We'd love to see you there!");
    createInput.setThemeColor("#e74c3c");
  }

  @Nested
  @DisplayName("createWedding")
  class CreateWedding {

    @Test
    @DisplayName("should create wedding successfully")
    void shouldCreateWedding() {
      when(weddingRepository.save(any(Wedding.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Wedding result = weddingService.createWedding(user, createInput);

      assertNotNull(result);
      assertEquals("John & Jane's Wedding", result.getTitle());
      assertEquals(LocalDate.of(2026, 9, 20), result.getWeddingDate());
      assertEquals("Rose Garden Estate", result.getVenue());
      assertEquals("A beautiful ceremony", result.getDescription());
      assertEquals("#e74c3c", result.getThemeColor());

      verify(weddingRepository).save(any(Wedding.class));
    }

    @Test
    @DisplayName("should create wedding with only required fields")
    void shouldCreateWeddingWithRequiredFieldsOnly() {
      CreateWeddingInput minimalInput = new CreateWeddingInput();
      minimalInput.setTitle("Simple Wedding");
      minimalInput.setWeddingDate(LocalDate.of(2026, 12, 25));
      minimalInput.setVenue("City Hall");

      when(weddingRepository.save(any(Wedding.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Wedding result = weddingService.createWedding(user, minimalInput);

      assertNotNull(result);
      assertEquals("Simple Wedding", result.getTitle());
      assertNull(result.getDescription());
      assertNull(result.getCustomMessage());
      assertNull(result.getThemeColor());
    }
  }

  @Nested
  @DisplayName("updateWedding")
  class UpdateWedding {

    private UpdateWeddingInput updateInput;
    private Wedding existingWedding;

    @BeforeEach
    void setUp() {
      updateInput = new UpdateWeddingInput();
      updateInput.setId(1L);
      updateInput.setTitle("Updated Title");
      updateInput.setWeddingDate(LocalDate.of(2026, 9, 20));
      updateInput.setVenue("New Venue");
      updateInput.setDescription("Updated description");
    }

    @Test
    @DisplayName("should update wedding successfully")
    void shouldUpdateWedding() {
      when(user.getId()).thenReturn(1L);
      existingWedding = new Wedding(user, "Original Title", null,
          LocalDate.of(2026, 6, 15), "Old Venue", null, null, null);

      when(weddingRepository.findById(1L)).thenReturn(Optional.of(existingWedding));
      when(weddingRepository.save(any(Wedding.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Wedding result = weddingService.updateWedding(user, updateInput);

      assertEquals("Updated Title", result.getTitle());
      assertEquals("New Venue", result.getVenue());
      assertEquals("Updated description", result.getDescription());

      verify(weddingRepository).save(existingWedding);
    }

    @Test
    @DisplayName("should throw when wedding not found")
    void shouldThrowWhenWeddingNotFound() {
      when(weddingRepository.findById(1L)).thenReturn(Optional.empty());

      assertThrows(
          IllegalArgumentException.class,
          () -> weddingService.updateWedding(user, updateInput)
      );

      verify(weddingRepository, never()).save(any(Wedding.class));
    }

    @Test
    @DisplayName("should throw when user does not own wedding")
    void shouldThrowWhenNotOwner() {
      when(user.getId()).thenReturn(1L);
      existingWedding = new Wedding(user, "Original Title", null,
          LocalDate.of(2026, 6, 15), "Old Venue", null, null, null);

      User otherUser = mock(User.class);
      when(otherUser.getId()).thenReturn(2L);

      when(weddingRepository.findById(1L)).thenReturn(Optional.of(existingWedding));

      assertThrows(
          RuntimeException.class,
          () -> weddingService.updateWedding(otherUser, updateInput)
      );

      verify(weddingRepository, never()).save(any(Wedding.class));
    }
  }

  @Nested
  @DisplayName("deleteWedding")
  class DeleteWedding {

    @Test
    @DisplayName("should delete wedding successfully")
    void shouldDeleteWedding() {
      when(user.getId()).thenReturn(1L);
      Wedding existingWedding = new Wedding(user, "My Wedding", null,
          LocalDate.of(2026, 6, 15), "Venue", null, null, null);

      when(weddingRepository.findById(1L)).thenReturn(Optional.of(existingWedding));

      boolean result = weddingService.deleteWedding(1L, user);

      assertTrue(result);
      verify(weddingRepository).delete(existingWedding);
    }

    @Test
    @DisplayName("should throw when wedding not found")
    void shouldThrowWhenWeddingNotFound() {
      when(weddingRepository.findById(99L)).thenReturn(Optional.empty());

      assertThrows(
          IllegalArgumentException.class,
          () -> weddingService.deleteWedding(99L, user)
      );

      verify(weddingRepository, never()).delete(any(Wedding.class));
    }

    @Test
    @DisplayName("should throw when user does not own wedding")
    void shouldThrowWhenNotOwner() {
      when(user.getId()).thenReturn(1L);
      Wedding existingWedding = new Wedding(user, "My Wedding", null,
          LocalDate.of(2026, 6, 15), "Venue", null, null, null);

      User otherUser = mock(User.class);
      when(otherUser.getId()).thenReturn(2L);

      when(weddingRepository.findById(1L)).thenReturn(Optional.of(existingWedding));

      assertThrows(
          RuntimeException.class,
          () -> weddingService.deleteWedding(1L, otherUser)
      );

      verify(weddingRepository, never()).delete(any(Wedding.class));
    }
  }

  @Nested
  @DisplayName("getWeddingsByUser")
  class GetWeddingsByUser {

    @Test
    @DisplayName("should return weddings for user")
    void shouldReturnWeddings() {
      Wedding wedding1 = new Wedding(user, "Wedding 1", null,
          LocalDate.of(2026, 6, 15), "Venue 1", null, null, null);
      Wedding wedding2 = new Wedding(user, "Wedding 2", null,
          LocalDate.of(2026, 9, 20), "Venue 2", null, null, null);

      when(weddingRepository.findByUserId(1L)).thenReturn(List.of(wedding1, wedding2));

      List<Wedding> result = weddingService.getWeddingsByUser(1L);

      assertEquals(2, result.size());
    }

    @Test
    @DisplayName("should return empty list when no weddings")
    void shouldReturnEmptyList() {
      when(weddingRepository.findByUserId(1L)).thenReturn(List.of());

      List<Wedding> result = weddingService.getWeddingsByUser(1L);

      assertTrue(result.isEmpty());
    }
  }

  @Nested
  @DisplayName("getWeddingById")
  class GetWeddingById {

    @Test
    @DisplayName("should return wedding when found")
    void shouldReturnWedding() {
      Wedding wedding = new Wedding(user, "My Wedding", null,
          LocalDate.of(2026, 6, 15), "Venue", null, null, null);

      when(weddingRepository.findById(1L)).thenReturn(Optional.of(wedding));

      Optional<Wedding> result = weddingService.getWeddingById(1L);

      assertTrue(result.isPresent());
      assertEquals("My Wedding", result.get().getTitle());
    }

    @Test
    @DisplayName("should return empty when not found")
    void shouldReturnEmpty() {
      when(weddingRepository.findById(99L)).thenReturn(Optional.empty());

      Optional<Wedding> result = weddingService.getWeddingById(99L);

      assertTrue(result.isEmpty());
    }
  }
}