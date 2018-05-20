const api = require('./utils');
const xml2json = require('node-xml2json');
// setInterval(function() {
api._state('CTU', 'SHA', '2018-05-28').then(function(r) {
        console.log(r);
        var res = xml2json.parser(r);
        console.log(res);
    }, function(e) {
        console.log(e);
    })
    // }, 60000);