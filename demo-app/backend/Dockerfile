FROM node:20-alpine

WORKDIR /app

# Install dependencies first (Docker cache layer)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "src/index.js"]
