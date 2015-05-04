var config = require("../../Consts/config");
var _ = require("lodash");

var opts = {
    server_ip: config.db.server_ip,
    n1ql: config.db.n1ql
}

var db1 = require("../../Couchbird/DB_Face");
var db2 = require("../../Couchbird/DB_Face");

console.log(db1 === db2);

var cl = function () {
    this.es = {};
}
var t = _.cloneDeep(new cl());
var tt = _.cloneDeep(new cl());
t.es = {
    kkk: 55
};
var ttt = Object.seal(t);
var r = _.create(_.cloneDeep(ttt));
Object.defineProperties(r, {
    "_history": {
        value: {},
        writable: true,
        enumerable: false
    },
    "allow_no_setter": {
        value: false,
        writable: true,
        enumerable: false
    }
});
console.log(t);
console.log(tt);
console.log(cl);