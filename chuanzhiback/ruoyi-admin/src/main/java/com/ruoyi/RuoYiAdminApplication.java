package com.ruoyi;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 传之贝 RuoYi 后台管理系统启动类
 *
 * @author chuanzhibei
 */
@SpringBootApplication
@MapperScan({"com.ruoyi.system.mapper", "com.ruoyi.heritage.mapper"})
public class RuoYiAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(RuoYiAdminApplication.class, args);
        System.out.println("(♥◠‿◠)ﾉﾞ  传之贝后台管理系统启动成功   ლ(´ڡ`ლ)ﾞ");
        System.out.println("后台接口文档: http://localhost:8080/swagger-ui.html");
    }
}
