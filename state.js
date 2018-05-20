const api = require('./utils');
// setInterval(function() {
api._state('TAO', 'XIY', '2018/05/15').then(function(r) {
        console.log(r);
    }, function(e) {
        console.log(e);
    })
    // }, 60000);