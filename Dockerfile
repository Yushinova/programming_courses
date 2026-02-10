FROM node:22-alpine

WORKDIR /app

# 1. Копируем зависимости
COPY package*.json ./

# 2. Устанавливаем зависимости (без БД)
RUN npm install --legacy-peer-deps

# 3. Копируем остальное
COPY . .

RUN npm run build

# 5. Запускаем с РЕАЛЬНОЙ БД (переопределится в docker-compose)
EXPOSE 3000
CMD ["npm", "start"]