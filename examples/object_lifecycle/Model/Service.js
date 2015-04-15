'use strict';

var Abstract = require("../../../Model/Abstract");
var util = require("util");
var path = require("path");
var Promise = require("bluebird");
var _ = require("lodash");


function Service() {
    Abstract.call(this);
}

util.inherits(Service, Abstract);

module.exports = Service;