package com.weddingapp.api.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class QRCodeService {
  private final String appBaseUrl;

  public QRCodeService(@Value("${app.base-url}") String appBaseUrl) {
    this.appBaseUrl = appBaseUrl;
  }

  public String generateInvitationQRCode(String invitationToken) {
    String url = appBaseUrl + "/invite/" + invitationToken;
    return generateQRCodeBase64(url, 300, 300);
  }

  private String generateQRCodeBase64(String content, int width, int height) {
    try {
      QRCodeWriter writer = new QRCodeWriter();
      BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, width, height);

      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

      byte[] imageBytes = outputStream.toByteArray();
      return Base64.getEncoder().encodeToString(imageBytes);
    } catch (WriterException | IOException e) {
      throw new RuntimeException("Failed to generate QR code:", e);
    }
  }
}
