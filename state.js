const api = require('./utils');
api.create_space({
    id: '1628664980699314',
    flight_no: 'FM2242',
    flight_date: '2018-05-28',
    dep_city: 'CTU',
    dep_time: '2100',
    arr_city: 'SZX',
    arr_time: '2320',
    space_name: 'A',
    updated_at: 1527015695635,
    space_count: -1
}).then(function(r) {
    console.log(r);
}, function(e) {
    console.error(e);
})