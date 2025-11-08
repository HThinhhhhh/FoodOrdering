package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.io.Serializable;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
public class User implements Serializable, UserDetails {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- THAY ĐỔI 1: USERNAME -> PHONENUMBER ---
    @Column(nullable = false, unique = true)
    private String phoneNumber; // Thay thế cho username

    @Column(nullable = true) // Tên có thể null cho đến lần đặt hàng đầu tiên
    private String name;

    // Thêm các trường địa chỉ (Goal 3)
    @Column(nullable = true)
    private String apartmentNumber;

    @Column(nullable = true)
    private String streetAddress;

    @Column(nullable = true)
    private String ward;

    @Column(nullable = true)
    private String city;
    // --- KẾT THÚC THAY ĐỔI 1 ---

    @Column(nullable = false, length = 60)
    @JsonIgnore // Không bao giờ gửi mật khẩu ra frontend
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-order")
    @JsonIgnore
    private Set<Order> orders;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-review")
    @JsonIgnore
    private Set<Review> reviews;

    // --- THAY ĐỔI 2: PHƯƠNG THỨC CỦA UserDetails ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());
        return Collections.singletonList(authority);
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return phoneNumber; // Spring Security sẽ dùng SĐT để đăng nhập
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
    // --- KẾT THÚC THAY ĐỔI 2 ---
}