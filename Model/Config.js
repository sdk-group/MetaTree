'use strict';

var Abstract = require("./Abstract");
var _ = require("lodash");

function Config() {
    Abstract.call(this);
}

require("util").inherits(Config, Abstract);

//no need to get this from db
Config.prototype.init = function (bucket) {
    this._bucket = bucket;
    return Promise.resolve(this);
}

Config.prototype.retrieve = function () {
    console.log("This object cannot be retrieved directly.");
    return Promise.resolve(this);
}

Config.prototype.save = function () {
    var data = _.omit(this, this._meta_fields);
    return this._bucket.upsert(this.selector, data);
}

Config.prototype.update = function (opts) {
    var self = this;
    return this._bucket.get(self.selector)
        .then(function (res) {
            var data = res.value;
            _.merge(data, opts);
            return self._bucket.upsert(self.selector, data);
        });
}

module.exports = Config;