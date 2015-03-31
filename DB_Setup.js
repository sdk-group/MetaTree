//Just quickly set up test bucket
var cb = require("couchbase");
var config = require("./Consts/config");
var Error = require("./Error");

var cluster = null;

function setupBucket(ip, name, username, password, cb) {
    var manager = cluster.manager(username, password);
    manager.createBucket(name, {
        ramQuotaMB: 300
    }, function (err, res) {
        if (err) {
            throw new Error("DATABASE_ERROR", err);
        } else {
            console.log(res);
            cb(err, res);
        }
    });
}

function removeBucket(ip, name, username, password) {
    var manager = cluster.manager(username, password);
    manager.removeBucket(name, function (err, res) {
        if (err) {
            throw new Error("DATABASE_ERROR", err);
        } else {
            console.log(res);
        }
    });
}

function setupDesignDocs(ip, name, ddoc, data) {
    var bucket = cluster.openBucket(name,
        function (err, res) {
            if (err) {
                throw new Error("DATABASE_ERROR", err);
            }
        });
    var mgr = bucket.manager();
    mgr.upsertDesignDocument(ddoc, data, function (err, res) {
        if (err) {
            throw new Error("DATABASE_ERROR", err);
        } else {
            console.log(res);
        }
    });
}

function logDesignDocs(ip, name, ddoc) {
    var bucket = cluster.openBucket(name,
        function (err, res) {
            if (err) {
                throw new Error("DATABASE_ERROR", err);
            }
        });
    var mgr = bucket.manager();
    mgr.getDesignDocument(ddoc, function (err, res) {
        if (err) {
            throw new Error("DATABASE_ERROR", err);
        } else {
            console.log(JSON.stringify(res));
        }
    });
}

function setup() {
    var ip = config.db.server_ip;
    var bucket = config.db.bucket_name;
    var user = config.db.login;
    var pw = config.db.password;
    cluster = new cb.Cluster('couchbase://' + ip);
    console.log("Setting up bucket " + bucket + " on couchbase server " + ip + " with specified credentials " + user + ":" + pw);
    setupBucket(ip, bucket, user, pw, function (err, res) {
        setupDesignDocs(ip, bucket, "linker", {
            "views": {
                "object_links": {
                    "map": "function (doc, meta) {\n  var id = meta.id.split(/[:\\/]/);\n  id.shift();\n  emit(id, meta.id);\n  emit(id.slice(2,4).concat(id.slice(0,2)), meta.id);  \n}",
                    "reduce": "function(keys, vals, rereduce){\n  var out = [];\n  for(k in vals){\n  \tout.push(vals[k]);\n  }\n  return out;\n}"
                }
            },
            "spatial": {}
        });
    });
}

setup();

module.exports = setup;