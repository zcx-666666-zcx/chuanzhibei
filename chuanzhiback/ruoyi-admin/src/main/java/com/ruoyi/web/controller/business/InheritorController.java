package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.Inheritor;
import com.ruoyi.heritage.mapper.InheritorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 传承人管理
 */
@RestController
@RequestMapping("/business/inheritor")
public class InheritorController {

    @Autowired
    private InheritorMapper inheritorMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('inheritor:list')")
    public TableDataInfo<Inheritor> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name) {
        Page<Inheritor> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Inheritor> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(name != null && !name.isEmpty(), Inheritor::getName, name)
               .orderByDesc(Inheritor::getCreateTime);
        Page<Inheritor> result = inheritorMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('inheritor:query')")
    public AjaxResult<Inheritor> getInfo(@PathVariable Long id) {
        return AjaxResult.success(inheritorMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('inheritor:add')")
    public AjaxResult<Void> add(@RequestBody Inheritor entity) {
        return inheritorMapper.insert(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('inheritor:edit')")
    public AjaxResult<Void> edit(@RequestBody Inheritor entity) {
        return inheritorMapper.updateById(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('inheritor:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) inheritorMapper.deleteById(id);
        return AjaxResult.success();
    }
}
