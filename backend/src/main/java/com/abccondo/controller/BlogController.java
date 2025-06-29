package com.abccondo.controller;

import com.abccondo.model.BlogModel;
import com.abccondo.model.UserModel;
import com.abccondo.repository.BlogRepository;
import com.abccondo.repository.UserRepository;
import com.abccondo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BlogController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private BlogRepository blogRepo;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/blog/list")
    public ResponseEntity<?> getBlogList(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired JWT token");
        }

        List<BlogModel> blogs = blogRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (BlogModel blog : blogs) {
            Map<String, Object> blogMap = new HashMap<>();
            blogMap.put("id", blog.getBlogId());
            blogMap.put("title", blog.getBlogTitle());
            blogMap.put("image", blog.getBlogImage());
            blogMap.put("content", blog.getBlogContent());
            blogMap.put("createdAt", blog.getBlogCreatedAt());
            blogMap.put("authorId", blog.getBlog_authorId());

            Optional<UserModel> authorOpt = userRepo.findById(blog.getBlog_authorId());
            blogMap.put("authorName", authorOpt.map(UserModel::getName).orElse("Unknown"));
            blogMap.put("authorImage",authorOpt.map(UserModel::getPicture).orElse("Unknown"));

            result.add(blogMap);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/blog/post")
    public ResponseEntity<?> postBlog(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired JWT token");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);

        BlogModel blog = new BlogModel();
        blog.setBlogTitle(body.get("title"));
        blog.setBlogContent(body.get("content"));
        blog.setBlogImage(body.get("image")); // Optional
        blog.setBlog_authorId(userId);
        blog.setBlogCreatedAt(LocalDateTime.now());

        blogRepo.save(blog);

        return ResponseEntity.ok(Map.of("status", "Blog posted successfully"));
    }

    @PutMapping("/blog/{id}")
    public ResponseEntity<?> editBlog(@RequestHeader("Authorization") String authHeader,
                                      @PathVariable Long id,
                                      @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired JWT token");
        }
        Long userId = jwtUtil.getUserIdFromToken(token);

        Optional<BlogModel> blogOpt = blogRepo.findById(id);
        if (blogOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Blog not found");
        }
        BlogModel blog = blogOpt.get();

        // Only allow edit by author:
        if (!blog.getBlog_authorId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own blog posts");
        }

        blog.setBlogTitle(body.get("title"));
        blog.setBlogContent(body.get("content"));
        blog.setBlogImage(body.get("image")); // Optional

        blogRepo.save(blog);

        return ResponseEntity.ok(Map.of("status", "Blog updated successfully"));
    }

    @DeleteMapping("/blog/{id}")
    public ResponseEntity<?> deleteBlog(@RequestHeader("Authorization") String authHeader,
                                        @PathVariable Long id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired JWT token");
        }
        Long userId = jwtUtil.getUserIdFromToken(token);

        Optional<BlogModel> blogOpt = blogRepo.findById(id);
        if (blogOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Blog not found");
        }
        BlogModel blog = blogOpt.get();

        // Only allow delete by author:
        if (!blog.getBlog_authorId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own blog posts");
        }

        blogRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "Blog deleted successfully"));
    }
}