'use strict';

var Abstract = require("./Model/Abstract");
var Error = require('./Error/MetaTreeError')
var Promise = require("bluebird");
var identifier = require("./Strategy/IdentifierStrategy");

var Linker = function (bucket) {
    this._db = bucket;
    this.identifier = identifier.do("link");
}

//link by selectors, single doc per link
//if link exists, it will be updated, else it will be created
Linker.prototype.link = function (sel1, sel2, relation) {
    var dln = this._make_link(sel1, sel2, relation);
    var rln = this._make_link(sel2, sel1, relation);
    var self = this;
    return this.exists(dln.id)
        .then(function (res) {
            if (res) {
                return self._db.upsert(dln.id, dln.data);
            } else {
                return self.exists(rln.id)
                    .then(function (res) {
                        return self._db.upsert(rln.id, rln.data);
                    });
            }
        });
}

Linker.prototype.unlink = function (sel1, sel2) {
    var d_id = this.identifier(sel1, sel2);
    var r_id = this.identifier(sel2, sel1);
    return Promise.any([this._db.remove(d_id), this._db.remove(r_id)]);
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

Linker.prototype.exists = function (link) {
    return this._db
        .get(link)
        .then(function (res) {
            return Promise.resolve(res.value);
        })
        .catch(function (err) {
            return Promise.resolve(false);
        });
}

//options = {type : obj_type}
Linker.prototype.objectLinks = function (obj_sel, options) {
    var vq = db.ViewQuery.from("linker", "object_links");
    var startkey = obj_sel.split("/");
    var endkey = obj_sel.split("/");
    if (options && options.obj_type) {
        startkey.push(options.obj_type);
        endkey.push(options.obj_type + "z");
        console.log(startkey, endkey);
        vq.group_level(3).range(startkey, endkey, true);
    } else {
        endkey[1] += "z";
        vq.group_level(2).range(startkey, endkey, true);
    }
    return this._db.view(vq);
}

module.exports = Linker;