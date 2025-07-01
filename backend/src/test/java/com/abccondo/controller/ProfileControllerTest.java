package com.abccondo.controller;

import com.abccondo.model.BlogModel;
import com.abccondo.model.UserModel;
import com.abccondo.repository.BlogRepository;
import com.abccondo.repository.UserRepository;
import com.abccondo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileControllerTest {

    @InjectMocks
    private ProfileController profileController;

    @Mock
    protected UserRepository userRepo;
    @Mock
    protected BlogRepository blogRepo;
    @Mock
    protected JwtUtil jwtUtil;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @Test
    void getUserBlogList_validRequest_returnsUserBlogs() {
        String validToken = "valid.jwt.token";
        String authHeader = "Bearer " + validToken;
        Long userId = 99L;

        UserModel user = new UserModel();
        user.setId(userId);
        user.setName("UserX");
        user.setPicture("picX.jpg");

        BlogModel blog = new BlogModel();
        blog.setBlogId(101L);
        blog.setBlogTitle("BlogX");
        blog.setBlogContent("ContentX");
        blog.setBlogImage("imgX.jpg");
        blog.setBlogCreatedAt(LocalDateTime.now());
        blog.setBlog_authorId(userId);

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));
        when(blogRepo.findByBlogAuthorId(userId)).thenReturn(List.of(blog));

        ResponseEntity<?> response = profileController.getUserBlogList(userId, authHeader);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> result = (List<?>) response.getBody();
        assertEquals(1, result.size());
        Map<?, ?> blogMap = (Map<?, ?>) result.get(0);
        assertEquals("BlogX", blogMap.get("title"));
        assertEquals("UserX", blogMap.get("authorName"));
        assertEquals("picX.jpg", blogMap.get("authorImage"));

        verify(jwtUtil).validateToken(validToken);
        verify(userRepo).findById(userId);
        verify(blogRepo).findByBlogAuthorId(userId);
        
        //ensure no unverified action on ()
        verifyNoMoreInteractions(jwtUtil, blogRepo, userRepo);
    }

    @Test
    void updateProfile_validUser_updatesProfile() {
        String validToken = "valid.jwt.token";
        String authHeader = "Bearer " + validToken;
        Long userId = 7L;

        UserModel user = new UserModel();
        user.setId(userId);
        user.setName("Old Name");
        user.setPicture("old_pic.jpg");
        user.setEmail("user7@email.com");

        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("name", "New Name");
        updateBody.put("image", "new_pic.jpg");

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.getUserIdFromToken(validToken)).thenReturn(userId);
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));
        when(userRepo.save(any(UserModel.class))).thenReturn(user);

        ResponseEntity<?> response = profileController.updateProfile(userId, authHeader, updateBody);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> resp = (Map<?, ?>) response.getBody();
        assertEquals(userId, resp.get("id"));
        assertEquals("New Name", resp.get("name"));
        assertEquals("user7@email.com", resp.get("email"));
        assertEquals("new_pic.jpg", resp.get("image"));

        assertEquals("New Name", user.getName());
        assertEquals("new_pic.jpg", user.getPicture());

        verify(jwtUtil).validateToken(validToken);
        verify(jwtUtil).getUserIdFromToken(validToken);
        verify(userRepo).findById(userId);
        verify(userRepo).save(user);
        
        //ensure no unverified action on ()
        verifyNoMoreInteractions(jwtUtil, blogRepo, userRepo);
    }
}