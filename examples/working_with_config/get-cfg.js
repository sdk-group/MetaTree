'use strict';

var config = require("../../Config")("mt");
var util = require('util');

//console.log(JSON.stringify(require("../../Consts/config")));

config.load({
        cfg1: "config/1",
        cfg2: "config/2"
    })
    .then(function () {
        console.log(util.inspect(config, {
            //        showHidden: true,
            depth: null
        }));
        console.log(config.cfg1.prop2);
        console.log(config.get("cfg1", "prop3.prop32.1"));
        console.log(config.get_default("cfg1", "prop3.prop32.1"));
        console.log(config.get_nodefault("cfg1", "prop3.prop32"));
        console.log(config.get("cfg1", "prop3.nonexistent"));
        console.log(config.get_default("cfg1", "improper"));
        console.log(config.get_nodefault("cfg1", "improper"));
        return config.reload();
    })
    .then(function () {
        console.log(util.inspect(config, {
            //        showHidden: true,
            depth: null
        }));
        return config.clean();
    })
    .then(function () {
        console.log(util.inspect(config, {
            //        showHidden: true,
            depth: null
        }));
    });