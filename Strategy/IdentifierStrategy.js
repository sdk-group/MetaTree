'use strict';

var Strategy = require("./Strategy");
var util = require("util");
var uuid = require('node-uuid');

var IdentifierStrategy = function () {
    Strategy.call(this);
    this.name = "IdentifierStrategy";
}

util.inherits(IdentifierStrategy, Strategy);

IdentifierStrategy.prototype.do = function (which) {
    if (this.strategies[which]) {
        return this.strategies[which];
    } else {
        return this.strategies.default;
    }
}

IdentifierStrategy.prototype.strategies = {
    default: function () {
        var args = [].slice.call(arguments);
        return args.join("/").toLowerCase();
    },
    uuid: function () {
        return uuid.v1();
    },
    link: function (sel1, sel2) {
        return ["link", sel1, sel2].join("/");
    },
    schema: function (type) {
        return ["schema", type].join("/");
    }
}
var ids = new IdentifierStrategy();
module.exports = ids;