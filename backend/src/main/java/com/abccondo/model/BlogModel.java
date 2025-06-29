package com.abccondo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blogs")
public class BlogModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blog_id")
    private Long blogId;

    @Column(name = "blog_title")
    private String blogTitle;
    
    @Column(name = "blog_image")
    private String blogImage;

    @Column(name = "blog_content", columnDefinition = "TEXT")
    private String blogContent;

    @Column(name = "blog_author_id")
    private Long blogAuthorId;

    @Column(name = "blog_created_at")
    private LocalDateTime blogCreatedAt;

    public Long getBlogId() {
        return blogId;
    }

    public void setBlogId(Long blogId) {
        this.blogId = blogId;
    }

    public String getBlogImage() {
		return blogImage;
	}

	public void setBlogImage(String blogImage) {
		this.blogImage = blogImage;
	}

	public String getBlogTitle() {
        return blogTitle;
    }

    public void setBlogTitle(String blogTitle) {
        this.blogTitle = blogTitle;
    }

    public String getBlogContent() {
        return blogContent;
    }

    public void setBlogContent(String blogContent) {
        this.blogContent = blogContent;
    }

    public Long getBlog_authorId() {
		return blogAuthorId;
	}

	public void setBlog_authorId(Long blogAuthorId) {
		this.blogAuthorId = blogAuthorId;
	}

	public LocalDateTime getBlogCreatedAt() {
        return blogCreatedAt;
    }

    public void setBlogCreatedAt(LocalDateTime blogCreatedAt) {
        this.blogCreatedAt = blogCreatedAt;
    }
}