FROM nginx:latest

WORKDIR /usr/share/nginx/html

RUN apt-get update && \
    apt-get install vim -y

COPY ./public /usr/share/nginx/html

ENTRYPOINT [ "/docker-entrypoint.sh" ]
CMD [ "nginx", "-g", "daemon off;" ]

