package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.OptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OptionItemRepository extends JpaRepository<OptionItem, Long> {
}