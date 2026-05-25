package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.Heritage;
import com.ruoyi.heritage.mapper.HeritageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 非遗项目管理
 */
@RestController
@RequestMapping("/business/heritage")
public class HeritageController {

    @Autowired
    private HeritageMapper heritageMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('heritage:list')")
    public TableDataInfo<Heritage> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category) {
        Page<Heritage> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Heritage> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(name != null && !name.isEmpty(), Heritage::getName, name)
               .eq(category != null && !category.isEmpty(), Heritage::getCategory, category)
               .orderByDesc(Heritage::getCreateTime);
        Page<Heritage> result = heritageMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('heritage:query')")
    public AjaxResult<Heritage> getInfo(@PathVariable Long id) {
        return AjaxResult.success(heritageMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('heritage:add')")
    public AjaxResult<Void> add(@RequestBody Heritage heritage) {
        return heritageMapper.insert(heritage) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('heritage:edit')")
    public AjaxResult<Void> edit(@RequestBody Heritage heritage) {
        return heritageMapper.updateById(heritage) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('heritage:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) {
            heritageMapper.deleteById(id);
        }
        return AjaxResult.success();
    }
}
