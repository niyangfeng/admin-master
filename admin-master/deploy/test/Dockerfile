FROM nginx:1.17.6
USER root
RUN cd /etc/nginx &&  rm  -f nginx.conf
COPY nginx.conf /etc/nginx
COPY NginxName /etc/nginx/conf.d/
WORKDIR /etc/nginx/conf.d/
COPY ProJectName  ./ProJectName
RUN cd /etc/nginx/conf.d && rm -f default.conf
RUN mkdir /etc/nginx/logs/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]