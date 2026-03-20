package com.weddingapp.api.controller;

import com.weddingapp.api.dto.AddGuestInput;
import com.weddingapp.api.entity.Guest;
import com.weddingapp.api.entity.RsvpStatus;
import com.weddingapp.api.entity.User;
import com.weddingapp.api.entity.Wedding;
import com.weddingapp.api.service.*;
import org.springframework.core.task.TaskExecutor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class GuestController {
  private final GuestService guestService;
  private final WeddingService weddingService;
  private final UserService userService;
  private final QRCodeService qrCodeService;
  private final EmailService emailService;
  private final AuthenticationService authenticationService;
  private final TaskExecutor taskExecutor;

  public GuestController(GuestService guestService, WeddingService weddingService, UserService userService, QRCodeService qrCodeService, EmailService emailService, AuthenticationService authenticationService, TaskExecutor taskExecutor) {
    this.guestService = guestService;
    this.weddingService = weddingService;
    this.userService = userService;
    this.qrCodeService = qrCodeService;
    this.emailService = emailService;
    this.authenticationService = authenticationService;
    this.taskExecutor = taskExecutor;
  }

  @QueryMapping
  public Guest guestByToken(@Argument String token) {
    return guestService.getGuestByToken(token).orElse(null);
  }

  @QueryMapping
  public List<Guest> guestsByWedding(@Argument Long weddingId) {
    User user = authenticationService.getAuthenticatedUser();
    Wedding wedding = getWeddingAndVerifyOwnership(weddingId, user);

    return guestService.getGuestsByWedding(wedding.getId());
  }

  @MutationMapping
  public Guest addGuest(@Argument AddGuestInput input) {
    User user = authenticationService.getAuthenticatedUser();
    Wedding wedding = getWeddingAndVerifyOwnership(input.getWeddingId(), user);

    return guestService.addGuest(wedding, input);
  }

  @MutationMapping
  public Guest updateRsvpStatus(@Argument Long guestId, @Argument RsvpStatus rsvpStatus) {
    return guestService.updateRsvpStatus(guestId, rsvpStatus);
  }

  @MutationMapping
  public Guest respondToInvitation(@Argument String token, @Argument RsvpStatus status) {
    return guestService.updateRsvpStatusByToken(token, status);
  }

  @MutationMapping
  public Guest sendInvitation(@Argument Long guestId) {
    User user = authenticationService.getAuthenticatedUser();

    Guest guest = guestService.getGuestById(guestId).orElseThrow(() -> new IllegalArgumentException("Guest not found."));

    Wedding wedding = guest.getWedding();

    if (!wedding.getUser().getId().equals(user.getId())) {
      throw new RuntimeException("You do not have permission to manage this wedding.");
    }

    String qrCode = qrCodeService.generateInvitationQRCode(guest.getInvitationToken());

    emailService.sendInvitationEmail(
        guest.getEmail(),
        guest.getFirstName(),
        wedding.getTitle(),
        wedding.getWeddingDate().toString(),
        wedding.getVenue(),
        guest.getInvitationToken(),
        qrCode,
        wedding.getCustomMessage(),
        wedding.getThemeColor()
    );

    return guest;
  }

  @MutationMapping
  public List<Guest> sendAllInvitations(@Argument Long weddingId) {
    User user = authenticationService.getAuthenticatedUser();
    Wedding wedding = getWeddingAndVerifyOwnership(weddingId, user);

    List<Guest> guests = guestService.getGuestsByWedding(wedding.getId());

    for (Guest guest : guests) {
      taskExecutor.execute(() -> {
        String qrCode = qrCodeService.generateInvitationQRCode(guest.getInvitationToken());

        emailService.sendInvitationEmail(
            guest.getEmail(),
            guest.getFirstName(),
            wedding.getTitle(),
            wedding.getWeddingDate().toString(),
            wedding.getVenue(),
            guest.getInvitationToken(),
            qrCode,
            wedding.getCustomMessage(),
            wedding.getThemeColor()
        );
      });
    }

    return guests;
  }

  private Wedding getWeddingAndVerifyOwnership(Long weddingId, User user) {
    Wedding wedding = weddingService.getWeddingById(weddingId).orElseThrow(() -> new IllegalArgumentException("Wedding not found."));

    if (!wedding.getUser().getId().equals(user.getId())) {
      throw new RuntimeException("You do not have permission to manage this wedding.");
    }

    return wedding;
  }

  @MutationMapping
  public boolean deleteGuest(@Argument Long guestId) {
    User user = authenticationService.getAuthenticatedUser();

    Guest guest = guestService.getGuestById(guestId)
        .orElseThrow(() -> new RuntimeException("Guest not found."));

    Wedding wedding = guest.getWedding();

    if (!wedding.getUser().getId().equals(user.getId())) {
      throw new RuntimeException("You do not have permission to manage this wedding.");
    }

    return guestService.deleteGuest(guestId);
  }
}
