package com.weddingapp.api.controller;

import com.weddingapp.api.entity.Guest;
import com.weddingapp.api.service.QRCodeService;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GuestFieldResolver {
  private final QRCodeService qrCodeService;

  public GuestFieldResolver(QRCodeService qrCodeService) {
    this.qrCodeService = qrCodeService;
  }

  @SchemaMapping(typeName = "Guest", field = "qrCode")
  public String qrCode(Guest guest) {
    return qrCodeService.generateInvitationQRCode(guest.getInvitationToken());
  }
}
