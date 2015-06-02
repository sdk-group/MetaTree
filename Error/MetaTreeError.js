"use strict";
var errors = require("./errors");
var AbstractError = require("./AbstractError");

function MetaTreeError(info, message) {
    AbstractError.call(this, "CBirdError", info, message);
    Error.captureStackTrace(this, MetaTreeError);
}

MetaTreeError.prototype = Object.create(AbstractError.prototype);
MetaTreeError.prototype.constructor = MetaTreeError;

module.exports = MetaTreeError;