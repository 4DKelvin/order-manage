const api = require('./utils');
api.get_sync_space().then(function(r) {
    console.log(r);
}, function(e) {
    console.error(e);
})