FROM node:20-bookworm

ARG SONAR_SCANNER_VERSION=7.0.2.4839
ARG SONAR_SCANNER_ZIP=sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip
ARG SONAR_SCANNER_DIR=sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64

# Dependencias base + Java 17 (necesario para sonar-scanner) + herramientas
RUN apt-get update && apt-get install -y \
    wget unzip ca-certificates gnupg \
    openjdk-17-jre \
    chromium chromium-sandbox \
  && rm -rf /var/lib/apt/lists/*

# SonarScanner CLI
RUN wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/${SONAR_SCANNER_ZIP} \
  && unzip ${SONAR_SCANNER_ZIP} -d /opt \
  && rm ${SONAR_SCANNER_ZIP} \
  && ln -s /opt/${SONAR_SCANNER_DIR}/bin/sonar-scanner /usr/local/bin/sonar-scanner

# Puppeteer: usar Chromium del sistema
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Algunos fonts ayudan a evitar renders raros/headless
RUN apt-get update && apt-get install -y fonts-liberation fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
