package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.Video;
import com.ruoyi.heritage.mapper.VideoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 视频管理
 */
@RestController
@RequestMapping("/business/video")
public class VideoController {

    @Autowired
    private VideoMapper videoMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('video:list')")
    public TableDataInfo<Video> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                      @RequestParam(defaultValue = "10") Integer pageSize,
                                      @RequestParam(required = false) String title) {
        Page<Video> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Video> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(title != null && !title.isEmpty(), Video::getTitle, title)
               .orderByDesc(Video::getCreateTime);
        Page<Video> result = videoMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('video:query')")
    public AjaxResult<Video> getInfo(@PathVariable Long id) {
        return AjaxResult.success(videoMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('video:add')")
    public AjaxResult<Void> add(@RequestBody Video entity) {
        return videoMapper.insert(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('video:edit')")
    public AjaxResult<Void> edit(@RequestBody Video entity) {
        return videoMapper.updateById(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('video:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) videoMapper.deleteById(id);
        return AjaxResult.success();
    }
}
