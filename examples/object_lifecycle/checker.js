var config = require("../../const/config");
var _ = require("lodash");

var opts = {
    server_ip: config.db.server_ip,
    n1ql: config.db.n1ql
}

var db1 = require("Couchbird")({
    server_ip: config.db.server_ip,
    n1ql: config.db.n1ql
});
var db2 = require("Couchbird")({
    server_ip: config.db.server_ip,
    n1ql: config.db.n1ql
});

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