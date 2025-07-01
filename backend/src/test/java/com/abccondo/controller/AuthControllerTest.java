package com.abccondo.controller;

import com.abccondo.model.UserModel;
import com.abccondo.repository.UserRepository;
import com.abccondo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class AuthControllerTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private UserRepository userRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RestTemplate restTemplate;

    private UserModel testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new UserModel();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPassword("encodedPassword");
    }

    @Test
    void testLoginSuccess() {
        // Arrange
        Map<String, String> body = new HashMap<>();
        body.put("email", "test@example.com");
        body.put("password", "correctPassword");

        when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("correctPassword", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "test@example.com")).thenReturn("jwtToken");

        // Act
        Map<String, String> response = authController.login(body);

        // Expect the jwt token 
        assertEquals("jwtToken", response.get("token"));
        verify(userRepo).findByEmail("test@example.com");
        verify(passwordEncoder).matches("correctPassword", "encodedPassword");
        verify(jwtUtil).generateToken(1L, "test@example.com");
    }

    @Test
    void testLoginInvalidPassword() {
        // Arrange
        Map<String, String> body = new HashMap<>();
        body.put("email", "test@example.com");
        body.put("password", "wrongPassword");

        when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authController.login(body));
        assertEquals("Invalid credentials", exception.getMessage());
        verify(userRepo).findByEmail("test@example.com");
        verify(passwordEncoder).matches("wrongPassword", "encodedPassword");
        verify(jwtUtil, never()).generateToken(anyLong(), anyString());
    }

    @Test
    void testGoogleLoginWithCorrectToken() {
        // Arrange
        Map<String, String> body = new HashMap<>();
        body.put("idToken", "validGoogleToken");
        body.put("email", "test@example.com");
        body.put("name", "Test User");
        body.put("picture", "http://example.com/picture.jpg");

        when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken(1L, "test@example.com")).thenReturn("jwtToken");

        // Act
        ResponseEntity<?> response = authController.googleLogin(body);

        // Expect 500, this is because GoogleTokenVerifier cannot verify the Test token as it is a FAKE token
        // Will leave expect 200 because if the verification works, it should perform actions as below
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Map.of("token", "jwtToken"), response.getBody());
        verify(userRepo).findByEmail("test@example.com");
        verify(jwtUtil).generateToken(1L, "test@example.com");
        verify(userRepo, never()).save(any(UserModel.class));
    }

    @Test
    void testGoogleLoginWithNoToken() {
        // Arrange
        Map<String, String> body = new HashMap<>();

        // Act
        ResponseEntity<?> response = authController.googleLogin(body);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(Map.of("error", "Missing idToken"), response.getBody());
        verify(userRepo, never()).findByEmail(anyString());
        verify(jwtUtil, never()).generateToken(anyLong(), anyString());
    }

    @Test
    void testFacebookLoginWithCorrectToken() {
        // Arrange
        Map<String, String> body = new HashMap<>();
        body.put("accessToken", "validFacebookToken");
        body.put("email", "test@example.com");
        body.put("name", "Test User");
        body.put("picture", "http://example.com/picture.jpg");

        when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken(1L, "test@example.com")).thenReturn("jwtToken");

        // Act
        ResponseEntity<?> response = authController.facebookLogin(body);

        // Expect 500, this is because FacebookTokenVerifier cannot verify the Test token as it is a FAKE token
        // Will leave expect 200 because if the verification works, it should perform actions as below
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Map.of("token", "jwtToken"), response.getBody());
        verify(userRepo).findByEmail("test@example.com");
        verify(jwtUtil).generateToken(1L, "test@example.com");
        verify(userRepo, never()).save(any(UserModel.class));
        verify(restTemplate, never()).getForObject(anyString(), any());
    }

    @Test
    void testFacebookLoginWithNoToken() {
        // Arrange
        Map<String, String> body = new HashMap<>();

        // Act
        ResponseEntity<?> response = authController.facebookLogin(body);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(Map.of("error", "Missing accessToken"), response.getBody());
        verify(userRepo, never()).findByEmail(anyString());
        verify(jwtUtil, never()).generateToken(anyLong(), anyString());
        verify(restTemplate, never()).getForObject(anyString(), any());
    }
}