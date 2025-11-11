package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Dịch vụ này được Spring Security sử dụng để
 * tìm kiếm và xác thực NHÂN VIÊN (Employee) bằng username.
 */
@Service("employeeUserDetailsService") // Đặt tên Bean rõ ràng
public class EmployeeUserDetailsService implements UserDetailsService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return employeeRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy nhân viên với Username: " + username));
    }
}