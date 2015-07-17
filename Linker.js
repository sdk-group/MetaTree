'use strict';

var Error = require('./Error/MetaTreeError')
var Promise = require("bluebird");
var identifier = require("./Strategy/IdentifierStrategy");
var _ = require("lodash");
var Couchbird = require("Couchbird");
var DB_Face = null;

var Linker = function (properties) {
    var opts = {
        server_ip: "127.0.0.1",
        n1ql: "127.0.0.1:8093",
        bucket_name: "default"
    };
    _.assign(opts, properties);

    DB_Face = Couchbird({
        server_ip: opts.server_ip,
        n1ql: opts.n1ql
    });

    this._bucket_name = opts.bucket_name;
    this._db = DB_Face.bucket(this._bucket_name);
    this.identifier = identifier.do("link");
}

//link by selectors, single doc per link
//if link exists, it will be updated, else it will be created
Linker.prototype.link = function (sel1, sel2, relation) {
    var dln = this._make_link(sel1, sel2, relation);
    //    console.log("MAKE_LINK", dln);
    var self = this;
    return self._db.upsert(dln.id, dln.data)
        .then(function (res) {
            return true;
        })
        .catch(function (err) {
            return false;
        });
}

Linker.prototype.link_mutual = function (sel1, sel2, relation) {
    return Promise.all([this.link(sel1, sel2, relation), this.link(sel2, sel1, relation)]);
}

Linker.prototype.unlink = function (sel1, sel2) {
    var d_id = this.identifier(sel1, sel2);
    return this._db.remove(d_id)
        .then(function (res) {
            return true;
        })
        .catch(function (err) {
            return false;
        });
}

Linker.prototype.unlink_mutual = function (sel1, sel2) {
    return Promise.all([this.unlink(sel1, sel2), this.unlink(sel2, sel1)]);
}

//returns json to put into db
Linker.prototype._make_link = function (sel1, sel2, rel_data) {
    return {
        id: this.identifier(sel1, sel2),
        data: {
            bound: [sel1, sel2],
            relation: rel_data
        }
    };
}

Linker.prototype.get_link = function (sel1, sel2) {
    var d_id = this.identifier(sel1, sel2);
    return this._db
        .get(d_id)
        .then(function (res) {
            return Promise.resolve(res);
        })
        .catch(function (err) {
            return Promise.resolve(false);
        });
}

Linker.prototype.get_links = function (sel1, options) {
    var ids = [];
    var opts = {
        type: options.type || false,
        start: options.start || 0,
        end: options.end || 700
    };
    if (!opts.type) {
        return false;
    }
    for (var i = opts.start; i <= opts.end; i++) {
        ids.push(this.identifier(sel1, identifier.do()(opts.type, i)));
    }
    //    ids = _.map(_.range(opts.start, opts.end), function (el) {
    //        return this.identifier(sel1, identifier.do()(opts.type, el));
    //    })
    return this._db
        .getMulti(ids)
        .then(function (res) {
            return Promise.resolve(res);
        })
        .catch(function (err) {
            return Promise.resolve(false);
        });
}

//options = {type : obj_type}
Linker.prototype.object_links = function (obj_sel, options) {
    var vq = DB_Face.ViewQuery.from("linker", "object_links");
    var startkey = obj_sel.split("/");
    var endkey = obj_sel.split("/");
    if (options && options.type) {
        startkey.push(options.type);
        endkey.push(options.type + "z");
        console.log(startkey, endkey);
        vq.group_level(3).range(startkey, endkey, true);
    } else {
        endkey[1] += "z";
        vq.group_level(2).range(startkey, endkey, true);
    }
    return this._db.view(vq);
}

module.exports = Linker;