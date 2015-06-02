'use strict';

var Error = require("../Error/MetaTreeError");

var Strategy = function () {}

Strategy.prototype.do = function () {
    throw new Error("ABSTRACT_METHOD");
}

Strategy.prototype.strategies = {};

module.exports = Strategy;