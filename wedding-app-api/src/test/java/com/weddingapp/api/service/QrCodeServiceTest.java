package com.weddingapp.api.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class QrCodeServiceTest {

  private final QRCodeService qrCodeService = new QRCodeService("http://localhost:3000");

  @Test
  @DisplayName("should generate a valid Base64 PNG string")
  void shouldGenerateValidBase64() {
    String result = qrCodeService.generateInvitationQRCode("test-token-123");

    assertNotNull(result);
    assertFalse(result.isEmpty());

    byte[] decoded = Base64.getDecoder().decode(result);
    assertTrue(decoded.length > 0);

    // PNG files start with these magic bytes
    assertEquals((byte) 0x89, decoded[0]);
    assertEquals((byte) 0x50, decoded[1]); // P
    assertEquals((byte) 0x4E, decoded[2]); // N
    assertEquals((byte) 0x47, decoded[3]); // G
  }

  @Test
  @DisplayName("should generate different QR codes for different tokens")
  void shouldGenerateDifferentQrCodes() {
    String qr1 = qrCodeService.generateInvitationQRCode("token-aaa");
    String qr2 = qrCodeService.generateInvitationQRCode("token-bbb");

    assertNotEquals(qr1, qr2);
  }

  @Test
  @DisplayName("should generate consistent QR code for same token")
  void shouldGenerateConsistentQrCode() {
    String qr1 = qrCodeService.generateInvitationQRCode("same-token");
    String qr2 = qrCodeService.generateInvitationQRCode("same-token");

    assertEquals(qr1, qr2);
  }
}