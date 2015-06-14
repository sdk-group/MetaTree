'use strict';

var Strategy = require("./Strategy");
var uuid = require('node-uuid');
var _ = require("lodash");

var IdentifierStrategy = function () {
    Strategy.call(this);
    this.name = "IdentifierStrategy";
}

require("util").inherits(IdentifierStrategy, Strategy);

IdentifierStrategy.prototype.do = function (which) {
    if (this.strategies[which]) {
        return this.strategies[which];
    } else {
        return this.strategies.default;
    }
}

IdentifierStrategy.prototype.strategies = {
    default: function () {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
        }
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
    },
    history: function (role, selector) {
        var ts = ~~(_.now() / 1000);
        return ["history", role, selector, ts].join("/");
    }
}
var ids = new IdentifierStrategy();
module.exports = ids;