'use strict';

var config = require("../../Config")("mt");
var util = require('util');

console.log(JSON.stringify(require("../../Consts/config")));

config.load(["config/1", "config/2"])
    .then(function () {
        console.log(util.inspect(config, {
            //        showHidden: true,
            depth: null
        }));
        console.log(config["config/1"].prop2);
        console.log(config.get("config/1", "prop3.prop32.1"));
        console.log(config.get_default("config/1", "prop3.prop32.1"));
        console.log(config.get_nodefault("config/1", "prop3.prop32"));
        console.log(config.get("config/1", "prop3.nonexistent"));
        console.log(config.get_default("config/1", "improper"));
        console.log(config.get_nodefault("config/1", "improper"));
        return config.reload();
    })
    .then(function () {
        console.log(util.inspect(config, {
            //        showHidden: true,
            depth: null
        }));
        return config.clean();
    });