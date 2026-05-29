package com.ruoyi.web.controller.business;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.AjaxResult;
import com.ruoyi.common.core.TableDataInfo;
import com.ruoyi.heritage.domain.UserBooking;
import com.ruoyi.heritage.mapper.UserBookingMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 用户预约管理
 */
@RestController
@RequestMapping("/business/booking")
public class UserBookingController {

    @Autowired
    private UserBookingMapper bookingMapper;

    @GetMapping("/list")
    @PreAuthorize("@ss.hasPermi('booking:list')")
    public TableDataInfo<UserBooking> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                            @RequestParam(defaultValue = "10") Integer pageSize,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(required = false) String bookingType) {
        Page<UserBooking> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<UserBooking> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(status != null && !status.isEmpty(), UserBooking::getStatus, status)
               .eq(bookingType != null && !bookingType.isEmpty(), UserBooking::getBookingType, bookingType)
               .orderByDesc(UserBooking::getCreateTime);
        Page<UserBooking> result = bookingMapper.selectPage(page, wrapper);
        return TableDataInfo.build(result.getRecords(), result.getTotal());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@ss.hasPermi('booking:query')")
    public AjaxResult<UserBooking> getInfo(@PathVariable Long id) {
        return AjaxResult.success(bookingMapper.selectById(id));
    }

    @PutMapping
    @PreAuthorize("@ss.hasPermi('booking:edit')")
    public AjaxResult<Void> edit(@RequestBody UserBooking entity) {
        return bookingMapper.updateById(entity) > 0 ? AjaxResult.success() : AjaxResult.error();
    }

    @DeleteMapping("/{ids}")
    @PreAuthorize("@ss.hasPermi('booking:remove')")
    public AjaxResult<Void> remove(@PathVariable Long[] ids) {
        for (Long id : ids) bookingMapper.deleteById(id);
        return AjaxResult.success();
    }
}
