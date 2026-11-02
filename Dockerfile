# Multi-stage Docker build for Hospital Appointment & Patient Management System

# Stage 1: Build the Spring Boot application using Maven
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven Wrapper and POM first to leverage Docker layer caching
COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./

# Normalize line endings and ensure execution permission
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Resolve dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy backend source (including embedded frontend static assets in src/main/resources/static/)
COPY backend/src/ src/

# Build executable fat JAR (skip test execution during image packaging)
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal, secure JRE runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run as non-root user for security best practices
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy packaged JAR from build stage
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

# Cloud platforms (Render, Railway, etc.) dynamically set the PORT environment variable
ENV PORT=8080
EXPOSE ${PORT}

# Container-aware memory allocation (75% RAM limit) & fast entropy source
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
