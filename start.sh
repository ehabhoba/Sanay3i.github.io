#!/bin/bash
# تشغيل خادم PHP ليستمع على جميع الشبكات
php -S 0.0.0.0:8000 -t ./

# تشغيل خادم WebSocket للدردشة وتتبع المواقع
node websocket-server.js &

# تشغيل Redis للتخزين المؤقت
redis-server &

# عرض رسالة تأكيد
echo "المنصة تعمل الآن على http://<your-ip>:8000"
