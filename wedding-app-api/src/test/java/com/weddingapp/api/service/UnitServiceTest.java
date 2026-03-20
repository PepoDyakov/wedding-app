package com.weddingapp.api.service;

import com.weddingapp.api.dto.LoginUserInput;
import com.weddingapp.api.dto.RegisterUserInput;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @InjectMocks
  private UserService userService;

  private RegisterUserInput validRegisterInput;
  private LoginUserInput validLoginInput;
  private User existingUser;

  @BeforeEach
  void setUp() {
    validRegisterInput = new RegisterUserInput();
    validRegisterInput.setFirstName("John");
    validRegisterInput.setLastName("Doe");
    validRegisterInput.setEmail("john@example.com");
    validRegisterInput.setPassword("password123");

    validLoginInput = new LoginUserInput();
    validLoginInput.setEmail("john@example.com");
    validLoginInput.setPassword("password123");

    existingUser = new User("John", "Doe", "john@example.com", "hashedPassword");
  }

  @Nested
  @DisplayName("registerUser")
  class RegisterUser {

    @Test
    @DisplayName("should register a new user successfully")
    void shouldRegisterNewUser() {
      when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
      when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
      when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

      User result = userService.registerUser(validRegisterInput);

      assertNotNull(result);
      assertEquals("John", result.getFirstName());
      assertEquals("Doe", result.getLastName());
      assertEquals("john@example.com", result.getEmail());

      verify(userRepository).existsByEmail("john@example.com");
      verify(passwordEncoder).encode("password123");
      verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("should throw exception when email already exists")
    void shouldThrowWhenEmailExists() {
      when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

      IllegalArgumentException exception = assertThrows(
          IllegalArgumentException.class,
          () -> userService.registerUser(validRegisterInput)
      );

      assertEquals("A user with this email already exists.", exception.getMessage());
      verify(userRepository, never()).save(any(User.class));
    }
  }

  @Nested
  @DisplayName("authenticateUser")
  class AuthenticateUser {

    @Test
    @DisplayName("should authenticate user with valid credentials")
    void shouldAuthenticateWithValidCredentials() {
      when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(existingUser));
      when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

      User result = userService.authenticateUser(validLoginInput);

      assertNotNull(result);
      assertEquals("john@example.com", result.getEmail());
    }

    @Test
    @DisplayName("should throw exception when email not found")
    void shouldThrowWhenEmailNotFound() {
      when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());

      IllegalArgumentException exception = assertThrows(
          IllegalArgumentException.class,
          () -> userService.authenticateUser(validLoginInput)
      );

      assertEquals("Invalid email or password.", exception.getMessage());
    }

    @Test
    @DisplayName("should throw exception when password is wrong")
    void shouldThrowWhenPasswordWrong() {
      when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(existingUser));
      when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(false);

      IllegalArgumentException exception = assertThrows(
          IllegalArgumentException.class,
          () -> userService.authenticateUser(validLoginInput)
      );

      assertEquals("Invalid email or password.", exception.getMessage());
    }
  }

  @Nested
  @DisplayName("findUserByEmail")
  class FindUserByEmail {

    @Test
    @DisplayName("should return user when found")
    void shouldReturnUserWhenFound() {
      when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(existingUser));

      Optional<User> result = userService.findUserByEmail("john@example.com");

      assertTrue(result.isPresent());
      assertEquals("john@example.com", result.get().getEmail());
    }

    @Test
    @DisplayName("should return empty when not found")
    void shouldReturnEmptyWhenNotFound() {
      when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

      Optional<User> result = userService.findUserByEmail("unknown@example.com");

      assertTrue(result.isEmpty());
    }
  }

  @Nested
  @DisplayName("findUserById")
  class FindUserById {

    @Test
    @DisplayName("should return user when found")
    void shouldReturnUserWhenFound() {
      when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));

      Optional<User> result = userService.findUserById(1L);

      assertTrue(result.isPresent());
      assertEquals("John", result.get().getFirstName());
    }

    @Test
    @DisplayName("should return empty when not found")
    void shouldReturnEmptyWhenNotFound() {
      when(userRepository.findById(99L)).thenReturn(Optional.empty());

      Optional<User> result = userService.findUserById(99L);

      assertTrue(result.isEmpty());
    }
  }
}