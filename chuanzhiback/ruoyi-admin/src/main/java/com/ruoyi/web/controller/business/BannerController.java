package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.Banner;
import com.ruoyi.heritage.mapper.BannerMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 轮播管理
 */
@RestController
@RequestMapping("/business/banner")
public class BannerController {

    @Autowired
    private BannerMapper bannerMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('banner:list')")
    public TableDataInfo<Banner> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                       @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Banner> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Banner> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Banner::getCreateTime);
        Page<Banner> result = bannerMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('banner:query')")
    public AjaxResult<Banner> getInfo(@PathVariable Long id) {
        return AjaxResult.success(bannerMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@ss.hasPermi('banner:add')")
    public AjaxResult<Void> add(@RequestBody Banner entity) {
        return bannerMapper.insert(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('banner:edit')")
    public AjaxResult<Void> edit(@RequestBody Banner entity) {
        return bannerMapper.updateById(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('banner:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) bannerMapper.deleteById(id);
        return AjaxResult.success();
    }
}
