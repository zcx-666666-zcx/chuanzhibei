package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }
    
    public User getUserByOpenid(String openid) {
        Optional<User> user = userRepository.findByOpenid(openid);
        return user.orElse(null);
    }
    
    public User getUserByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.orElse(null);
    }
    
    public User getUserByNickname(String nickname) {
        Optional<User> user = userRepository.findByNickname(nickname);
        return user.orElse(null);
    }

    /**
     * 邮箱是否已被占用（用于注册校验）
     */
    public boolean existsByEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return userRepository.findByEmail(email.trim()).isPresent();
    }
    
    public User saveUser(User user) {
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}