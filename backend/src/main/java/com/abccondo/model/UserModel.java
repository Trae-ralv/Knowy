package com.abccondo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class UserModel {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; // Primary key

	private String name;

	@Column(unique = true)
	private String email;

	private String password; // Hashed

	// OAuth provider (for Google/Facebook)
	private String provider;

	@Column(name = "picture", columnDefinition = "TEXT")
	private String picture;

	// No-args constructor (required by JPA)
	public UserModel() {
	}

	// Getters and setters...
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
	}

	public String getPicture() {
		return picture;
	}

	public void setPicture(String picture) {
		this.picture = picture;
	}

}