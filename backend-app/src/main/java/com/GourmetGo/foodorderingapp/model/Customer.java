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

import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
public class Customer implements Serializable, UserDetails {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // (Các trường: phoneNumber, name, apartmentNumber, streetAddress, ward, city giữ nguyên)
    @Column(nullable = false, unique = true)
    private String phoneNumber;
    @Column(nullable = true)
    private String name;
    @Column(nullable = true)
    private String apartmentNumber;
    @Column(nullable = true)
    private String streetAddress;
    @Column(nullable = true)
    private String ward;
    @Column(nullable = true)
    private String city;

    @Column(nullable = false, length = 60)
    @JsonIgnore
    private String password;

    // (Các liên kết @OneToMany orders, reviews giữ nguyên)
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("customer-order")
    @JsonIgnore
    private Set<Order> orders;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("customer-review")
    @JsonIgnore
    private Set<Review> reviews;


    // --- BẮT ĐẦU SỬA LỖI (THÊM HÀM NÀY) ---
    /**
     * Phương thức này không được lưu vào CSDL (do không có @Column),
     * nhưng sẽ được Jackson (JSON serializer) đọc khi trả về /api/auth/me.
     * Điều này cho phép frontend (LoginPage) kiểm tra (user.role === 'DINER').
     */
    public String getRole() {
        return "DINER";
    }
    // --- KẾT THÚC SỬA LỖI ---


    // --- (Các phương thức @Override của UserDetails giữ nguyên) ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_DINER");
        return Collections.singletonList(authority);
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return phoneNumber;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}