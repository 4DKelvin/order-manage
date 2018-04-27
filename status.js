const request = require('request');
const utils = require('./utils');
setInterval(function () {
    utils.refreshAll().then(function (r) {
        console.log(r);
    }, function (e) {
        console.log(e);
    })
}, 1000);