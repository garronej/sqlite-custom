# sqlite-custom

Convert MySQL database to SQLite3 database: 
https://github.com/dumblob/mysql2sqlite

````bash
$ mysqldump --no-data -u root -pabcde12345 chan_dongle > dump_mysql.sql
$ ./mysql2sqlite dump_mysql.sql | sqlite3 test.db
````