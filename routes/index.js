const express = require('express');
const router = express.Router();
const utils = require('../utils');


/* GET home page. */
router.get('/', function (req, res, next) {
    utils.orders(decodeURIComponent(req.query.start), decodeURIComponent(req.query.end), req.query.page || 0).then(function (r) {
        res.render('index', {
            title: '订单管理',
            data: r,
            params: {
                start: decodeURIComponent(req.query.start),
                end: decodeURIComponent(req.query.end),
                page: req.query.page
            }
        });
    }, function () {
        res.render('index', {
            title: '订单管理',
            data: [],
            params: {
                start: decodeURIComponent(req.query.start),
                end: decodeURIComponent(req.query.start),
                page: req.query.page
            }
        });
    });
});

router.get('/refresh', function (req, res, next) {
    utils._refresh(req.query.wx_id).then(function (r) {
        res.json(r);
    }, function (e) {
        res.json(e);
    })
});

module.exports = router;
