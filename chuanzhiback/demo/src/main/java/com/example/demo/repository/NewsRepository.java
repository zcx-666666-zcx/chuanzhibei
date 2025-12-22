package com.example.demo.repository;

import com.example.demo.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    /**
     * 查询所有新闻记录
     * @return 返回所有新闻的列表
     */
    @Query("SELECT n FROM News n")
    List<News> findAllNews();

    /**
     * 根据关键词在标题或内容中模糊查询新闻
     * @param keyword 搜索关键词
     * @return 包含关键词的新闻列表
     */
    @Query("SELECT n FROM News n WHERE n.title LIKE CONCAT('%', :keyword, '%') OR n.content LIKE CONCAT('%', :keyword, '%')")
    List<News> findByKeyword(String keyword);
}