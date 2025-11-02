package com.GourmetGo.foodorderingapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling; // 1. Import


@SpringBootApplication
@EnableCaching
@EnableScheduling // 2. Thêm dòng này để kích hoạt các tác vụ định kỳ
public class FoodOrderingAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodOrderingAppApplication.class, args);
    }

}