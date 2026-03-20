package com.weddingapp.api.controller;

import com.weddingapp.api.dto.CreateWeddingInput;
import com.weddingapp.api.dto.UpdateWeddingInput;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.entity.Wedding;
import com.weddingapp.api.service.AuthenticationService;
import com.weddingapp.api.service.UserService;
import com.weddingapp.api.service.WeddingService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class WeddingController {
  private final WeddingService weddingService;
  private final UserService userService;
  private final AuthenticationService authenticationService;

  public WeddingController(WeddingService weddingService, UserService userService, AuthenticationService authenticationService) {
    this.weddingService = weddingService;
    this.userService = userService;
    this.authenticationService = authenticationService;
  }

  @MutationMapping
  public Wedding createWedding(@Argument CreateWeddingInput input) {
    User user = authenticationService.getAuthenticatedUser();
    return weddingService.createWedding(user, input);
  }

  @QueryMapping
  public Wedding weddingById(@Argument Long id) {
    return weddingService.getWeddingById(id).orElse(null);
  }

  @QueryMapping
  public List<Wedding> myWeddings() {
    User user = authenticationService.getAuthenticatedUser();
    return weddingService.getWeddingsByUser(user.getId());
  }

  @MutationMapping
  public Wedding updateWedding(@Argument UpdateWeddingInput input) {
    User user = authenticationService.getAuthenticatedUser();
    return weddingService.updateWedding(user, input);
  }

  @MutationMapping
  public boolean deleteWedding(@Argument Long id) {
    User user = authenticationService.getAuthenticatedUser();
    return weddingService.deleteWedding(id, user);
  }
}
