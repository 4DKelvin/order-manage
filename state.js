const api = require('./utils');
const parseString = require('xml2js').parseString;
// setInterval(function() {
api._state('CTU', 'SHA', '2018-05-28').then(function(r) {
        parseString(r, function(err, res) {
            console.dir(res.string);
        });
    }, function(e) {
        console.log(e);
    })
    // }, 60000);