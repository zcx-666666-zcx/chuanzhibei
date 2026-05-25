#!/bin/bash
# ============================================================
# 传之贝 RuoYi 后台管理系统 — 一键部署脚本
# 运行方式: chmod +x setup-ruoyi.sh && ./setup-ruoyi.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 获取脚本所在目录（即 chuanzhiback 目录）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ADMIN_DIR="$SCRIPT_DIR/ruoyi-admin"
SQL_FILE="$SCRIPT_DIR/demo/src/main/resources/schema-bootstrap.sql"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  传之贝 RuoYi 后台管理系统 — 环境部署  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ============================================================
# 1. 检查 Java 版本
# ============================================================
echo -e "${YELLOW}[1/6] 检查 Java 版本...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}✗ 未检测到 Java，请先安装 JDK 17+${NC}"
    echo "  macOS:  brew install openjdk@17"
    echo "  Ubuntu: sudo apt install openjdk-17-jdk"
    exit 1
fi

JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '"\K[0-9]+' | head -1)
if [ -z "$JAVA_VER" ]; then
    JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '[0-9]+' | head -1)
fi

if [ "$JAVA_VER" -lt 17 ] 2>/dev/null; then
    echo -e "${RED}✗ Java 版本过低: $(java -version 2>&1 | head -1)${NC}"
    echo "  需要 Java 17 或以上版本"
    exit 1
fi
echo -e "${GREEN}✓ Java $JAVA_VER OK${NC}"

# ============================================================
# 2. 检查/安装 Maven
# ============================================================
echo -e "${YELLOW}[2/6] 检查 Maven...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${YELLOW}  Maven 未安装，正在自动安装...${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install maven
        else
            echo -e "${RED}  请先安装 Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
            exit 1
        fi
    else
        # Linux — 手动下载安装（无需 root）
        MVN_VERSION="3.9.9"
        MVN_DIR="$HOME/.local/maven"
        mkdir -p "$MVN_DIR"

        if [ ! -f "$MVN_DIR/bin/mvn" ]; then
            echo "  下载 Maven $MVN_VERSION..."
            curl -sL "https://dlcdn.apache.org/maven/maven-3/${MVN_VERSION}/binaries/apache-maven-${MVN_VERSION}-bin.tar.gz" | tar xz -C "$MVN_DIR" --strip-components=1
        fi

        export PATH="$MVN_DIR/bin:$PATH"
        echo "export PATH=\"$MVN_DIR/bin:\$PATH\"" >> "$HOME/.bashrc"
    fi
fi
echo -e "${GREEN}✓ Maven $(mvn -version 2>&1 | head -1 | grep -oP '[0-9]+\.[0-9]+\.[0-9]+') OK${NC}"

# ============================================================
# 3. 检查 MySQL
# ============================================================
echo -e "${YELLOW}[3/6] 检查 MySQL 连接...${NC}"
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASS="20250709"
DB_NAME="intangible_heritage"

if command -v mysql &> /dev/null; then
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME" 2>/dev/null; then
        echo -e "${GREEN}✓ 数据库 '$DB_NAME' 连接成功${NC}"
    else
        echo -e "${RED}✗ 无法连接数据库 $DB_NAME${NC}"
        echo "  请确认 MySQL 正在运行且密码正确"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ mysql 客户端未找到，跳过连接测试（编译不受影响）${NC}"
fi

# ============================================================
# 4. 初始化数据库结构
# ============================================================
echo -e "${YELLOW}[4/6] 初始化数据库结构...${NC}"
if [ -f "$SQL_FILE" ]; then
    if command -v mysql &> /dev/null; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE" 2>&1
        echo -e "${GREEN}✓ 数据库结构初始化完成（业务表 + 后台系统表）${NC}"
    else
        echo -e "${YELLOW}⚠ 跳过 SQL 初始化（无 mysql 客户端），请手动执行:${NC}"
        echo "  mysql -u $DB_USER -p $DB_NAME < $SQL_FILE"
    fi
else
    echo -e "${RED}✗ SQL 文件不存在: $SQL_FILE${NC}"
    exit 1
fi

# ============================================================
# 5. 启动 Redis（Docker 方式）
# ============================================================
echo -e "${YELLOW}[5/6] 检查 Redis...${NC}"
REDIS_OK=false

if command -v redis-cli &> /dev/null; then
    if redis-cli ping 2>/dev/null | grep -q "PONG"; then
        REDIS_OK=true
    fi
fi

if [ "$REDIS_OK" = false ]; then
    if command -v docker &> /dev/null; then
        # 检查是否已有 redis 容器
        if docker ps -a --format '{{.Names}}' | grep -q "redis-chuanzhibei"; then
            docker start redis-chuanzhibei > /dev/null 2>&1
        else
            echo "  使用 Docker 启动 Redis..."
            docker run -d --name redis-chuanzhibei -p 6379:6379 redis:7-alpine > /dev/null 2>&1
        fi
        REDIS_OK=true
        echo -e "${GREEN}✓ Redis (Docker) 已启动${NC}"
    else
        echo -e "${YELLOW}⚠ Redis 未启动，Docker 也不可用。后台系统的 token 管理功能需要 Redis。${NC}"
        echo "  启动方式（任选其一）:"
        echo "    docker run -d --name redis-chuanzhibei -p 6379:6379 redis:7-alpine"
        echo "    redis-server &"
    fi
else
    echo -e "${GREEN}✓ Redis 已运行${NC}"
fi

# ============================================================
# 6. 编译项目
# ============================================================
echo -e "${YELLOW}[6/6] 编译项目（跳过测试）...${NC}"
cd "$SCRIPT_DIR"

# Maven 阿里云镜像加速
mkdir -p "$HOME/.m2"
if [ ! -f "$HOME/.m2/settings.xml" ]; then
    cat > "$HOME/.m2/settings.xml" << 'MAVEN_SETTINGS'
<settings>
  <mirrors>
    <mirror>
      <id>aliyun-central</id>
      <mirrorOf>central</mirrorOf>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
MAVEN_SETTINGS
    echo "  已配置阿里云 Maven 镜像加速"
fi

mvn clean install -DskipTests -q 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 编译成功！${NC}"
else
    echo -e "${RED}✗ 编译失败，请查看上方错误信息${NC}"
    exit 1
fi

# ============================================================
# 完成
# ============================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！                          ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  启动后台管理系统:"
echo "    cd $ADMIN_DIR"
echo "    mvn spring-boot:run"
echo ""
echo "  或使用 JAR 启动:"
echo "    java -jar $ADMIN_DIR/target/ruoyi-admin-1.0.0.jar"
echo ""
echo "  启动后访问:"
echo "    Swagger 文档: http://localhost:8080/swagger-ui.html"
echo "    登录测试:     admin / admin123"
echo ""
echo "  小程序后端（原有，端口不变）:"
echo "    cd $SCRIPT_DIR/demo && mvn spring-boot:run"
echo ""
