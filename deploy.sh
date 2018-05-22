cd /root/order-manage/
git pull
npm install
pm2 flush
pm2 restart bin/www
pm2 restart timesupdate.js