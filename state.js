const api = require('./utils');
const xml2json = require('node-xml2json');
// setInterval(function() {
api._state('CTU', 'SHA', '2018-05-28').then(function(r) {
        var res = xml2json.parser(r.data);
        console.log(res);
    }, function(e) {
        console.log(e);
    })
    // }, 60000);