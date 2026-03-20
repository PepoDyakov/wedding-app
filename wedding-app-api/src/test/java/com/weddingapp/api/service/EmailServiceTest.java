package com.weddingapp.api.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

  @Mock
  private JavaMailSender mailSender;

  private EmailService emailService;

  @BeforeEach
  void setUp() {
    emailService = new EmailService(mailSender, "invitations@weddingapp.com", "http://localhost:3000");
  }

  @Test
  @DisplayName("should send invitation email")
  void shouldSendInvitationEmail() {
    MimeMessage mimeMessage = mock(MimeMessage.class);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

    emailService.sendInvitationEmail(
        "alice@example.com",
        "Alice",
        "John & Jane's Wedding",
        "2026-09-20",
        "Rose Garden Estate",
        "test-token-123",
        "fakeBase64QrCode",
        "Join us for our special day!",
        "#e74c3c"
    );

    verify(mailSender).createMimeMessage();
    verify(mailSender).send(mimeMessage);
  }

  @Test
  @DisplayName("should send email with default theme color when null")
  void shouldSendWithDefaultThemeColor() {
    MimeMessage mimeMessage = mock(MimeMessage.class);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

    emailService.sendInvitationEmail(
        "bob@example.com",
        "Bob",
        "Wedding",
        "2026-12-25",
        "City Hall",
        "token-456",
        "fakeBase64",
        null,
        null
    );

    verify(mailSender).send(mimeMessage);
  }

  @Test
  @DisplayName("should throw RuntimeException when sending fails")
  void shouldThrowWhenSendingFails() {
    MimeMessage mimeMessage = mock(MimeMessage.class);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    doThrow(new RuntimeException("SMTP error")).when(mailSender).send(mimeMessage);

    assertThrows(
        RuntimeException.class,
        () -> emailService.sendInvitationEmail(
            "alice@example.com",
            "Alice",
            "Wedding",
            "2026-09-20",
            "Venue",
            "token",
            "qrCode",
            null,
            null
        )
    );
  }
}