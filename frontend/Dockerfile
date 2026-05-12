FROM node:18-alpine

WORKDIR /app

# Only copy package files first to speed up builds
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]