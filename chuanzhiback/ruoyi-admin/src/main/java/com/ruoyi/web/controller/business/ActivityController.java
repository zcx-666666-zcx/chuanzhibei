package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.Activity;
import com.ruoyi.heritage.mapper.ActivityMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 活动管理
 */
@RestController
@RequestMapping("/business/activity")
public class ActivityController {

    @Autowired
    private ActivityMapper activityMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('activity:list')")
    public TableDataInfo<Activity> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                         @RequestParam(defaultValue = "10") Integer pageSize,
                                         @RequestParam(required = false) String title) {
        Page<Activity> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(title != null && !title.isEmpty(), Activity::getTitle, title)
               .orderByDesc(Activity::getCreateTime);
        Page<Activity> result = activityMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('activity:query')")
    public AjaxResult<Activity> getInfo(@PathVariable Long id) {
        return AjaxResult.success(activityMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('activity:add')")
    public AjaxResult<Void> add(@RequestBody Activity entity) {
        return activityMapper.insert(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('activity:edit')")
    public AjaxResult<Void> edit(@RequestBody Activity entity) {
        return activityMapper.updateById(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('activity:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) activityMapper.deleteById(id);
        return AjaxResult.success();
    }
}
