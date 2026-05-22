# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

This repository contains an **Intangible Cultural Heritage (非遗传承) system** with two sub-projects:

- **`chuanzhiback/demo`** — Spring Boot 3.5.8 REST API (Java 17 source level, runs on Java 21).
- **`chuanzhifron`** — WeChat Mini Program frontend (cannot be run or tested in a headless Linux VM; requires WeChat Developer Tools on Windows/macOS).

Cloud agents should focus on the **backend** (`chuanzhiback/demo`).

### Required services

| Service | How to start | Default port |
|---------|-------------|-------------|
| MySQL 8 | `sudo mysqld --user=mysql --datadir=/var/lib/mysql --socket=/var/run/mysqld/mysqld.sock --pid-file=/var/run/mysqld/mysqld.pid &` | 3306 |
| Redis | `sudo redis-server --daemonize yes` | 6379 |
| Spring Boot backend | `cd chuanzhiback/demo && ./mvnw spring-boot:run` | 8001 |

### Database setup

On first run, create the database:

```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS intangible_heritage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '20250709'; FLUSH PRIVILEGES;"
```

The app's dev profile (`application-dev.properties`) defaults to `root` / `20250709` on `localhost:3306`. Schema bootstrap runs automatically via `SchemaBootstrapRunner` when `SCHEMA_BOOTSTRAP=true` (the dev default), so no manual SQL import is needed.

### Running the backend

```bash
cd chuanzhiback/demo
./mvnw spring-boot:run
```

Health check: `curl http://localhost:8001/actuator/health`

### Running tests

```bash
cd chuanzhiback/demo
./mvnw test
```

There is one integration test (`DemoApplicationTests.contextLoads`) that requires MySQL and Redis to be running.

### Lint / static analysis

No dedicated lint tool is configured. Use `./mvnw compile` to catch compilation errors.

### Gotchas

- The `compose.yaml` in the backend dir is not used at runtime (Spring Boot's `spring.docker.compose.enabled=false`). Do not rely on it.
- The frontend is a WeChat Mini Program and cannot be tested on Linux VMs.
- MySQL's apt post-install script may fail in container environments; start `mysqld` manually if `systemctl` is unavailable (see service table above).
- The dev profile seeds sample data automatically (`INIT_SAMPLE_DATA=true`, `SEED_AR_PROJECT_TABLE=true`).
