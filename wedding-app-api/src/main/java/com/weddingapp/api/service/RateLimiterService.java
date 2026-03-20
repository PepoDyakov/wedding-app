package com.weddingapp.api.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class RateLimiterService {
  public final ConcurrentHashMap<String, ConcurrentLinkedDeque<Long>> requestLog = new ConcurrentHashMap<>();

  public boolean isAllowed(String key, int maxRequests, long windowMs) {
    long now = System.currentTimeMillis();
    long windowStart = now - windowMs;

    ConcurrentLinkedDeque<Long> timestamps = requestLog.computeIfAbsent(
        key, k -> new ConcurrentLinkedDeque<>()
    );

    while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
      timestamps.pollFirst();
    }

    if (timestamps.size() >= maxRequests) {
      return false;
    }

    timestamps.addLast(now);
    return true;
  }

  @Scheduled(fixedRate = 300000)
  public void cleanUp() {
    long now = System.currentTimeMillis();
    long maxWindow = 3600000; // 1 hour

    requestLog.forEach((key, timestamps) -> {
      while (!timestamps.isEmpty() && timestamps.peekFirst() < now - maxWindow) {
        timestamps.pollFirst();
      }
      if (timestamps.isEmpty()) {
        requestLog.remove(key);
      }
    });

  }
}
