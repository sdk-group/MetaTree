'use strict'

var Linker = require("../../Linker");
var MetaTree = require("../../MetaTree");

var opts = {
    bucket_name: "mt"
};

var mt = new MetaTree(opts);
var linker = new Linker(opts);

console.log(mt._db === linker._db);

//for (var i = 0; i < 500; i++) {
//    linker.link("operator/1", "service/" + i, {
//        active: true
//    })
//}
//for (var i = 0; i < 500; i++) {
//    linker.unlink("operator/1", "service/" + i, {
//        active: true
//    })
//}
var tm = 0;

linker.link("operator/1", "service/1", {
        active: true
    })
    .then(function (res) {
        console.log("LINK TEST", res);
        return linker.unlink("operator/1", "service/1");
    })
    .then(function (res) {
        console.log("UNLINK 1", res);
        return linker.unlink("service/1", "operator/1")
    })
    .then(function (res) {
        console.log("UNLINK 1", res);
        return linker.link("operator/1", "service/1", {
            active: true
        });
    })
    .then(function (res) {
        console.log("LINK 1", res);
        return linker.unlink_mutual("operator/1", "service/1");
    })
    .then(function (res) {
        console.log("UNLINK 2", res);
        return linker.link_mutual("operator/1", "service/1", {
            active: true
        });
    })
    .then(function (res) {
        console.log("LINK 2", res);
        return linker.unlink_mutual("operator/1", "service/1");
    })
    .then(function (res) {
        console.log("UNLINK 2", res);
        return linker.link("operator/1", "service/1", {
            active: true
        });
    })
    .then(function (res) {
        console.log("LINK 1", res);
        return linker.link("operator/1", "service/2", {
            active: true
        });
    })
    .then(function (res) {
        console.log("LINK 1", res);
        return linker.get_link("operator/1", "service/1");
    })
    .then(function (res) {
        console.log("GETLINK", res);
        tm = Date.now();
        return linker.get_links("operator/1", {
            type: "service",
            start: 1,
            end: 499
        });
    })
    .then(function (res) {
        console.log("GETLINK", res, Date.now() - tm);
        tm = Date.now();
        return linker.object_links("operator/1", {
            type: "service"
        });
    })
    .then(function (res) {
        console.log("GETLINK", res[0].value, Date.now() - tm);
        //        return linker.object_links("operator/1", {
        //            type: "service"
        //        });    
    })