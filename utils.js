const request = require('request');
const qs = require('querystring').stringify;
const Order = require('./db').Order;
const User = require('./db').User;
const Space = require('./db').Space;
const parseString = require('xml2js').parseString;
const uid = 'mrr3kX2ToSgyvbP';
const splitTime = 10 * 60 * 1000;
var api = {
    _getUnBindUser: function() {
        return new Promise(function(resolve, reject) {
            User.findOne({
                bind: 0,
                phone: {
                    $exists: false
                }
            }, function(err, res) {
                if (err) reject(err);
                else if (res) {
                    resolve(res);
                } else {
                    request('http://172.105.232.134:12345/new_get_wx?uid=' + uid, function(error, response, body) {
                        var res = JSON.parse(body.toString());
                        if (error || res.data.wx_id) reject(error);
                        else if (res.data.wx_id) {
                            User.update({
                                wx_id: res.data.wx_id
                            }, {
                                bind: 0,
                                wx_id: res.data.wx_id
                            }, {
                                strict: false,
                                upsert: true
                            }, function(e, raw) {
                                if (e) reject(e);
                                else {
                                    User.findOne({
                                        wx_id: res.data.wx_id
                                    }, function(err, user) {
                                        if (err) reject(err);
                                        else resolve(user);
                                    })
                                }
                            });
                        } else {
                            reject(res.desc);
                        }
                    })
                }
            })
        });
    },
    _state: function(dep, arr, date) {
        return new Promise(function(resolve, reject) {
            request.post({
                url: 'http://172.105.232.134:12345/avh?' + qs({
                    uid: uid,
                    dep: dep,
                    arr: arr,
                    date: date
                })
            }, function(error, response, body) {
                var res = JSON.parse(body.toString());
                if (error) reject(error);
                else resolve(res.data);
            });
        });
    },
    _bindAll: function(wx_id, names) {
        return new Promise(function(resolve, reject) {
            var params = {
                uid: uid,
                wx_id: wx_id,
                name_1: '',
                name_2: '',
                name_3: '',
                name_4: ''
            };
            names.forEach(function(name, index) {
                params['name_' + (index + 1)] = name;
            });
            for (var i = names.length; i <= 4; i++) {
                params['name_' + i] = params['name_1'];
            }
            request('http://172.105.232.134:12345/tc_wx_bind_all?' + qs(params), function(error, response, body) {
                var res = JSON.parse(body.toString());
                if (error) reject(error);
                else if (Number(res.status) != 0) reject(res.desc)
                else {
                    api._refresh(wx_id).then(function(user) {
                        resolve(user);
                    }, function(e) {
                        reject(e);
                    });
                }
            });
        });
    },
    _detail: function(wx_id) {
        return new Promise(function(resolve, reject) {
            User.findOne({
                wx_id: wx_id
            }, function(err, user) {
                if (err) reject(err);
                else {
                    Order.findOne({
                        wx_id: wx_id
                    }, function(e, order) {
                        if (e) reject(e);
                        else {
                            resolve({
                                user: JSON.parse(JSON.stringify(user)),
                                order: JSON.parse(JSON.stringify(order))
                            })
                        }
                    });
                }
            })
        });
    },
    _refresh: function(wx_id) {
        return new Promise(function(resolve, reject) {
            request('http://172.105.232.134:12345/get_bind_status?' + qs({
                uid: uid,
                wx_id: wx_id
            }), function(error, response, body) {
                var res = JSON.parse(body.toString());
                if (error) reject(error);
                else {
                    User.update({
                        wx_id: wx_id
                    }, {
                        phone: res.data.phone,
                        pwd: res.data.pwd,
                        coupon: res.data.coupon,
                        used_coupon: res.data.used_coupon,
                        valid: Number(res.data.valid),
                        bind_cnt: Number(res.data.bind_cnt),
                        bind: Number(res.data.valid) == 88 ? 1 : 0
                    }, {
                        strict: false,
                        upsert: true
                    }, function(err, raw) {
                        if (err) reject(err);
                        else if (Number(res.data.bind_cnt) != 4 && Number(res.data.valid) == 88) {
                            api._auth(wx_id).then(function() {
                                api._detail(wx_id).then(function(r) {
                                    resolve(r);
                                }, function(e) {
                                    reject(e);
                                });
                            }, function() {
                                api._detail(wx_id).then(function(r) {
                                    resolve(r);
                                }, function(e) {
                                    reject(e);
                                })
                            })
                        } else {
                            api._detail(wx_id).then(function(r) {
                                resolve(r);
                            }, function(e) {
                                reject(e);
                            })
                        }
                    })
                }
            })
        });
    },
    _auth: function(wx_id) {
        return new Promise(function(resolve, reject) {
            request('http://172.105.232.134:12345/auth_jiugongge?' + qs({
                uid: uid,
                wx_id: wx_id
            }), function(error, response, body) {
                var res = JSON.parse(body.toString());
                if (error) reject(error);
                else if (Number(res.status) == 0) {
                    resolve(res.data.wx_id);
                } else {
                    reject(res.desc);
                }
            })
        });
    },
    _order: function(order, price) {
        return new Promise(function(resolve, reject) {
            if (order.get('upload') == 'failure') {
                request('http://172.105.232.134:12345/order_by_oid?' + qs({
                    uid: uid,
                    oid: order.get('id')
                }), function(error, response, body) {
                    var res = JSON.parse(body.toString());
                    if (error) reject(error);
                    else if (Number(res.status) == 0) {
                        Order.update({
                            id: Number(order.get('id'))
                        }, {
                            upload: 'success'
                        }, {
                            strict: false,
                            upsert: true
                        }, function(e, raw) {
                            if (e) reject(e);
                            else resolve(order);
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
                }), function(error, response, body) {
                    var res = JSON.parse(body.toString());
                    if (error) reject(error);
                    else if (Number(res.status) == 0) {
                        Order.update({
                            id: Number(order.get('id'))
                        }, {
                            upload: 'success'
                        }, {
                            strict: false,
                            upsert: true
                        }, function(e, raw) {
                            if (e) reject(e);
                            else resolve(order);
                        });
                    } else {
                        Order.update({
                            id: Number(order.get('id'))
                        }, {
                            upload: 'failure'
                        }, {
                            strict: false,
                            upsert: true
                        }, function(e, raw) {
                            if (e) reject(e);
                            else resolve(order);
                        });
                    }
                })
            }
        });
    },
    refreshAll: function() {
        return new Promise(function(resolve, reject) {
            User.find({
                bind: 0,
                phone: {
                    $exists: true
                }
            }, function(err, users) {
                if (err) reject(err);
                else if (!users.length) resolve('ok');
                else {
                    Promise.all(users.map(function(user) {
                        return api._refresh(user.get('wx_id'));
                    })).then(function() {
                        resolve('ok')
                    }, function(e) {
                        reject(e)
                    })
                }
            })
        });
    },
    bindUser: function(order_id) {
        return new Promise(function(resolve, reject) {
            Order.findOne({
                id: Number(order_id)
            }, function(err, order) {
                if (err) reject(err);
                else if (!order) reject(order);
                else if (order.get('wx_id') && order.get('phone')) {
                    api._refresh(order.get('wx_id')).then(function(r) {
                        resolve(r);
                    }, function(e) {
                        reject(e);
                    })
                } else {
                    var passenger = order.get('passenger'),
                        names = [];
                    if (passenger instanceof Array) {
                        passenger.forEach(function(p) {
                            names.push(p.name);
                        });
                    } else {
                        names.push(passenger.name);
                    }
                    api._getUnBindUser().then(function(res) {
                        api._bindAll(res.get('wx_id'), names).then(function(r) {
                            Order.update({
                                id: Number(order_id)
                            }, {
                                wx_id: r.user.wx_id,
                                phone: r.user.phone
                            }, {
                                strict: false,
                                upsert: true
                            }, function(e, raw) {
                                if (e) reject(e);
                                else resolve(r);
                            });
                        }, function(e) {
                            reject(e)
                        })
                    }, function(err) {
                        reject(err)
                    })
                }
            });
        });
    },
    placeOrder: function(order_id, price) {
        return new Promise(function(resolve, reject) {
            Order.findOne({
                id: Number(order_id)
            }, function(err, order) {
                if (err) reject(err);
                else {
                    api._order(order, price).then(function(result) {
                        resolve(result);
                    }, function(error) {
                        reject(error);
                    })
                }
            });
        });
    },
    remove_space: function(id) {
        return new Promise(function(resolve, reject) {
            Space.remove({
                id: id
            }, function(err, res) {
                if (err) reject(err);
                else resolve(res);
            });
        });
    },
    create_space: function(params) {
        var space = params;
        space.updated_at = new Date().getTime() - splitTime;
        space.space_count = -1;
        console.log(space);
        return new Promise(function(resolve, reject) {
            new Space(space).save(function(err, res) {
                if (err) reject(err);
                else resolve(res);
            });
        });
    },
    query_space: function(page, keyword) {
        return new Promise(function(resolve, reject) {
            Space.find({
                $or: [{
                        id: {
                            $regex: keyword
                        }
                    },
                    {
                        arr: {
                            $regex: keyword
                        }
                    },
                    {
                        dep: {
                            $regex: keyword
                        }
                    },
                    {
                        flight_no: {
                            $regex: keyword
                        }
                    }
                ]
            }).order('space_count desc').skip(page * 10).limit(10).exec(function(err, spaces) {
                if (err) reject(err);
                else resolve(spaces);
            })
        });
    },
    update_count: function(id, count) {
        return new Promise(function(resolve, reject) {
            Space.update({
                id: id
            }, {
                space_count: count
            }, {
                strict: false,
                upsert: true
            }, function(err, data) {
                if (err) reject(err);
                else resolve(data);
            });
        });
    },
    get_sync_space: function() {
        Space.findOne({
            updated_at: {
                $gte: new Date().getTime() - splitTime
            }
        }, function(err, res) {
            res
        })
    },
    spaces_remote: function(dep, arr, date) {
        return new Promise(function(resolve, reject) {
            api._state(dep, arr, date).then(function(r) {
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
                                        var vals = val.split(' ');
                                        res_data.push({
                                            flight_no: values[3] + values[4],
                                            date: values[0],
                                            dep_time: values[1],
                                            arr_time: values[2],
                                            dep_city: values[5],
                                            arr_city: values[6],
                                            space_name: vals[0],
                                            space_count: vals[1]
                                        });
                                    }
                                });
                            }
                            resolve(res_data.sort(function(a, b) {
                                return a.spaces.count - b.spaces.count;
                            }));
                        });
                    });
                },
                function(e) {
                    reject(e);
                });
        });
    },
    orders: function(start, end, page, keyword) {
        return new Promise(function(resolve, reject) {
            Order.find({
                $or: [{
                        contact: {
                            $regex: keyword
                        }
                    },
                    {
                        orderno: {
                            $regex: keyword
                        }
                    },
                    {
                        id: {
                            $regex: keyword
                        }
                    },
                    {
                        contactmob: {
                            $regex: keyword
                        }
                    },
                    {
                        "passenger.name": {
                            $regex: keyword
                        }
                    },
                    {
                        "passenger.cardnum": {
                            $regex: keyword
                        }
                    }
                ],
                createtime: {
                    $gte: start,
                    $lte: end
                }
            }).skip(page * 10).limit(10).exec(function(err, orders) {
                if (err) reject(err);
                else resolve(orders);
            })
        });
    }
};

module.exports = api;