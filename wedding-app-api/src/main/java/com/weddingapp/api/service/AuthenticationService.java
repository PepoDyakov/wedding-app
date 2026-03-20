package com.weddingapp.api.service;

import com.weddingapp.api.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

  private final UserService userService;

  public AuthenticationService(UserService userService) {
    this.userService = userService;
  }

  public User getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()
        || authentication.getPrincipal().equals("anonymousUser")) {
      throw new RuntimeException("You must be logged in to perform this action.");
    }

    String email = authentication.getPrincipal().toString();
    return userService.findUserByEmail(email)
        .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
  }

  public boolean isAuthenticated() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication != null
        && authentication.isAuthenticated()
        && !authentication.getPrincipal().equals("anonymousUser");
  }
}