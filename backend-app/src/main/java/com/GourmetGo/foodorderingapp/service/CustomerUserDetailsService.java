package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Dịch vụ này được Spring Security sử dụng để
 * tìm kiếm và xác thực KHÁCH HÀNG (Customer) bằng số điện thoại.
 */
@Service("customerUserDetailsService") // Đặt tên Bean rõ ràng
public class CustomerUserDetailsService implements UserDetailsService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        // "username" ở đây thực chất là "phoneNumber"
        return customerRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy khách hàng với SĐT: " + phoneNumber));
    }
}