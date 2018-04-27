const request = require('request');
const Order = require('./db').Order;
const xml2json = require('node-xml2json');
//setInterval(function () {
var date = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()].join('-'),
    start_time = date + [new Date().getHours(), new Date().getMinutes(), '00'].join(':'),
    end_time = date + [new Date().getHours(), new Date().getMinutes(), '00'].join(':');
start_time = '2018-4-2 00:00:00';
end_time = '2018-4-2 23:59:59';
request.post({
    url: 'http://fuwu.jiulvxing.com/autoOta/orderExport?domain=yfh&user=17373761393&pass=741852&type=incr&start=' +
    start_time + '&end=' + end_time
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var res = xml2json.parser(body);
        if (res.result && res.result.status != 'error') {
            res.result.order.forEach(function (e) {
                var order = {};
                for (var key in e) {
                    order[key] = e[key];
                }
                Order.update({id: order.id}, order, {strict: false, upsert: true}, function (err, data) {

                });
            })
        }
    }
});
//}, 60000);