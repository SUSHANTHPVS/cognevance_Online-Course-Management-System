FROM node:18-bullseye

# Small execution image with common compilers and runtimes used by the platform
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openjdk-17-jdk \
    gcc \
    g++ \
    make \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

ENV LANG=C.UTF-8

# Create an unprivileged user to run code safely
RUN groupadd -r executor && useradd -r -g executor -u 10001 -m -d /home/executor executor \
  && mkdir -p /workspace \
  && chown -R executor:executor /workspace /home/executor

# Use non-root user by default for safety
USER executor

# Keep default shell available; the server will run commands via: docker run ... bash -lc
CMD ["bash"]
