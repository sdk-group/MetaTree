'use strict';

var Historified = require("../../../Model/Historified");
var path = require("path");
var Promise = require("bluebird");
var _ = require("lodash");


function MayBeReq() {
    Historified.call(this);
}

require("util").inherits(MayBeReq, Historified);

MayBeReq.prototype.setEven = function (val) {
    this.even = val;
}

MayBeReq.prototype.setSomeprop = function (val) {
    this.someprop = val;
}

module.exports = MayBeReq;