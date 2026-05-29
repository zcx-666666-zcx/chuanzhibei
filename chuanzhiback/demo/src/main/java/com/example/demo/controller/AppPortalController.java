package com.example.demo.controller;

import com.example.demo.common.Result;
import com.example.demo.entity.Banner;
import com.example.demo.entity.Heritage;
import com.example.demo.entity.News;
import com.example.demo.entity.User;
import com.example.demo.entity.UserBooking;
import com.example.demo.entity.UserCollection;
import com.example.demo.security.AuthUtils;
import com.example.demo.service.AppClientConfigService;
import com.example.demo.service.BannerService;
import com.example.demo.service.HeritageService;
import com.example.demo.service.NewsService;
import com.example.demo.service.UserBookingService;
import com.example.demo.service.UserCollectionService;
import com.example.demo.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/app")
public class AppPortalController {

    private static final int HOME_NEWS_SIZE = 5;
    private static final int PREVIEW_SIZE = 3;
    private static final int NICKNAME_MAX_LEN = 32;
    private static final int SIGNATURE_MAX_LEN = 50;

    private final BannerService bannerService;
    private final NewsService newsService;
    private final HeritageService heritageService;
    private final UserService userService;
    private final UserCollectionService userCollectionService;
    private final UserBookingService userBookingService;
    private final AppClientConfigService appClientConfigService;

    public AppPortalController(
            BannerService bannerService,
            NewsService newsService,
            HeritageService heritageService,
            UserService userService,
            UserCollectionService userCollectionService,
            UserBookingService userBookingService,
            AppClientConfigService appClientConfigService) {
        this.bannerService = bannerService;
        this.newsService = newsService;
        this.heritageService = heritageService;
        this.userService = userService;
        this.userCollectionService = userCollectionService;
        this.userBookingService = userBookingService;
        this.appClientConfigService = appClientConfigService;
    }

    @GetMapping("/config")
    public ResponseEntity<Result<Map<String, Object>>> getClientConfig() {
        return ResponseEntity.ok(Result.success(appClientConfigService.getPublicClientConfig()));
    }

    @GetMapping("/home")
    public ResponseEntity<Result<Map<String, Object>>> getHomePayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        List<Banner> banners = bannerService.getAllBanners();
        List<News> news = extractNewsList(newsService.getRecentPage(0, HOME_NEWS_SIZE).get("list"));
        List<Heritage> recommended = heritageService.getRecommendedHeritages();

        payload.put("bannerList", mapBanners(banners));
        payload.put("newsList", mapNews(news));
        payload.put("recommendList", mapHeritages(recommended));
        payload.put("notifications", buildNotifications(news));
        payload.put("clientConfig", appClientConfigService.getPublicClientConfig());
        return ResponseEntity.ok(Result.success(payload));
    }

    @GetMapping("/me/overview")
    public ResponseEntity<Result<Map<String, Object>>> getMyOverview() {
        Long userId = AuthUtils.currentUserId();
        User user = requireUser(userId);
        List<UserCollection> collections = userCollectionService.getUserCollectionsByUserId(userId);
        List<UserBooking> bookings = userBookingService.getUserBookingsByUserId(userId);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("profile", mapUser(user));
        payload.put("stats", Map.of(
                "collections", collections.size(),
                "bookings", bookings.size()
        ));
        payload.put("collectionPreview", mapCollectionPreview(collections));
        payload.put("bookingPreview", mapBookingPreview(bookings));
        payload.put("preferences", Map.of(
                "privacyEnabled", true,
                "notificationEnabled", true
        ));
        return ResponseEntity.ok(Result.success(payload));
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<Result<Map<String, Object>>> updateMyProfile(@RequestBody Map<String, Object> request) {
        Long userId = AuthUtils.currentUserId();
        User user = requireUser(userId);

        String nickname = normalizeText(request.get("nickname"));
        String signature = normalizeText(request.get("signature"));
        String avatarUrl = normalizeText(request.get("avatarUrl"));
        String email = normalizeText(request.get("email"));

        if (!nickname.isEmpty()) {
            if (nickname.length() > NICKNAME_MAX_LEN) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "昵称最长 32 个字符");
            }
            user.setNickname(nickname);
        }
        if (signature.length() > SIGNATURE_MAX_LEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "个性签名最长 50 个字符");
        }
        user.setSignature(signature);
        if (!avatarUrl.isEmpty()) {
            user.setAvatarUrl(avatarUrl);
        }
        if (!email.isEmpty()) {
            user.setEmail(email);
        }
        user.setUpdateTime(LocalDateTime.now());

        User updated = userService.saveUser(user);
        return ResponseEntity.ok(Result.success("保存成功", mapUser(updated)));
    }

    private User requireUser(Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在");
        }
        return user;
    }

    private List<News> extractNewsList(Object raw) {
        if (raw instanceof List<?>) {
            List<?> list = (List<?>) raw;
            List<News> result = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof News news) {
                    result.add(news);
                }
            }
            return result;
        }
        return List.of();
    }

    private List<Map<String, Object>> mapBanners(List<Banner> banners) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Banner banner : banners) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", banner.getId());
            item.put("title", banner.getTitle());
            item.put("description", banner.getDescription());
            item.put("imageUrl", banner.getImageUrl());
            item.put("image", banner.getImageUrl());
            item.put("newsId", banner.getNewsId());
            result.add(item);
        }
        return result;
    }

    private List<Map<String, Object>> mapNews(List<News> newsList) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (News news : newsList) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", news.getId());
            item.put("title", news.getTitle());
            item.put("description", news.getDescription());
            item.put("content", news.getContent());
            item.put("imageUrls", news.getImageUrls());
            item.put("publishTime", news.getPublishTime());
            item.put("author", news.getAuthor());
            result.add(item);
        }
        return result;
    }

    private List<Map<String, Object>> mapHeritages(List<Heritage> heritageList) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Heritage heritage : heritageList) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", heritage.getId());
            item.put("name", heritage.getName());
            item.put("description", heritage.getDescription());
            item.put("imageUrl", heritage.getImageUrl());
            item.put("image", heritage.getImageUrl());
            item.put("region", heritage.getRegion());
            item.put("category", heritage.getCategory());
            item.put("level", heritage.getLevel());
            result.add(item);
        }
        return result;
    }

    private List<Map<String, Object>> buildNotifications(List<News> newsList) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        for (News news : newsList) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", news.getId());
            item.put("title", news.getTitle());
            item.put("content", news.getDescription());
            item.put("time", news.getPublishTime());
            item.put("type", "news");
            notifications.add(item);
        }
        return notifications;
    }

    private List<Map<String, Object>> mapCollectionPreview(List<UserCollection> collections) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < Math.min(PREVIEW_SIZE, collections.size()); i++) {
            UserCollection collection = collections.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", collection.getId());
            item.put("heritageId", collection.getHeritageId());
            item.put("name", valueOrDefault(collection.getHeritageName(), "未命名项目"));
            item.put("description", valueOrDefault(collection.getHeritageDescription(), ""));
            item.put("level", valueOrDefault(collection.getHeritageLevel(), ""));
            item.put("imageUrl", valueOrDefault(collection.getImageUrl(), ""));
            item.put("image", valueOrDefault(collection.getImageUrl(), ""));
            result.add(item);
        }
        return result;
    }

    private List<Map<String, Object>> mapBookingPreview(List<UserBooking> bookings) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < Math.min(PREVIEW_SIZE, bookings.size()); i++) {
            UserBooking booking = bookings.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", booking.getId());
            item.put("type", booking.getType());
            item.put("status", booking.getStatus());
            item.put("statusText", resolveStatusText(booking.getStatus()));
            item.put("time", valueOrDefault(booking.getTime(), "待确认"));
            item.put("location", valueOrDefault(booking.getLocation(), "待确认"));
            item.put("contact", valueOrDefault(booking.getContact(), "待确认"));
            item.put("masterId", booking.getMasterId());
            item.put("masterName", valueOrDefault(resolveBookingTitle(booking), "未命名预约"));
            item.put("skill", valueOrDefault(booking.getSkill(), ""));
            item.put("masterAvatar", valueOrDefault(booking.getMasterAvatar(), ""));
            item.put("activityId", booking.getActivityId());
            item.put("activityTitle", valueOrDefault(booking.getActivityTitle(), ""));
            result.add(item);
        }
        return result;
    }

    private Map<String, Object> mapUser(User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.getId());
        payload.put("userId", user.getId());
        payload.put("username", user.getUsername());
        payload.put("nickname", user.getNickname());
        payload.put("nickName", user.getNickname());
        payload.put("avatarUrl", user.getAvatarUrl());
        payload.put("signature", user.getSignature());
        payload.put("email", user.getEmail());
        payload.put("gender", user.getGender());
        payload.put("country", user.getCountry());
        payload.put("province", user.getProvince());
        payload.put("city", user.getCity());
        payload.put("language", user.getLanguage());
        payload.put("displayName", firstNonBlank(
                user.getNickname(),
                user.getUsername(),
                "访客"
        ));
        payload.put("displayTitle", firstNonBlank(
                user.getSignature(),
                "非遗文化爱好者"
        ));
        return payload;
    }

    private String resolveStatusText(String status) {
        return switch (valueOrDefault(status, "pending")) {
            case "confirmed" -> "已确认";
            case "cancelled" -> "已取消";
            case "completed" -> "已完成";
            default -> "待确认";
        };
    }

    private String resolveBookingTitle(UserBooking booking) {
        if (booking == null) {
            return "";
        }
        if ("experience".equals(booking.getType())) {
            return booking.getMasterName();
        }
        return booking.getActivityTitle();
    }

    private String normalizeText(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
