'use strict';

var MetaTree = require("../../MetaTree");
var OperatorClass = require("./Model/Operator")
var AbstractClass = require("../../Model/Abstract")
var util = require("util");
var _ = require("lodash");
var path = require("path");

var meta_tree = new MetaTree({
    server_ip: "192.168.1.3",
    n1ql: "192.168.1.3:8093",
    bucket_name: "mt"
});

var op1 = null;
var op2 = null;
var Operator = null;
meta_tree.initModel([path.resolve(__dirname, "Model"), path.resolve(__dirname, "../historified/Model")])
    .then(function () {
        Operator = meta_tree.Operator;
        op1 = meta_tree.create(Operator, {
            db_id: 1,
            id: 2,
            qaTerminalDesign: {
                something: "right"
            },
            enabled: true
        });
        op2 = Operator.spawn({
            db_id: 2
        });
        console.log("after creation op1", op1);
        console.log("after creation op2", op2);
        console.log("op == parent metaobject?", (Operator == op1) || (Operator == op2));
        return Promise.all([meta_tree.retrieve(op1), op2.retrieve()]);
    })
    .then(function (res) {
        Operator.enabled = null;
        console.log("after retrieve op1", op1);
        console.log("after retrieve op2", op2);
        return op1.toggle(true);
    })
    .then(function (res) {
        console.log("parent object", Operator);
        console.log("after enabling", op1);
        console.log("Op1 instanceof Operator: ", op1 instanceof Operator.constructor);
        console.log("Op1 instanceof Abstract: ", op1 instanceof meta_tree.Abstract.constructor);
        return op1.remove();
    })
    .then(function (res) {
        console.log("after remove", op1);
        return meta_tree.update(op1, 1, {
            hr_desc: "Phantom of the Operator",
            qaTerminalDesign: {
                something: "else"
            }
        });
    })
    .catch(function (err) {
        console.log("Error happened:", err.message);
        console.error(err.stack)
    });

/*


for (var i = 0; i < 10; i++) {
    meta_tree.link("operator/1", "service/" + (i + 1));
    meta_tree.link("operator/2", "service/" + (i + 5));
    meta_tree.link("service/1", "operator/" + (i + 7));
}
meta_tree.getObjectLinks("operator/2").then(function (res) {
    console.log(res);
});*/