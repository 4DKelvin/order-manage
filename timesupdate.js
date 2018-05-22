const api = require('./utils');
setInterval(function() {
    api.get_sync_space().then(function(r) {
        var nModified = eval(r.map(function(e) {
            return e.nModified;
        }).join('+'));
        console.log('[' + new Date().toDateString() + ']' + nModified + 'rows updated.');
    })
}, 1000);