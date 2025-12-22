# 使用轻量级的 Nginx 镜像作为基础
FROM nginx:alpine

# 移除默认的 Nginx 配置文件
RUN rm /etc/nginx/conf.d/default.conf

# 将自定义的 Nginx 配置添加到容器中
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将项目文件复制到 Nginx 的默认静态文件目录
# 注意：项目文件在 Dockerfile 所在的目录，即 DiamondFrenzy-Web/
COPY . /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
