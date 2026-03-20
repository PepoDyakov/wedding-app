package com.weddingapp.api.config;

import com.weddingapp.api.service.RateLimiterService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class RateLimitFilter extends OncePerRequestFilter {
  // General API limit
  private static final int GENERAL_MAX_REQUESTS = 100;
  private static final long GENERAL_WINDOW_MS = 60000; // 1 minute
  // Stricter limit for GraphQL mutations (login, register, send emails)
  private static final int GRAPHQL_MAX_REQUESTS = 20;
  private static final long GRAPHQL_WINDOW_MS = 60000; // 1 minute
  private final RateLimiterService rateLimiterService;

  public RateLimitFilter(RateLimiterService rateLimiterService) {
    this.rateLimiterService = rateLimiterService;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain
  ) throws ServletException, IOException {
    String clientIp = getClientIp(request);

    if ("/graphql".equals(request.getRequestURI()) && "POST".equals(request.getMethod())) {
      String key = "graphql:" + clientIp;
      boolean allowed = rateLimiterService.isAllowed(key, GRAPHQL_MAX_REQUESTS, GRAPHQL_WINDOW_MS);

      if (!allowed) {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"errors\":[{\"message\":\"Too many requests. Please try again later.\"}]}"
        );
        return;
      }
    }

    String generalKey = "general:" + clientIp;
    boolean generalAllowed = rateLimiterService.isAllowed(generalKey, GENERAL_MAX_REQUESTS, GENERAL_WINDOW_MS);

    if (!generalAllowed) {
      response.setStatus(429);
      response.setContentType("application/json");
      response.getWriter().write(
          "{\"errors\":[{\"message\":\"Too many requests. Please try again later.\"}]}"
      );
      return;
    }

    filterChain.doFilter(request, response);
  }

  @Override
  protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
    String path = request.getRequestURI();
    return path.endsWith(".html")
        || path.equals("/health");
  }

  private String getClientIp(HttpServletRequest request) {
    String xForwardedFor = request.getHeader("X-Forwarded-For");

    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
      return xForwardedFor.split(",")[0].trim();
    }

    return request.getRemoteAddr();
  }
}
