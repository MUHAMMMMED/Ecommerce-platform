# استخدم نسخة Node محددة
FROM node:18-alpine 

WORKDIR /app

COPY package*.json ./

# تثبيت dependencies
RUN npm cache clean --force && npm install

# زيادة الذاكرة للـ build (إذا كبير)
ENV NODE_OPTIONS="--max_old_space_size=8192"

# نسخ المشروع
COPY . .

# بناء مشروع React/Vite
RUN npm run build

# تثبيت serve لتقديم الملفات الثابتة
RUN npm install -g serve

EXPOSE 3000

# serve يستخدم build folder بعد البناء
CMD ["serve", "-s", "build", "-l", "3000"]