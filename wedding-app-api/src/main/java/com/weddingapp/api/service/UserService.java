package com.weddingapp.api.service;

import com.weddingapp.api.dto.LoginUserInput;
import com.weddingapp.api.dto.RegisterUserInput;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.Optional;

@Service
@Validated
public class UserService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public User registerUser(@Valid RegisterUserInput input) {
    if (userRepository.existsByEmail(input.getEmail())) {
      throw new IllegalArgumentException("A user with this email already exists.");
    }

    String passwordHash = passwordEncoder.encode(input.getPassword());
    User user = new User(input.getFirstName(), input.getLastName(), input.getEmail(), passwordHash);

    return userRepository.save(user);
  }

  public User authenticateUser(@Valid LoginUserInput input) {
    User user = userRepository.findByEmail(input.getEmail()).orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

    if (!passwordEncoder.matches(input.getPassword(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid email or password.");
    }

    return user;
  }

  public Optional<User> findUserById(Long id) {
    return userRepository.findById(id);
  }

  public Optional<User> findUserByEmail(String email) {
    return userRepository.findByEmail(email);
  }
}
