package com.example.demo.config;

import com.example.demo.security.AuthTokenFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origin-patterns:*}")
    private String allowedOriginPatterns;

    private final AuthTokenFilter authTokenFilter;

    public SecurityConfig(AuthTokenFilter authTokenFilter) {
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/app/config", "/api/app/home").permitAll()
                .requestMatchers("/api/news/**").permitAll()
                .requestMatchers("/api/heritage/**").permitAll()
                .requestMatchers("/api/inheritor/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/activity/list", "/api/activity/*").permitAll()
                .requestMatchers("/api/ar-experiences/**").permitAll()
                .requestMatchers("/api/ar/projects/**").permitAll()
                .requestMatchers("/api/home/**").permitAll()
                .requestMatchers("/api/inheritor-community/**").permitAll()
                .requestMatchers("/api/banners/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                .requestMatchers("/api/app/me/**", "/api/user/**", "/api/files/**", "/api/ar/history/**", "/api/ar/statistics", "/api/activity/join").authenticated()
                .requestMatchers("/actuator/**").authenticated()
                .anyRequest().permitAll()
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> originPatterns = Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .collect(Collectors.toList());
        List<String> finalPatterns = originPatterns.isEmpty() ? Arrays.asList("*") : originPatterns;
        configuration.setAllowedOriginPatterns(finalPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(!finalPatterns.contains("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
