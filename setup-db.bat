@echo off
echo Setting up Sanai3y database...

mysql -u sanai3y_user -p sanai3y_db < schema.sql
mysql -u sanai3y_user -p sanai3y_db < init.sql
mysql -u sanai3y_user -p sanai3y_db < migrations.sql
mysql -u sanai3y_user -p sanai3y_db < updates.sql

echo Database setup complete!
pause
