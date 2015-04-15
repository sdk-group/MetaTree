'use strict';

var Error = require('../Error')
var identifier = require("../Strategy/IdentifierStrategy");
var Promise = require("bluebird");
var path = require("path");
var _ = require("lodash");

//Parent metaobject
function Abstract() {
    var type = this.constructor.name.toLowerCase();
    this.db_id = -1;
    Object.defineProperties(this, {
        "_type": {
            value: type,
            writable: false,
            enumerable: true,
            configurable: false
        },
        "_bucket": {
            value: null,
            writable: true,
            enumerable: false,
            configurable: false
        },
        "_identifier": {
            value: identifier,
            writable: true,
            enumerable: false,
            configurable: false
        },
        "selector": {
            get: function () {
                return (this._identifier.do())(this._type, this.db_id);
            },
            set: function (value) {
                return false;
            },
            enumerable: false
        },
        "_db_fields": {
            value: [],
            writable: true,
            enumerable: false,
            configurable: false
        },
        "_meta_fields": {
            value: [],
            writable: true,
            enumerable: false,
            configurable: false
        }
    });
    this._meta_fields = _.keys(this);
};

Abstract.prototype.init = function (bucket) {
    this._bucket = bucket;
    return this._fromSchema();
}

//DO NOT use this directly
Abstract.prototype._fromSchema = function () {
    var id = (identifier.do('schema'))(this._type);
    var self = this;
    return this._bucket.get(id, {}).then(function (res) {
        //validate res
        var data = res.value;
        self._db_fields = _.keys(data);
        _.forEach(data, function (el, key) {
            self[key] = el;
        });
        return Promise.resolve(self);
    });
}

//spawn a clone. This is how new objects of certain type are created
Abstract.prototype.spawn = function (opts) {
    var obj = _.create(this, _.cloneDeep(this));
    return _.merge(obj, opts);
}

//update current DB object representation with current values of code representation
Abstract.prototype.save = function () {
    var data = _.pick(this, this._db_fields);
    return this._bucket.upsert(this.selector, data);
}

//updates DB representation of object. All unsaved changes in code representation will be lost.
Abstract.prototype.update = function (opts) {
    var self = this;
    return this._bucket.get(self.selector)
        .then(function (res) {
            _.merge(self, res.value, opts);
            return self.save();
        });
}

//load the DB representation to current object; note that this should not be called on metaobjects
Abstract.prototype.retrieve = function () {
    var self = this;
    return this._bucket.get(self.selector)
        .then(function (res) {
            _.merge(self, res.value);
            return Promise.resolve(self);
        });
}

Abstract.prototype.remove = function () {
    return this._bucket.remove(this.selector);
}

Abstract.prototype.setHandler = function (name, fn) {
    this[name] = fn;
}

module.exports = Abstract;