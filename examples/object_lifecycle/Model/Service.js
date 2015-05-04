'use strict';

var Abstract = require("../../../Model/Abstract");
var path = require("path");
var Promise = require("bluebird");
var _ = require("lodash");


function Service() {
    Abstract.call(this);
}

require("util").inherits(Service, Abstract);

module.exports = Service;