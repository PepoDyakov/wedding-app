package com.weddingapp.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private final JavaMailSender mailSender;
  private final String fromAddress;
  private final String appBaseUrl;

  public EmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String fromAddress, @Value("${app.base-url}") String appBaseUrl) {
    this.mailSender = mailSender;
    this.fromAddress = fromAddress;
    this.appBaseUrl = appBaseUrl;
  }

  public void sendInvitationEmail(String toEmail, String guestFirstName, String weddingTitle, String weddingDate, String venue, String invitationToken, String qrCodeBase64, String customMessage,
                                  String themeColor) {
    String invitationUrl = appBaseUrl + "/invite/" + invitationToken;
    String color = (themeColor != null) ? themeColor : "#3498db";
    String message = (customMessage != null) ? customMessage : "";
    String subject = "You're invited to " + weddingTitle;

    String customMessageBlock = message.isEmpty() ? "" : """
            <p style="font-style: italic; color: #555; border-left: 3px solid %s;
                padding-left: 12px; margin: 20px 0;">%s</p>
        """.formatted(color, message);

    String htmlContent = """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: %s;">You're Invited!</h1>
            <p>Dear %s,</p>
            <p>You are cordially invited to <strong>%s</strong>.</p>
            %s
            <p><strong>Date:</strong> %s</p>
            <p><strong>Venue:</strong> %s</p>
            <p>Please RSVP and let us know your preferences by visiting the link below:</p>
            <p><a href="%s" style="display: inline-block; padding: 12px 24px;
                background-color: %s; color: white; text-decoration: none;
                border-radius: 4px;">View Invitation & RSVP</a></p>
            <p>Or scan this QR code:</p>
            <img src="data:image/png;base64,%s" alt="QR Code" width="200" height="200" />
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
                This invitation is personal to you. Please do not share your link.</p>
        </body>
        </html>
        """.formatted(color, guestFirstName, weddingTitle, customMessageBlock,
        weddingDate, venue, invitationUrl, color, qrCodeBase64);

    sendHtmlEmail(toEmail, subject, htmlContent);
  }

  private void sendHtmlEmail(String to, String subject, String htmlContent) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromAddress);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(htmlContent, true);

      mailSender.send(message);
    } catch (MessagingException e) {
      throw new RuntimeException("Failed to send email", e);
    }
  }

  public void sendPasswordResetEmail(String toEmail, String firstName, String resetUrl) {
    String subject = "Reset your password";

    String htmlContent = """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50;">Password Reset</h1>
            <p>Hi %s,</p>
            <p>We received a request to reset your password. Click the button below to choose a new one:</p>
            <p><a href="%s" style="display: inline-block; padding: 12px 24px;
                background-color: #3498db; color: white; text-decoration: none;
                border-radius: 4px;">Reset Password</a></p>
            <p>This link expires in 1 hour.</p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
                If you didn't request this, you can safely ignore this email.</p>
        </body>
        </html>
        """.formatted(firstName, resetUrl);

    sendHtmlEmail(toEmail, subject, htmlContent);
  }
}
