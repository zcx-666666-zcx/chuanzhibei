package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.WxUser;
import com.ruoyi.heritage.mapper.WxUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 小程序用户管理
 */
@RestController
@RequestMapping("/business/wxuser")
public class WxUserController {

    @Autowired
    private WxUserMapper wxUserMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('wxuser:list')")
    public TableDataInfo<WxUser> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                       @RequestParam(defaultValue = "10") Integer pageSize,
                                       @RequestParam(required = false) String nickname) {
        Page<WxUser> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<WxUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(nickname != null && !nickname.isEmpty(), WxUser::getNickname, nickname)
               .orderByDesc(WxUser::getCreateTime);
        Page<WxUser> result = wxUserMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('wxuser:query')")
    public AjaxResult<WxUser> getInfo(@PathVariable Long id) {
        return AjaxResult.success(wxUserMapper.selectById(id));
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('wxuser:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) wxUserMapper.deleteById(id);
        return AjaxResult.success();
    }
}
