var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  request.post({
    url: 'http://fuwu.jiulvxing.com/autoOta/orderExport',
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    form: {
      domain:'yfh',
      user:'17373761393',
      pass:'741852',
      type:'incr',
      start:'2018-03-26',
      end:'2018-03-28',
    }
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
    }
  });
  res.render('index', { title: '订单管理' });
});

module.exports = router;
