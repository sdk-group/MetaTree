'use strict';

var MetaTree = require("../../MetaTree");
var _ = require("lodash");
var path = require("path");

var meta_tree = new MetaTree({
    bucket_name: "mt"
});

var hst1 = null;
var hst2 = null;
var MayBeReq = null;

meta_tree.initModel(path.resolve(__dirname, "Model"))
    .then(function () {
        MayBeReq = meta_tree.MayBeReq;
        hst1 = meta_tree.create(MayBeReq, {
            db_id: 5,
            id: 2,
            someprop: "hey"
        });
        hst2 = MayBeReq.spawn({
            db_id: 2,
            even: "blah"
        });

        console.log("after creation 1", hst1);
        console.log("after creation 2", hst2);
        console.log("parent", MayBeReq);
        console.log(" == parent metaobject?", (MayBeReq === hst1) || (MayBeReq === hst2));
        console.log(" instanceof MayBeReq: ", hst1 instanceof MayBeReq.constructor);
        console.log(" instanceof Historified: ", hst1 instanceof meta_tree.Historified.constructor);
        console.log(" instanceof Abstract: ", hst1 instanceof meta_tree.Abstract.constructor);
        hst1.set("even", "back");
        console.log("after set 1", hst1, hst1._history);
        hst2.set("someprop", [1, 2, 4]);
        console.log("after set 2", hst2, hst2._history);
        return Promise.all([meta_tree.save(hst2), hst1.save()]);
    })
    .then(function (res) {
        console.log("parent object", MayBeReq._history);
        console.log("after retr", hst1, hst2);
        hst1.set("even", "trololo");
        console.log("after set 1", hst1, hst1._history);
        hst1.set("even", "back");
        console.log("after set 1", hst1, hst1._history);
        hst1.set("someprop", [1, 2, 2]);
        console.log("after set 1", hst1, hst1._history);
        return; // hst1.remove();
    });