package com.abccondo.controller;

import com.abccondo.model.UserModel;
import com.abccondo.model.BlogModel;
import com.abccondo.repository.UserRepository;
import com.abccondo.repository.BlogRepository;
import com.abccondo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private BlogRepository blogRepo;
    @Autowired
    private JwtUtil jwtUtil;

    // Get Profile by ID (for viewing profile)
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<UserModel> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        UserModel user = userOpt.get();
        // You may omit sensitive fields here
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("image", user.getPicture());
        // add more fields as needed
        return ResponseEntity.ok(profile);
    }

    // Update Profile (only by the user themselves)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id,
                                           @RequestHeader("Authorization") String authHeader,
                                           @RequestBody Map<String, Object> body) {
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

        if (!userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only update your own profile");
        }

        Optional<UserModel> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        UserModel user = userOpt.get();

        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("image")) user.setPicture((String) body.get("image"));
        // Email should not be changed except by a dedicated endpoint/flow
        // if (body.containsKey("email")) user.setEmail((String) body.get("email"));

        userRepo.save(user);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("image", user.getPicture());
        return ResponseEntity.ok(profile);
    }

    // List all blogs for a user (adjusted for BlogModel fields)
    @GetMapping("/blog/list/{id}")
    public ResponseEntity<?> getUserBlogList(@PathVariable Long id,
                                             @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired JWT token");
        }
        Optional<UserModel> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        List<BlogModel> blogs = blogRepo.findByBlogAuthorId(id);
        List<Map<String, Object>> result = new ArrayList<>();

        for (BlogModel blog : blogs) {
            Map<String, Object> blogMap = new HashMap<>();
            blogMap.put("id", blog.getBlogId());
            blogMap.put("title", blog.getBlogTitle());
            blogMap.put("image", blog.getBlogImage());
            blogMap.put("content", blog.getBlogContent());
            blogMap.put("createdAt", blog.getBlogCreatedAt());
            blogMap.put("authorId", blog.getBlog_authorId());
            blogMap.put("authorName", userOpt.get().getName());
            blogMap.put("authorImage", userOpt.get().getPicture());
            result.add(blogMap);
        }
        return ResponseEntity.ok(result);
    }
}