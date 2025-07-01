package com.abccondo.controller;

import com.abccondo.model.UserModel;
import com.abccondo.repository.UserRepository;
import com.abccondo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
	@Autowired
	private UserRepository userRepo;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private JwtUtil jwtUtil;

	@Value("${google.client-id}")
	private String googleClientId;

	@PostMapping("/register")
	public Map<String, String> register(@RequestBody Map<String, String> body) {
		if (userRepo.findByEmail(body.get("email")).isPresent()) {
			throw new RuntimeException("Email already registered");
		}
		UserModel user = new UserModel();
		user.setName(body.get("name"));
		user.setEmail(body.get("email"));
		user.setPassword(passwordEncoder.encode(body.get("password")));
		userRepo.save(user);
		return Map.of("status", "registered");
	}

	@PostMapping("/login")
	public Map<String, String> login(@RequestBody Map<String, String> body) {
		UserModel user = userRepo.findByEmail(body.get("email"))
				.orElseThrow(() -> new RuntimeException("User not found"));
		if (!passwordEncoder.matches(body.get("password"), user.getPassword())) {
			throw new RuntimeException("Invalid credentials");
		}
		String token = jwtUtil.generateToken(user.getId(), user.getEmail());
		return Map.of("token", token);
	}

	@PostMapping("/google")
	public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
		//recieve Google JWT Token from frontend
		String idTokenString = body.get("idToken");
		if (idTokenString == null) {
			return ResponseEntity.badRequest().body(Map.of("error", "Missing idToken"));
		}

		try {
			//verify the Google JWT Token
			GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
					GsonFactory.getDefaultInstance()).setAudience(Collections.singletonList(googleClientId)).build();

			GoogleIdToken idToken = verifier.verify(idTokenString);
			if (idToken == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid ID token"));
			}

			GoogleIdToken.Payload payload = idToken.getPayload();
			String email = payload.getEmail();
			String name = (String) payload.get("name");
			String picture = (String) payload.get("picture");

			// Find or create user in your DB
			Optional<UserModel> optionalUser = userRepo.findByEmail(email);
			UserModel user;
			if (optionalUser.isPresent()) {
				user = optionalUser.get();
			} else {
				user = new UserModel();
				user.setEmail(email);
				user.setName(name);
				user.setProvider("google");
				user.setPicture(picture);
				// You may want to generate a random password or leave blank
				userRepo.save(user);
			}

			// Generate your own JWT/session token
			String token = jwtUtil.generateToken(user.getId(), user.getEmail());

			return ResponseEntity.ok(Map.of("token", token));

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Google login failed"));
		}
	}

	@PostMapping("/facebook")
	public ResponseEntity<?> facebookLogin(@RequestBody Map<String, String> body) {
	    String accessToken = body.get("accessToken");
	    if (accessToken == null) {
	        return ResponseEntity.badRequest().body(Map.of("error", "Missing accessToken"));
	    }

	    try {
	        String userInfoUrl = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + accessToken;
	        RestTemplate restTemplate = new RestTemplate();
	        Map<String, Object> fbUser = restTemplate.getForObject(userInfoUrl, Map.class);

	        String id = (String) fbUser.get("id");
	        String email = (String) fbUser.get("email");
	        String name = (String) fbUser.get("name");

	        String picture = null;
	        Object pictureObj = fbUser.get("picture");
	        if (pictureObj instanceof Map) {
	            Map<?, ?> pictureMap = (Map<?, ?>) pictureObj;
	            Object dataObj = pictureMap.get("data");
	            if (dataObj instanceof Map) {
	                Map<?, ?> dataMap = (Map<?, ?>) dataObj;
	                Object urlObj = dataMap.get("url");
	                if (urlObj instanceof String) {
	                    picture = (String) urlObj;
	                }
	            }
	        }

	        if (email == null) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                    .body(Map.of("error", "Email permission is required"));
	        }

	        // Find or create user in your DB
	        Optional<UserModel> optionalUser = userRepo.findByEmail(email);
	        UserModel user;
	        if (optionalUser.isPresent()) {
	            user = optionalUser.get();
	        } else {
	            user = new UserModel();
	            user.setEmail(email);
	            user.setName(name);
	            user.setProvider("facebook");
	            user.setPicture(picture);
	            userRepo.save(user);
	        }

	        // Generate your own JWT/session token
	        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

	        return ResponseEntity.ok(Map.of("token", token));
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(Map.of("error", "Facebook login failed"));
	    }
	}
}