package com.GourmetGo.foodorderingapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "app_user") // Đổi tên bảng (User là từ khóa SQL)
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tên đăng nhập duy nhất */
    @Column(nullable = false, unique = true)
    private String username;

    /** Mật khẩu (sẽ được mã hóa) */
    @Column(nullable = false)
    private String password;

    /** Vai trò của người dùng (DINER hoặc KITCHEN) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Quan hệ: Một User có thể có nhiều Order
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Order> orders;

    // Quan hệ: Một User có thể viết nhiều Review
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Review> reviews;
}
