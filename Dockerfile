# ==============================================================================
# Stage 1: Build & Package Stage (Using official Maven + Temurin JDK 17)
# ==============================================================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy POM file and download dependencies first for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 2: Hardened Runtime Stage (Minimal Alpine JRE & Non-Root User)
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create a dedicated non-root system group & user for security hardening
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create directory for uploads with non-root ownership
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Copy compiled JAR from builder stage (excluding build tools, Maven, and source code)
COPY --from=builder --chown=appuser:appgroup /build/target/TicketDesk-0.0.1-SNAPSHOT.jar app.jar

# Switch execution context to non-root user
USER appuser:appgroup

# Expose container web port
EXPOSE 8080

# Default environment variables (overridden via AWS ECS task definition or docker run)
ENV DB_HOST=localhost \
    DB_PORT=3306 \
    DB_NAME=ticketdesk \
    DB_USER=root \
    JWT_EXPIRATION_MS=86400000

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
