#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

mkdir -p \
    storage/app/public \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwX storage bootstrap/cache || true

if [ "${DB_CONNECTION:-mysql}" = "mysql" ]; then
    wait-for-db.sh
fi

php artisan optimize:clear || true

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    php artisan db:seed --force
fi

php artisan storage:link || true

if [ "${RUN_LARAVEL_CACHE:-true}" = "true" ]; then
    php artisan config:cache || true
    php artisan view:cache || true
    php artisan route:cache || true
    php artisan optimize || true
fi

exec "$@"