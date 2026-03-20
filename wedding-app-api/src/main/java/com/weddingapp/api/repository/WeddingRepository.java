package com.weddingapp.api.repository;

import com.weddingapp.api.entity.Wedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeddingRepository extends JpaRepository<Wedding, Long> {
  List<Wedding> findByUserId(Long userId);
  
}
