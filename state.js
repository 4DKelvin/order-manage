const api = require('./utils');
const parseString = require('xml2js').parseString;
// setInterval(function() {
api._state('CTU', 'SZX', '2018-05-28').then(function(r) {
            parseString(r, function(err, res) {
                var data = res.string._,
                    items = data.split(',E#'),
                    res_data = [];
                items.forEach(function(e) {
                    var values = e.split(',');
                    if (values.length >= 7) {
                        (values[7] || '').replace(/(\S\S)/g, function(e) {
                            var val = e.replace(/([a-zA-Z])([0-9])/g, '$1 $2');
                            if (val.indexOf(' ') >= 0) {
                                var spaces = {},
                                    vals = val.split(' ');
                                spaces[vals[0]] = vals[1];
                                res_data.push({
                                    date: values[0],
                                    dep_time: values[1],
                                    arr_time: values[2],
                                    flight_no: values[3] + values[4],
                                    dep_city: values[5],
                                    arr_city: values[6],
                                    spaces: spaces
                                });
                            }
                        });
                    }
                    console.dir(res_data);
                });
            });
        },
        function(e) {
            console.log(e);
        })
    // }, 60000);