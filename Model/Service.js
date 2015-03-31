'use strict';

var Abstract = require("./Abstract");
var util = require("util");
var path = require("path");
var Promise = require("bluebird");

function Service() {
    Abstract.call(this);
}

util.inherits(Service, Abstract);

module.exports = Service;