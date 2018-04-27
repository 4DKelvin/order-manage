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
                            User.update({wx_id: res.data.wx_id},
                                {bind: 0, wx_id: res.data.wx_id},
                                {strict: false, upsert: true}, function (e, c) {
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
        var self = this;
        return new Promise(function (resolve, reject) {
            var params = {
                wx_id: wx_id
            };
            names.forEach(function (name, index) {
                params['name_' + (index + 1)] = name;
            });
            request('http://172.105.232.134:12345/tc_wx_bind_all?' + qs(params), function (error, response, body) {
                var res = JSON.parse(body.toString());
                if (error)reject(error);
                else if (Number(res.status) != 0) reject(res.desc)
                else {
                    self._refresh(wx_id).then(function (user) {
                        resolve(user);
                    }, function (e) {
                        reject(e);
                    });
                }
            });
        });
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
                    }, {strict: false, upsert: true}, function (err, user) {
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
    _order: function (order, price) {
        return new Promise(function (resolve, reject) {
            if (order.get('upload') == 'failure') {
                request('http://172.105.232.134:12345/order_by_oid?' + qs({
                        uid: uid,
                        oid: order.get('id')
                    }), function (error, response, body) {
                    var res = JSON.parse(body.toString());
                    if (error)reject(error);
                    else if (Number(res.status) == 0) {
                        Order.update({id: order.get('id')}, {upload: 'success'}, {
                            strict: false,
                            upsert: true
                        }, function (e, o) {
                            if (e)reject(e);
                            else resolve(o);
                        });
                        resolve(res.desc);
                    } else {
                        reject(res.desc);
                    }
                })
            } else if (order.get('wx_id') && order.get('phone')) {
                var passenger = order.get('passenger'),
                    name = passenger instanceof Array ? passenger[0]['name'] : passenger['name'],
                    nid = passenger instanceof Array ? passenger[0]['cardnum'] : passenger['cardnum'];
                request('http://172.105.232.134:12345/upload_order?' + qs({
                        uid: uid,
                        wx_id: order.get('wx_id'),
                        phone: order.get('phone'),
                        dep: order.get('flight')['dep'],
                        arr: order.get('flight')['arr'],
                        flight_no: order.get('flight')['code'],
                        date: order.get('flight')['depday'],
                        cabin: order.get('flight')['cabin'],
                        name: name,
                        nid: nid,
                        oid: order.get('id'),
                        method_order: 2,
                        order_price: price
                    }), function (error, response, body) {
                    var res = JSON.parse(body.toString());
                    if (error)reject(error);
                    else if (Number(res.status) == 0) {
                        Order.update({id: order.id}, {upload: 'success'}, {
                            strict: false,
                            upsert: true
                        }, function (e, o) {
                            if (e)reject(e);
                            else resolve(o);
                        });
                    } else {
                        Order.update({id: order.id}, {upload: 'failure'}, {
                            strict: false,
                            upsert: true
                        }, function (e, o) {
                            if (e)reject(e);
                            else resolve(o);
                        });
                    }
                })
            }
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
    bindUser: function (order_id) {
        return new Promise(function (resolve, reject) {
            var self = this;
            Order.findOne({id: order_id}, function (err, order) {
                if (err)reject(err);
                else if (!order)reject(order);
                else if (order.get('wx_id')) {
                    self._refresh(order.get('wx_id')).then(function (user) {
                        resolve(user);
                    }, function (error) {
                        reject(error);
                    })
                } else {
                    var passenger = order.get('passenger'),
                        names = [];
                    if (passenger instanceof Array) {
                        passenger.forEach(function (p) {
                            names.push(p.name);
                        });
                    } else {
                        names.push(passenger.name);
                    }
                    self._getUnBindUser().then(function (res) {
                        self._bindAll(res.get('wx_id'), names).then(function (r) {
                            Order.update({id: order_id}, {
                                wx_id: res.get('wx_id'),
                                phone: res.get('phone')
                            }, {
                                strict: false,
                                upsert: true
                            }, function (e, o) {
                                if (e)reject(e);
                                else resolve(r);
                            });
                        }, function (e) {
                            reject(e)
                        })
                    }, function (err) {
                        reject(err)
                    })
                }
            });
        });
    },
    placeOrder: function (order_id, price) {
        return new Promise(function (resolve, reject) {
            var self = this;
            Order.findOne({id: order_id}, function (err, order) {
                if (err)reject(err);
                else {
                    self._order(order, price).then(function (result) {
                        resolve(result);
                    }, function (error) {
                        reject(error);
                    })
                }
            });
        });
    },
    orders: function (start, end, page) {
        return new Promise(function (resolve, reject) {
            Order.find({
                createtime: {$gte: start, $lte: end}
            }).skip(page * 10).limit(10).exec(function (err, orders) {
                if (err)reject(err);
                else resolve(orders);
            })
        });
    }
};

module.exports = api;