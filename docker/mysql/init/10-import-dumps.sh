#!/usr/bin/env sh
set -eu

root_password="${MYSQL_ROOT_PASSWORD:-root_secret}"
app_user="${MYSQL_USER:-timesheet}"
master_database="${MYSQL_MASTER_DUMP_DATABASE:-master_db}"
sub_database="${MYSQL_SUB_DUMP_DATABASE:-sub_company_db}"

mysql_exec() {
    mysql -uroot -p"${root_password}" "$@"
}

create_database_and_grant() {
    database="$1"
    mysql_exec -e "CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql_exec -e "GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${app_user}'@'%'; FLUSH PRIVILEGES;"
}

import_dump() {
    dump_path="$1"
    database="$2"

    if [ ! -s "$dump_path" ]; then
        echo "SQL dump not found or empty: ${dump_path}. Skipping."
        return 0
    fi

    echo "Importing ${dump_path} into auxiliary database ${database}..."
    create_database_and_grant "$database"

    if mysql_exec "$database" < "$dump_path"; then
        echo "Imported ${dump_path} into ${database}."
    else
        echo "Warning: failed to import ${dump_path}. Laravel migrations will still run for the application database."
    fi
}

import_dump "/tmp/master_db.sql" "$master_database"
import_dump "/tmp/sub_company_db.sql" "$sub_database"
