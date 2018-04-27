const express = require('express');
const router = express.Router();
const utils = require('../utils');
const n = function (num) {
    if (Number(num) < 10) {
        return '0' + num;
    }
    return num;
};
const format = function (date) {
    var d = new Date(Date.parse(decodeURIComponent(date)));
    return [d.getFullYear() + n(d.getMonth() + 1), n(d.getDate())].join('-') + ' ' +
        [n(d.getHours()), n(d.getMinutes()), n(d.getSeconds())].join(':');
};
/* GET home page. */
router.get('/', function (req, res, next) {
    var d = new Date(),
        start = [d.getFullYear() + n(d.getMonth() + 1), n(d.getDate())].join('-') + ' 00:00:00',
        end = [d.getFullYear() + n(d.getMonth() + 1), n(d.getDate())].join('-') + ' 23:59:59';
    utils.orders(format(req.query.start), format(req.query.end), req.query.page || 0).then(function (r) {
        res.render('index', {
            title: '订单管理',
            data: JSON.parse(JSON.stringify(r)),
            params: {
                start: format(req.query.start) || start,
                end: format(req.query.end) || end,
                page: req.query.page
            }
        });
    }, function () {
        res.render('index', {
            title: '订单管理',
            data: [],
            params: {
                start: format(req.query.start) || start,
                end: format(req.query.end) || end,
                page: req.query.page
            }
        });
    });
});

router.get('/bind', function (req, res, next) {
    utils.bindUser(req.query.order_id).then(function (r) {
        res.json(r);
    }, function (e) {
        res.json(e);
    })
});

router.get('/order', function (req, res, next) {
    utils.placeOrder(req.query.order_id, req.query.price).then(function (r) {
        res.json(r);
    }, function (e) {
        res.json(e);
    })
});

router.get('/refresh', function (req, res, next) {
    utils._refresh(req.query.wx_id).then(function (r) {
        res.json(r);
    }, function (e) {
        res.json(e);
    })
});

module.exports = router;
