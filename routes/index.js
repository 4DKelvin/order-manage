const express = require('express');
const router = express.Router();
const utils = require('../utils');
const n = function(num) {
    if (Number(num) < 10) {
        return '0' + num;
    }
    return num;
};
const format = function(date) {
    var d = date ? new Date(Date.parse(decodeURIComponent(date))) : new Date();
    return [d.getFullYear(), n(d.getMonth() + 1), n(d.getDate())].join('-') + ' ' + [n(d.getHours()), n(d.getMinutes()), n(d.getSeconds())].join(':');
};
const formatTime = function(date) {
    var d = date ? new Date(date + (8 * 60 * 60 * 1000)) : new Date();
    return [n(d.getHours()), n(d.getMinutes())].join(':')
};
const formatDate = function(date) {
    var d = date ? new Date(Date.parse(decodeURIComponent(date))) : new Date();
    return [d.getFullYear(), n(d.getMonth() + 1), n(d.getDate())].join('-');
};
/* GET home page. */
router.get('/', function(req, res, next) {
    var d = new Date(),
        start = [d.getFullYear(), n(d.getMonth() + 1), n(d.getDate())].join('-') + ' 00:00:00',
        end = [d.getFullYear(), n(d.getMonth() + 1), n(d.getDate())].join('-') + ' 23:59:59',
        keyword = decodeURIComponent(req.query.keyword || '');
    utils.orders(format(req.query.start || start), format(req.query.end || end), req.query.page || 0, keyword).then(function(r) {
        res.render('index', {
            title: '订单管理',
            data: JSON.parse(JSON.stringify(r)),
            params: {
                start: format(req.query.start || start),
                end: format(req.query.end || end),
                keyword: keyword || '',
                page: req.query.page || 0
            }
        });
    }, function() {
        res.render('index', {
            title: '订单管理',
            data: [],
            params: {
                start: format(req.query.start || start),
                end: format(req.query.end || end),
                keyword: keyword || '',
                page: req.query.page || 0
            }
        });
    });
});
router.post('/spaces', function(req, res, next) {
    utils.create_space(req.body).then(function(r) {
        res.redirect('/spaces');
    }, function(e) {
        res.write('<script type="text/javascript">alert("' + e + '");history.back();</sciprt>');
    })
});
router.post('/settings', function(req, res, next) {
    utils.setValue(req.body.name, req.body.value).then(function(r) {
        res.redirect('/spaces');
    }, function(e) {
        res.write('<script type="text/javascript">alert("' + e + '");history.back();</sciprt>');
    })
});
router.get('/remove', function(req, res, next) {
    utils.remove_space(req.query.id).then(function(r) {
        res.redirect('/spaces');
    }, function(e) {
        res.write('<script type="text/javascript">alert("' + e + '");history.back();</sciprt>');
    })
});
router.get('/spaces', function(req, res, next) {
    // dep = req.query.dep || 'CTU'
    // arr = req.query.arr || 'SZX'
    // date = formatDate(req.query.date || '2018-05-28')
    var keyword = decodeURIComponent(req.query.keyword || '');
    utils.getSettings().then(function(settings) {
        utils.query_space(req.query.page || 0, keyword).then(function(r) {
            res.render('spaces', {
                title: '仓位管理',
                data: r,
                settings: settings,
                format: formatTime,
                params: {
                    keyword: keyword || '',
                    page: req.query.page || 0
                }
            });
        }, function(e) {
            res.render('spaces', {
                title: '仓位管理',
                data: [],
                settings: settings,
                params: {
                    keyword: keyword || '',
                    page: req.query.page || 0
                }
            });
        })
    }, function(e) {
        res.write('<script type="text/javascript">alert("' + e + '");history.back();</sciprt>');
    })
});

router.post('/bind', function(req, res, next) {
    utils.bindUser(req.body.order_id).then(function(r) {
        res.json(r);
    }, function(e) {
        res.json(e);
    })
});

router.post('/order', function(req, res, next) {
    utils.placeOrder(req.body.order_id, req.body.price).then(function(r) {
        res.json(r);
    }, function(e) {
        res.json(e);
    })
});

router.get('/refresh', function(req, res, next) {
    utils._refresh(req.query.wx_id).then(function(r) {
        res.json(r);
    }, function(e) {
        res.json(e);
    })
});

module.exports = router;