'use strict';

var MetaTree = require("../../MetaTree");
var util = require("util");
var _ = require("lodash");
var path = require("path");
var config = require("../../const/config")

var meta_tree = new MetaTree({
    server_ip: "127.0.0.1",
    n1ql: "127.0.0.1:8093",
    bucket_name: "mt"
});

var cfg1 = null;
var cfg2 = null;
var cfg3 = null;
var Config = null;
meta_tree
    .initModel()
    .delay(1500)
    .then(function () {
        console.log(meta_tree);
        Config = meta_tree.Config;
        cfg1 = meta_tree.create(Config, {
            db_id: 1,
            prop1: 2
        });
        cfg2 = Config.spawn({
            db_id: 2,
            "prop2..": 123
        });
        cfg3 = Config.spawn({
            db_id: 3,
            hello: 123
        });

        console.log("after creation 1", cfg1);
        console.log("after creation 2", cfg2);
        console.log(" == parent metaobject?", (Config == cfg1) || (Config == cfg2));
        return Promise.all([meta_tree.retrieve(cfg1), cfg2.retrieve(), cfg3.save(), cfg3.retrieve()]);
    })
    .then(function (res) {
        console.log("after retrieve 1", cfg1);
        console.log("after retrieve 2", cfg2);
        console.log("after retrieve 3", cfg3);
        return cfg1.update({
            prop2: "updated prop2 val2",
            improper: true
        });
    })
    .then(function (res) {
        console.log("parent object", Config);
        console.log("after updating 1", cfg1);
        return cfg3.retrieve(); //remove();
    })
    .catch(function (err) {
        console.log("Error happened:", err.message);
        console.error(err.stack)
    });