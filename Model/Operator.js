'use strict';

var Abstract = require("./Abstract");
var util = require("util");
var path = require("path");
var Promise = require("bluebird");
var _ = require("lodash");

//Operator metaobject
function Operator() {
    Abstract.call(this);
};

util.inherits(Operator, Abstract);

Operator.prototype.toggle = function (enabled) {
    this.enabled = enabled ? true : false;
    return this.save();
}

Operator.prototype.remove = function () {
    return this.toggle(false);
}

module.exports = Operator;