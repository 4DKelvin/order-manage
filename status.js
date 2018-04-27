setInterval(function () {
    require('./utils').refreshAll().then(function (r) {
        console.log(r);
    }, function (e) {
        console.log(e);
    })
}, 1000);