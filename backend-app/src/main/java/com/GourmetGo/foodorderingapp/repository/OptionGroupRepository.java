package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.OptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OptionGroupRepository extends JpaRepository<OptionGroup, Long> {
}