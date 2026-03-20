package com.weddingapp.api.controller;

import com.weddingapp.api.dto.LoginUserInput;
import com.weddingapp.api.dto.RegisterUserInput;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.service.AuthenticationService;
import com.weddingapp.api.service.JwtService;
import com.weddingapp.api.service.UserService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.Optional;

@Controller
public class UserController {
  private final UserService userService;
  private final JwtService jwtService;
  private final AuthenticationService authenticationService;

  public UserController(UserService userService, JwtService jwtService, AuthenticationService authenticationService) {
    this.userService = userService;
    this.jwtService = jwtService;
    this.authenticationService = authenticationService;
  }

  @QueryMapping
  public User me() {
    if (!authenticationService.isAuthenticated()) {
      return null;
    }

    String email = authenticationService.getAuthenticatedUser().getEmail();
    return userService.findUserByEmail(email).orElse(null);
  }

  @QueryMapping
  public User userById(@Argument Long id) {
    Optional<User> user = userService.findUserById(id);
    return user.orElse(null);
  }

  @QueryMapping
  public User userByEmail(@Argument String email) {
    Optional<User> user = userService.findUserByEmail(email);
    return user.orElse(null);
  }

  @MutationMapping
  public Map<String, Object> registerUser(@Argument RegisterUserInput input) {
    User user = userService.registerUser(input);
    String token = jwtService.generateToken(user.getId(), user.getEmail());

    return Map.of("token", token, "user", user);
  }

  @MutationMapping
  public Map<String, Object> loginUser(@Argument LoginUserInput input) {
    User user = userService.authenticateUser(input);
    String token = jwtService.generateToken(user.getId(), user.getEmail());

    return Map.of("token", token, "user", user);
  }
}
