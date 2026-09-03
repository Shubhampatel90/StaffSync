package com.staffsync.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<IpBlockFilter> ipBlockFilterRegistration(IpBlockFilter filter) {
        FilterRegistrationBean<IpBlockFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/api/auth/*", "/api/admin/*");
        registration.setOrder(1);
        return registration;
    }
}