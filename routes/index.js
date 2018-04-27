const express = require('express');
const router = express.Router();
const request = require('request');
const querystring = require('querystring').stringify;
const Order = require('../db').Order;
const Config = require('../db').Config;

function getWxId() {
    return new Promise(function (resolve, reject) {
        Config.findOne({key: 'wx_id'}, {value: 1, _id: 0}).exec(function (err, res) {
            if (err)reject(err);
            else if (res) {
                console.log(res);g
                resolve(res);
            }
            else {
                request('http://172.105.232.134:12345/new_get_wx?uid=mrr3kX2ToSgyvbP', function (error, response, body) {
                    if (error || body.data.wx_id)reject(error);
                    else {
                        new Config({key: 'wx_id', value: body.data.wx_id}).save(function (e, c) {
                            if (e)reject(e);
                            else resolve(c.value);
                        });
                    }
                })
            }
        })
    });
}

/* GET home page. */
router.get('/', function (req, res, next) {
    request('http://45.33.18.90/get_wx', function (e, r, b) {
        request('http://45.33.18.90/get_bind_status', function (e1, r1, b1) {
            var status = JSON.parse(r1.body).data;
            request('http://45.33.18.90/order?' + querystring({
                    start: req.query.start,
                    end: req.query.end
                }), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    response = JSON.parse(body);
                    response = xml2json.parser(response.res);
                    res.render('index', {
                        title: '订单管理',
                        data: response.result,
                        coupon: status.coupon,
                        used_coupon: status.used_coupon,
                        params: {
                            phone: status.phone,
                            pwd: status.pwd,
                            wx_id: status.wx_id,
                            start: req.query.start,
                            end: req.query.end
                        }
                    });
                }
            });
        });
    })
});


router.get('/get_wx', function (req, res) {
    getWxId().then(function (r) {
        res.json({wx_id: r});
    }, function (e) {
        res.send(500)
    });
});

router.get('/get_bind_status', function (req, res) {
    fs.readFile('wx_id.json', function (e, data) {
        request('http://172.105.232.134:12345/get_bind_status?' + querystring.stringify({
                uid: 'mrr3kX2ToSgyvbP',
                wx_id: JSON.parse(data).data.wx_id
            }), function (error, response, body) {
            res.json(JSON.parse(response.body));
        })
    });
});

router.post('/upload_order', function (req, res) {
    var order = req.body;
    order.passengers = JSON.parse(order.passengers);
    if (!order.passengers.length) {
        order.passengers = [order.passengers];
    }
    Promise.all(order.passengers.map(function (passenger) {
        return new Promise(function (resolve, reject) {
            request('http://172.105.232.134:12345/upload_order?' + querystring.stringify({
                    uid: 'mrr3kX2ToSgyvbP',
                    wx_id: order.wx_id,
                    phone: order.phone,
                    dep: order.dep,
                    arr: order.arr,
                    flight_no: order.flight_no,
                    date: order.date,
                    cabin: order.cabin,
                    name: passenger.name,
                    nid: passenger.cardnum,
                    method_order: order.method_order,
                    order_price: order.order_price / passenger.length,
                    oid: order.oid
                }), function (err, res) {
                if (err) return reject(err);
                resolve(JSON.parse(res.body))
            });
        });
    })).then(function () {
        var result = {};
        Array.prototype.forEach.call(arguments, function (e) {
            result = e;
        });
        res.json({
            msg: result.map(function (e, i) {
                return order.passengers[i].name + ' ' + (e.status == -1 ? '下单失败' : '下单成功') + ' 原因:' + e.desc;
            }).join('\n')
        });
    }, function () {
        res.json({msg: '下单失败'})
    });
});
router.get('/order_by_oid', function (req, res) {
    request('http://172.105.232.134:12345/order_by_oid?' + querystring.stringify({
            uid: 'mrr3kX2ToSgyvbP',
            oid: req.query.oid,
            _: new Date().getTime()
        }), function (error, response, body) {
        res.json(response);
    })
});

router.get('/order', function (req, res, next) {
    request.post({
        url: 'http://fuwu.jiulvxing.com/autoOta/orderExport?domain=yfh&user=17373761393&pass=741852&type=incr&start=' +
        decodeURI(req.query.start) + ':00&end=' +
        decodeURI(req.query.end) + ':00'
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json({res: body});
        } else {
            res.send(500)
        }
    });
});

module.exports = router;
