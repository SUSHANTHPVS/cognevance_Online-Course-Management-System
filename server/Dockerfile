FROM node:18-bullseye

# Install compilers and runtimes needed for code execution
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openjdk-17-jdk \
    gcc \
    g++ \
    make \
    python3 \
    python3-pip \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy server package manifests and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy server source
COPY . .

EXPOSE 5000

ENV PORT=5000

CMD ["npm", "start"]
FROM node:20

# Install Java
RUN apt-get update && apt-get install -y openjdk-17-jdk

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]