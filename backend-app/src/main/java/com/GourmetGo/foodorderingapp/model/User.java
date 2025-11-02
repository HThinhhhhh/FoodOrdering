package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;
import java.io.Serializable;

@Entity
@Table(name = "app_user") // Đổi tên bảng (User là từ khóa SQL)
@Getter
@Setter
@NoArgsConstructor
public class User implements Serializable{

    private static final long serialVersionUID = 1L;

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
    @JsonManagedReference("user-order")
    private Set<Order> orders;

    // Quan hệ: Một User có thể viết nhiều Review
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-review")
    private Set<Review> reviews;
}
