package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.News;
import com.ruoyi.heritage.mapper.NewsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 新闻管理
 */
@RestController
@RequestMapping("/business/news")
public class NewsController {

    @Autowired
    private NewsMapper newsMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('news:list')")
    public TableDataInfo<News> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                     @RequestParam(defaultValue = "10") Integer pageSize,
                                     @RequestParam(required = false) String title) {
        Page<News> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<News> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(title != null && !title.isEmpty(), News::getTitle, title)
               .orderByDesc(News::getCreateTime);
        Page<News> result = newsMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('news:query')")
    public AjaxResult<News> getInfo(@PathVariable Long id) {
        return AjaxResult.success(newsMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('news:add')")
    public AjaxResult<Void> add(@RequestBody News entity) {
        return newsMapper.insert(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('news:edit')")
    public AjaxResult<Void> edit(@RequestBody News entity) {
        return newsMapper.updateById(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('news:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) newsMapper.deleteById(id);
        return AjaxResult.success();
    }
}
