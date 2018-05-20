const api = require('./utils');
const parseString = require('xml2js').parseString;
// setInterval(function() {
api._state('CTU', 'SZX', '2018-05-28').then(function(r) {
        parseString(r, function(err, res) {
            var data = res.string._,
                items = data.split(',E#'),
                res_data = items.map(function(e) {
                    var values = e.split(','),
                        spaces = [];
                    (values[7] || '').replace(/(\S\S)/g, function(e) {
                        spaces.push(e);
                    });
                    return {
                        date: values[0],
                        dep_time: values[1],
                        arr_time: values[2],
                        flight_no: values[3] + values[4],
                        dep_city: values[5],
                        arr_city: values[6],
                        spaces: spaces
                    };
                });
            console.dir(res_data);
        });
    }, function(e) {
        console.log(e);
    })
    // }, 60000);