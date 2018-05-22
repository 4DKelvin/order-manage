const api = require('./utils');
api.get_sync_space().then(function(r) {
    var nModified = eval(r.map(function(e) {
        return e.nModified;
    }).join('+'));
    console.log(r, nModified);
}, function(e) {
    console.error(e);
})