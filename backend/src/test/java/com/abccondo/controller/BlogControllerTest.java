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

class BlogControllerTest {

    @InjectMocks
    private BlogController blogController;

    @Mock
    private UserRepository userRepo;
    @Mock
    private BlogRepository blogRepo;
    @Mock
    private JwtUtil jwtUtil;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @Test
    void getBlogList_validToken_returnsBlogList() {
        // Arrange
        String validToken = "valid.jwt.token";
        String authHeader = "Bearer " + validToken;

        BlogModel blog = new BlogModel();
        blog.setBlogId(1L);
        blog.setBlogTitle("Title");
        blog.setBlogContent("Content");
        blog.setBlogImage("img.png");
        blog.setBlogCreatedAt(LocalDateTime.now());
        blog.setBlog_authorId(100L);

        UserModel author = new UserModel();
        author.setId(100L);
        author.setName("Alice");
        author.setPicture("avatar.png");

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(blogRepo.findAll()).thenReturn(List.of(blog));
        when(userRepo.findById(100L)).thenReturn(Optional.of(author));

        // Act
        ResponseEntity<?> response = blogController.getBlogList(authHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> result = (List<?>) response.getBody();
        assertEquals(1, result.size());
        Map<?, ?> blogMap = (Map<?, ?>) result.get(0);
        assertEquals("Title", blogMap.get("title"));
        assertEquals("Alice", blogMap.get("authorName"));
        assertEquals("avatar.png", blogMap.get("authorImage"));

        // Verify interactions
        verify(jwtUtil).validateToken(validToken);
        verify(blogRepo).findAll();
        verify(userRepo).findById(100L);
        verifyNoMoreInteractions(jwtUtil, blogRepo, userRepo);
    }

    @Test
    void editBlog_validAuthor_updatesBlog() {
        String validToken = "valid.jwt.token";
        String authHeader = "Bearer " + validToken;
        Long userId = 200L;
        Long blogId = 10L;

        BlogModel blog = new BlogModel();
        blog.setBlogId(blogId);
        blog.setBlogTitle("Old Title");
        blog.setBlogContent("Old Content");
        blog.setBlogImage("old.png");
        blog.setBlog_authorId(userId);

        Map<String, String> updateBody = new HashMap<>();
        updateBody.put("title", "Updated Title");
        updateBody.put("content", "Updated Content");
        updateBody.put("image", "updated.png");

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.getUserIdFromToken(validToken)).thenReturn(userId);
        when(blogRepo.findById(blogId)).thenReturn(Optional.of(blog));

        ResponseEntity<?> response = blogController.editBlog(authHeader, blogId, updateBody);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> resp = (Map<?, ?>) response.getBody();
        assertEquals("Blog updated successfully", resp.get("status"));
        assertEquals("Updated Title", blog.getBlogTitle());
        assertEquals("Updated Content", blog.getBlogContent());
        assertEquals("updated.png", blog.getBlogImage());

        // Verify interactions
        verify(jwtUtil).validateToken(validToken);
        verify(jwtUtil).getUserIdFromToken(validToken);
        verify(blogRepo).findById(blogId);
        verify(blogRepo).save(blog);
        
        //ensure no unverified action on ()
        verifyNoMoreInteractions(jwtUtil, blogRepo, userRepo);
    }

    @Test
    void deleteBlog_byAuthor_deletesBlog() {
        String validToken = "valid.jwt.token";
        String authHeader = "Bearer " + validToken;
        Long userId = 321L;
        Long blogId = 55L;

        BlogModel blog = new BlogModel();
        blog.setBlogId(blogId);
        blog.setBlog_authorId(userId);

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.getUserIdFromToken(validToken)).thenReturn(userId);
        when(blogRepo.findById(blogId)).thenReturn(Optional.of(blog));

        ResponseEntity<?> response = blogController.deleteBlog(authHeader, blogId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> resp = (Map<?, ?>) response.getBody();
        assertEquals("Blog deleted successfully", resp.get("status"));

        // Verify interactions
        verify(jwtUtil).validateToken(validToken);
        verify(jwtUtil).getUserIdFromToken(validToken);
        verify(blogRepo).findById(blogId);
        verify(blogRepo).deleteById(blogId);
        
        //ensure no unverified action on ()
        verifyNoMoreInteractions(jwtUtil, blogRepo, userRepo);
    }
}