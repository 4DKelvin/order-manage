const request = require('request');
const qs = require('querystring').stringify;
const Order = require('./db').Order;
const User = require('./db').User;
const uid = 'mrr3kX2ToSgyvbP';
var api = {
    _getUnBindUser: function () {
        return new Promise(function (resolve, reject) {
            User.findOne({bind: 0, phone: {$exists: false}}, function (err, res) {
                if (err)reject(err);
                else if (res) {
                    resolve(res);
                }
                else {
                    request('http://172.105.232.134:12345/new_get_wx?uid=' + uid, function (error, response, body) {
                        var res = JSON.parse(body.toString());
                        if (error || res.data.wx_id)reject(error);
                        else {
                            new User({bind: 0, wx_id: res.data.wx_id}).save(function (e, c) {
                                if (e)reject(e);
                                else resolve(c);
                            });
                        }
                    })
                }
            })
        });
    },
    _bindAll: function (wx_id, names) {
    },
    _refresh: function (wx_id) {
        return new Promise(function (resolve, reject) {
            var self = this;
            request('http://172.105.232.134:12345/get_bind_status?' + qs({
                    uid: uid,
                    wx_id: wx_id
                }), function (error, response, body) {
                var res = JSON.parse(body.toString());
                if (error)reject(error);
                else {
                    User.update({
                        wx_id: wx_id
                    }, {
                        phone: res.data.phone,
                        pwd: res.data.pwd,
                        valid: Number(res.data.valid),
                        bind_cnt: Number(res.data.bind_cnt),
                        bind: Number(res.data.valid) == 88 ? 1 : 0
                    }, function (err, user) {
                        if (err)reject(err);
                        else if (user.get('bind_cnt') != 4 && user.get('bind') == 1) {
                            self._auth(user.get('wx_id')).then(function (r) {
                                resolve(user);
                            }, function () {
                                resolve(user);
                            })
                        } else {
                            resolve(user);
                        }
                    })
                }
            })
        });
    },
    _auth: function (wx_id) {
        return new Promise(function (resolve, reject) {
            request('http://172.105.232.134:12345/auth_jiugongge?' + qs({
                    uid: uid,
                    wx_id: wx_id
                }), function (error, response, body) {
                var res = JSON.parse(body.toString());
                if (error)reject(error);
                else if (Number(res.status) == 0) {
                    resolve(res.data.wx_id);
                } else {
                    reject(res.desc);
                }
            })
        });
    },
    refreshAll: function () {
        return new Promise(function (resolve, reject) {
            var self = this;
            User.find({bind: 0, phone: {$exists: true}}, function (err, users) {
                if (err)reject(err);
                else if (!users.length) resolve('ok');
                else {
                    Promise.all(users.map(function (user) {
                        return self._refresh(user.get('wx_id'));
                    })).then(function () {
                        resolve('ok')
                    }, function (e) {
                        reject(e)
                    })
                }
            })
        });
    },
    bindUser: function (names) {
        return new Promise(function (resolve, reject) {
            var self = this;
            self._getUnBindUser().then(function (res) {
                self._bindAll(res.get('wx_id'), names).then(function (r) {
                    resolve(r)
                }, function (e) {
                    reject(e)
                })
            }, function (err) {
                reject(err)
            })
        });
    }
};

module.exports = api;