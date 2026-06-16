FROM node:20-alpine

WORKDIR /app

# 复制后端依赖
COPY backend/package.json ./backend/
RUN cd backend && npm install --production

# 复制后端代码
COPY backend/ ./backend/

# 前端静态文件
COPY index.html center.html settings.html new-book.html work-list.html template-library.html architecture.html write.html data-predict.html predict-result.html ./
COPY assets/ ./assets/

# 数据目录
RUN mkdir -p /app/data

EXPOSE 3456

CMD ["node", "backend/server.js"]
