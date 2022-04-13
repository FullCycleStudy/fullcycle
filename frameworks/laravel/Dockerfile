FROM php:7.4-cli
WORKDIR /var/www/html

RUN apt-get update  && \
    apt-get install zip -y
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');"
RUN php composer.phar create-project --prefer-dist laravel/laravel laravel

ENTRYPOINT [ "php", "laravel/artisan", "serve" ]
CMD [ "--host=0.0.0.0" ]