const api = require('./utils');
const parseString = require('xml2js').parseString;
// setInterval(function() {
api._state('CTU', 'SHA', '2018-05-28').then(function(r) {
        parseString(r, function(err, res) {
            var data = res.string._,
                items = data.split(',E#')

            console.dir(items.map(function(e) {
                return e.split(',');
            }));
        });
    }, function(e) {
        console.log(e);
    })
    // }, 60000);