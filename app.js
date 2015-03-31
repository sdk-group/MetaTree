'use strict';

var MetaTree = require("./MetaTree");
var OperatorClass = require("./Model/Operator")
var AbstractClass = require("./Model/Abstract")
var util = require("util");
var _ = require("lodash");
var meta_tree = new MetaTree({
    bucket_name: "mt"
});
var op1 = null;
var op2 = null;
var Operator = null;
meta_tree.initModel()
    .then(function () {
        Operator = meta_tree.Operator;
        op1 = meta_tree.create(Operator, {
            db_id: 1,
            id: 2,
            qaTerminalDesign: {
                something: "right"
            }
        });
        return meta_tree.retrieve(op1);
    })
    .then(function (res) {
        //op2 = res;

        console.log(Operator);
        console.log("OBJ", op1);
        console.log(_.functions(op1));
        console.log(op1 instanceof Operator.constructor);
        console.log(op1 instanceof meta_tree.Abstract.constructor);
        return op1.remove();
    })
    .then(function (res) {
        console.log(op1);
        console.log(meta_tree.Operator);
        return meta_tree.update(op1, 1, {
            hr_desc: "Spirit of the Operator",
            qaTerminalDesign: {
                something: "more"
            }
        });
    })
    .then(function (res) {
        //      console.log(op1);
        //      console.log(meta_tree.Operator);
    });

/*
var Op1 = meta_tree.create('Operator', 1, {
    id: 1,
    hr_id: 1,
    hr_desc: "Spirit of the Operator",
    enabled: true,
    qaTerminalDesign: null,
    operatorDisplayDesign: null
});
Op1.save();
    .then(function (res) {
        console.log(res);
        return Op1.toggle(true);
    }).then(function (res) {
        console.log(res);
        return meta_tree.remove(Op1);
    }).then(function () {
        console.log('All done');
    });

meta_tree.retrieve('Operator', 1)
    .then(function (operator) {
        console.log(operator);
        return meta_tree.retrieve(Op1);
    })
    .then(function (operator) {
        console.log(operator);
    });


meta_tree.remove('Operator', 1)
    .then(function (operator) {
        console.log(operator, 'mark as removed');
    });

var Srv1 = meta_tree.create("Service", 15, {});
Srv1.save().then(function (res) {
    console.log(res)
});


for (var i = 0; i < 10; i++) {
    meta_tree.link("operator/1", "service/" + (i + 1));
    meta_tree.link("operator/2", "service/" + (i + 5));
    meta_tree.link("service/1", "operator/" + (i + 7));
}
meta_tree.getObjectLinks("operator/2").then(function (res) {
    console.log(res);
});*/