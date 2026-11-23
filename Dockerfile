FROM node:20-bookworm-slim

# Install dependencies sistem (ffmpeg, git, python3, build tools untuk sharp/native modules)
RUN apt-get update && \
    apt-get install -y --no-install-recommends git ffmpeg curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces menjalankan container sebagai user non-root (UID 1000)
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

# Copy package.json dan install dependencies terlebih dahulu (optimasi layer cache)
COPY --chown=user:user package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy seluruh source code bot KIR4LR
COPY --chown=user:user . .

# Pastikan folder storage, database, dan tmp bisa ditulis oleh user non-root
RUN mkdir -p /home/user/app/storage/session /home/user/app/src/database /home/user/app/tmp /home/user/app/backups && \
    chown -R user:user /home/user/app

USER user
ENV HOME=/home/user \
    PORT=7860 \
    TZ=Asia/Jakarta

EXPOSE 7860

# Jalankan HTTP keepalive server (port 7860) + bot KIR4LR sekaligus
CMD ["sh", "-c", "node keepalive.js & node index.js"]
