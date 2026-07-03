#!/usr/bin/env sh
set -eu

timeout="${DB_WAIT_TIMEOUT:-60}"

echo "Waiting for MySQL at ${DB_HOST:-mysql}:${DB_PORT:-3306}..."

start_time="$(date +%s)"
while true; do
    if php -r '
        $host = getenv("DB_HOST") ?: "mysql";
        $port = getenv("DB_PORT") ?: "3306";
        $database = getenv("DB_DATABASE") ?: "timesheet_management";
        $username = getenv("DB_USERNAME") ?: "timesheet";
        $password = getenv("DB_PASSWORD") ?: "timesheet_secret";
        try {
            new PDO("mysql:host={$host};port={$port};dbname={$database}", $username, $password, [
                PDO::ATTR_TIMEOUT => 3,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            exit(0);
        } catch (Throwable $e) {
            exit(1);
        }
    '; then
        echo "MySQL is ready."
        exit 0
    fi

    now="$(date +%s)"
    elapsed="$((now - start_time))"
    if [ "$elapsed" -ge "$timeout" ]; then
        echo "Timed out waiting for MySQL database ${DB_DATABASE:-timesheet_management} as ${DB_USERNAME:-timesheet}."
        exit 1
    fi

    sleep 2
done