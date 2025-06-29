package com.abccondo.repository;

import com.abccondo.model.BlogModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface BlogRepository extends JpaRepository<BlogModel, Long> {
    List<BlogModel> findByBlogAuthorId(Long authorId);
}