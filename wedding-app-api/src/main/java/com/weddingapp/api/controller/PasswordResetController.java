package com.weddingapp.api.controller;

import com.weddingapp.api.service.PasswordResetService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class PasswordResetController {

  private final PasswordResetService passwordResetService;

  public PasswordResetController(PasswordResetService passwordResetService) {
    this.passwordResetService = passwordResetService;
  }

  @MutationMapping
  public boolean requestPasswordReset(@Argument String email) {
    return passwordResetService.requestPasswordReset(email);
  }

  @MutationMapping
  public boolean resetPassword(@Argument String token, @Argument String newPassword) {
    return passwordResetService.resetPassword(token, newPassword);
  }
}