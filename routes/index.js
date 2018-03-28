var express = require('express');
var router = express.Router();
var request = require('request');
var xml2json = require('node-xml2json');
var querystring = require('querystring');

/* GET home page. */
router.get('/', function (req, res, next) {
    request('http://45.33.18.90/order?' + querystring.stringify({
            type: 'incr',
            start: req.query.start,
            end: req.query.end,
            _: new Date().getTime()
        }), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            response = xml2json.parser(response.res);
            console.log(response);
            res.render('index', {title: '订单管理', data: response.result, params: req.query});
        }
    });
});

router.get('/order', function (req, res, next) {
    request.post({
        url: 'http://fuwu.jiulvxing.com/autoOta/orderExport',
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        form: {
            domain: 'yfh',
            user: '17373761393',
            pass: '741852',
            type: req.query.type,
            start: req.query.start,
            end: req.query.end
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json({res: body});
        } else {
            res.send(500)
        }
    });
});

module.exports = router;
