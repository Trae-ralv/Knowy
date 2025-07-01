package com.abccondo.controller;

import com.abccondo.model.UserModel;
import com.abccondo.repository.UserRepository;
import com.abccondo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthControllerRegisterTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private UserRepository userRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterSuccess() {
        // Arrange
        Map<String, String> body = new HashMap<>();
        body.put("email", "newuser@example.com");
        body.put("name", "New User");
        body.put("password", "password123");

        when(userRepo.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepo.save(any(UserModel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Map<String, String> response = authController.register(body);

        // Assert
        assertEquals("registered", response.get("status"));
        
        // check if the database has the test email and password using userRepo and verify no JWT interactions
        verify(userRepo).findByEmail("newuser@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepo).save(any(UserModel.class));
        verifyNoInteractions(jwtUtil);
    }
}