FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema and seed
COPY prisma ./prisma

# Copy source code
COPY src ./src

# Copy other config files
COPY next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts ./

# Copy public assets if any
COPY public ./public 

# Generate Prisma Client
RUN npm run prisma:generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
