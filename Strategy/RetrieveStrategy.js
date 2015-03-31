'use strict';

var Strategy = require("./Strategy");
var util = require("util");
var uuid = require('node-uuid');
var Operator = require("../Model/Operator");
var Service = require("../Model/Service");

var RetrieveStrategy = function () {
    Strategy.call(this);
    this.name = "RetrieveStrategy";
}

util.inherits(RetrieveStrategy, Strategy);

RetrieveStrategy.prototype.do = function (which) {
    if (this.strategies[which]) {
        return this.strategies[which];
    } else {
        return this.strategies.default;
    }
}

RetrieveStrategy.prototype.strategies = {
    default: function (arg) {
        console.log('default retrieve strategy for ' + arg)
    },
    operator: function (selector, bucket_name, opts) {
        return new Operator(selector, bucket_name, opts);
    },
    service: function (selector, bucket_name, opts) {
        return new Service(selector, bucket_name, opts);
    }
}

var rs = new RetrieveStrategy();

module.exports = rs;