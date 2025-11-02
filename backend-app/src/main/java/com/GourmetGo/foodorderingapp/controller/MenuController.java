package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping
    public List<MenuItem> getMenu(
            // @RequestParam(required = false) cho phép người dùng không cần truyền param
            // Spring sẽ tự động map 'is_vegetarian' (snake_case) với 'isVegetarian' (camelCase)
            @RequestParam(required = false, name = "is_vegetarian") Boolean isVegetarian,
            @RequestParam(required = false, name = "is_spicy") Boolean isSpicy
    ) {
        return menuService.getMenuItems(isVegetarian, isSpicy);
    }
}