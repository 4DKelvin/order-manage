const api = require('./utils');
const xml2json = require('node-xml2json');
// setInterval(function() {
api._state('TAO', 'XIY', '2018/05/15').then(function(r) {
        var res = xml2json.parser(r.data);
        console.log(res);
    }, function(e) {
        console.log(e);
    })
    // }, 60000);