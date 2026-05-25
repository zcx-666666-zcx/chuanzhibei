package com.ruoyi.web.controller.system;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.system.domain.SysLogininfor;
import com.ruoyi.system.domain.SysOperLog;
import com.ruoyi.system.mapper.SysLogininforMapper;
import com.ruoyi.system.mapper.SysOperLogMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SysLogController {

    private final SysOperLogMapper operLogMapper;
    private final SysLogininforMapper logininforMapper;

    public SysLogController(SysOperLogMapper operLogMapper, SysLogininforMapper logininforMapper) {
        this.operLogMapper = operLogMapper;
        this.logininforMapper = logininforMapper;
    }

    @GetMapping("/monitor/operlog/list")
    @PreAuthorize("@ss.hasPermi('monitor:operlog:list')")
    public TableDataInfo<SysOperLog> operlogList(@RequestParam(defaultValue = "1") Integer pageNum,
                                                 @RequestParam(defaultValue = "10") Integer pageSize,
                                                 @RequestParam(required = false) String title) {
        Page<SysOperLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysOperLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(title != null && !title.isBlank(), SysOperLog::getTitle, title)
                .orderByDesc(SysOperLog::getOperTime);
        Page<SysOperLog> result = operLogMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/monitor/logininfor/list")
    @PreAuthorize("@ss.hasPermi('monitor:logininfor:list')")
    public TableDataInfo<SysLogininfor> logininforList(@RequestParam(defaultValue = "1") Integer pageNum,
                                                       @RequestParam(defaultValue = "10") Integer pageSize,
                                                       @RequestParam(required = false) String userName) {
        Page<SysLogininfor> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysLogininfor> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(userName != null && !userName.isBlank(), SysLogininfor::getUserName, userName)
                .orderByDesc(SysLogininfor::getLoginTime);
        Page<SysLogininfor> result = logininforMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }
}
