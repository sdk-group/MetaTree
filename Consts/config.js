'use strict';
var path = require("path");

var config = {
    base_dir: path.resolve(),
    model_dir: path.resolve("Model"),
    strategies_dir: path.resolve("Strategy"),
    db: {
        server_ip: "127.0.0.1",
        n1ql: "127.0.0.1:8093",
        bucket_name: "mt",
        login: "Administrator",
        password: "123456"
    }
};

module.exports = config;