'use strict';

var Abstract = require("./Abstract");
var _ = require("lodash");
var Promise = require("bluebird");


function Historified() {
    this._history = {};
    this.allow_no_setter = false;
    Abstract.call(this);
}

require("util").inherits(Historified, Abstract);

Historified.prototype.spawn = function (opts) {
    var obj = Historified.super_.prototype.spawn.call(this, opts);
    Object.defineProperties(obj, {
        "_history": {
            value: {},
            writable: true,
            enumerable: false
        },
        "allow_no_setter": {
            value: false,
            writable: true,
            enumerable: false
        }
    });
    return obj;
}

Historified.prototype._log = function (key, val) {
    if (!this._history[key])
        this._history[key] = {};
    this._history[key] = {
        old: this[key],
        new: val
    };
}

Historified.prototype._writedown = function () {
    if (_.isEmpty(this._history))
        return Promise.resolve(false);

    var id = (this._identifier.do("history"))(this.role, this.selector);
    var data = _.transform(this._history, function (acc, val, n) {
        acc[n] = val.new;
    });
    var self = this;
    return this._bucket.insert(id, data)
        .then(function () {
            self._cleanupHistory();
            return Promise.resolve(true);
        });
}

Historified.prototype._cleanupHistory = function () {
    this._history = {};
}

Historified.prototype.get = function (key) {
    if (!_.isString(key)) return false;
    var getter = _.camelCase("get_" + key);
    return _.result(this, getter, this[key]);
}

Historified.prototype.set = function (key, val, persist) {
    //   console.log("SET", key, !_.isString(key) || !val);
    if (!_.isString(key) || !val) return false;

    var setter = _.camelCase("set_" + key);
    var res = _.get(this, setter, false);
    // console.log(setter);
    if (this.isInSchema(key)) this._log(key, val);
    if (res && _.isFunction(res)) res.call(this, val);
    if (!res && this.allow_no_setter) this[key] = val;

    if (persist) return this._writedown();
}

Historified.prototype.save = function () {
    var self = this;
    return Historified.super_.prototype.save.call(this)
        .then(function (res) {
            return self._writedown();
        });
}

module.exports = Historified;