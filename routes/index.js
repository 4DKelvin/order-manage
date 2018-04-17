var express = require('express');
var router = express.Router();
var request = require('request');
var xml2json = require('node-xml2json');
var querystring = require('querystring');

/* GET home page. */
router.get('/', function (req, res, next) {
    request('http://45.33.18.90/order?' + querystring.stringify({
            start: req.query.start,
            end: req.query.end
        }), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            response = xml2json.parser(response.res);
            request('http://45.33.18.90/get_wx', function (e, r, b) {
                res.render('index', {title: '订单管理', data: response.result, params: req.query, wx_id: r.wx_id});
            })
        }
    });
});


router.get('/get_wx', function (req, res) {
    request('http://172.105.232.134:12345/get_wx?uid=mrr3kX2ToSgyvbP', function (error, response, body) {
        console.log(response.body.data);
        res.json({wx_id: response.body.data.wx_id})
    })
});
router.get('/tc_wx_bind_all', function (req, res) {
    request('http://172.105.232.134:12345/tc_wx_bind_all' + querystring.stringify({
            uid: 'mrr3kX2ToSgyvbP',
            wx_id: req.query.wx_id,
            name_1: req.query.name_1,
            name_2: req.query.name_2,
            name_3: req.query.name_3,
            name_4: req.query.name_4,
            _: new Date().getTime()
        }), function (error, response, body) {
        res.json(response);
    })
});
router.post('/upload_order', function (req, res) {
    request('http://172.105.232.134:12345/upload_order' + querystring.stringify({
            uid: 'mrr3kX2ToSgyvbP',
            wx_id: req.query.wx_id,
            phone: req.query.phone,
            dep: req.query.dep,
            arr: req.query.arr,
            flight_no: req.query.flight_no,
            date: req.query.date,
            cabin: req.query.cabin,
            name: req.query.name,
            nid: req.query.nid,
            method_order: req.query.method_order,
            order_price: req.query.order_price,
            oid: req.query.oid,
            _: new Date().getTime()
        }), function (error, response, body) {
        res.json(response);
    })
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
