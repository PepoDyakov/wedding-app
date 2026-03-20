package com.weddingapp.api.controller;

import com.weddingapp.api.dto.SubmitPreferencesInput;
import com.weddingapp.api.entity.GuestPreference;
import com.weddingapp.api.service.GuestPreferenceService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GuestPreferenceController {
  private final GuestPreferenceService guestPreferenceService;

  public GuestPreferenceController(GuestPreferenceService guestPreferenceService) {
    this.guestPreferenceService = guestPreferenceService;
  }

  @QueryMapping
  public GuestPreference guestPreferences(@Argument String token) {
    return guestPreferenceService.getPreferencesByToken(token).orElse(null);
  }

  @MutationMapping
  public GuestPreference submitPreferences(@Argument SubmitPreferencesInput input) {
    return guestPreferenceService.submitPreferences(input);
  }
}
