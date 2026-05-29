package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.ArExperience;
import com.ruoyi.heritage.mapper.ArExperienceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 3D沉浸演示管理
 */
@RestController
@RequestMapping("/business/ar")
public class ArExperienceController {

    @Autowired
    private ArExperienceMapper arMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('ar:list')")
    public TableDataInfo<ArExperience> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                             @RequestParam(defaultValue = "10") Integer pageSize,
                                             @RequestParam(required = false) String name) {
        Page<ArExperience> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ArExperience> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(name != null && !name.isEmpty(), ArExperience::getName, name)
               .orderByDesc(ArExperience::getCreateTime);
        Page<ArExperience> result = arMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('ar:query')")
    public AjaxResult<ArExperience> getInfo(@PathVariable Long id) {
        return AjaxResult.success(arMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('ar:add')")
    public AjaxResult<Void> add(@RequestBody ArExperience entity) {
        return arMapper.insert(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('ar:edit')")
    public AjaxResult<Void> edit(@RequestBody ArExperience entity) {
        return arMapper.updateById(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('ar:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) arMapper.deleteById(id);
        return AjaxResult.success();
    }
}
