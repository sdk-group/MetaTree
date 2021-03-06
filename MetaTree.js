'use strict';

var Abstract = require("./Model/Abstract");
var Error = require('./Error/MetaTreeError');
var Linker = require('./Linker');
var Couchbird = require('Couchbird');
var identifier = require("./Strategy/IdentifierStrategy");
var path = require("path");
var Promise = require("bluebird");
var _ = require("lodash");
var fs = Promise.promisifyAll(require("fs"));

var DB_Face = null;

function MetaTree(properties) {
    var opts = {
        server_ip: "127.0.0.1",
        n1ql: "127.0.0.1:8093",
        bucket_name: "default",
        role: "default"
    };
    _.assign(opts, properties);

    DB_Face = Couchbird({
        server_ip: opts.server_ip,
        n1ql: opts.n1ql
    });


    this._role = opts.role;
    this._bucket_name = opts.bucket_name;
    this._db = DB_Face.bucket(this._bucket_name);
    this._linker = new Linker(properties);
    this._uuid_id = identifier.do("uuid");
    this._default_id = identifier.do();
    this._model_dir = path.resolve(__dirname, "Model");
    this.initModel(this._model_dir);
}

MetaTree.prototype.initModel = function (model_dir) {
    var files = [];
    var promises = [];
    var self = this;
    var dirs = _.isArray(model_dir) ? model_dir : [model_dir];
    var dir_promises = _.map(dirs, function (dir) {
        return fs.statAsync(dir)
            .then(function (res) {
                return res.isDirectory() ? fs.readdirAsync(dir) : Promise.reject(false);
            })
            .then(function (res) {
                var paths = _.map(res, function (x) {
                    return path.resolve(dir, x)
                });
                return Promise.resolve(paths);
            })
            .catch(function (err) {
                return Promise.resolve([]);
            });
    });
    return Promise.all(dir_promises)
        .then(function (res) {
            var files = _.flattenDeep(res);
            _.forEach(files, function (mo) {
                //                console.log("loading", mo);
                var mo_module = require(mo);
                var meta_object = new mo_module;
                var promise = meta_object
                    .init(self._db)
                    .then(function (res) {
                        meta_object.role = self._role;
                        self[res.constructor.name] = Object.seal(res);
                    });
                promises.push(promise);
            });
            return Promise.all(promises);
        });
}
MetaTree.prototype.create = function (obj, opts) {
    if (!(obj instanceof Abstract))
        throw new Error("INVALID_ARGUMENT", "First argument must be inherited from Abstract.");
    return obj.spawn(opts);
}

MetaTree.prototype.save = function (obj) {
    if (!(obj instanceof Abstract))
        throw new Error("INVALID_ARGUMENT", "First argument must be inherited from Abstract.");
    return obj.save();
}

//retrieve the DB representation either with metaobject and id specified (e.g. MT.retrieve(MT.Operator, 12)) or with specifying object code representation (operator1)
MetaTree.prototype.retrieve = function (obj, id) {
    if (!(obj instanceof Abstract))
        throw new Error("INVALID_ARGUMENT", "First argument must be inherited from Abstract.");
    var native = (this[obj.constructor.name] === obj);
    if (native && !(id && _.isNumber(id) && id >= 0))
        throw new Error("INVALID_ARGUMENT", "Either specify metaobject and id, or spawned object to retrieve its DB representation.");
    var object = native ? obj.spawn({
        db_id: id
    }) : obj;
    return object.retrieve();
}

MetaTree.prototype.update = function (obj, id, opts) {
    if (!(obj instanceof Abstract))
        throw new Error("INVALID_ARGUMENT", "First argument must be inherited from Abstract.");
    var native = (this[obj.constructor.name] === obj);
    if (native && (!(opts && _.isObject(opts)) || !(id && _.isNumber(id) && id >= 0)))
        throw new Error("INVALID_ARGUMENT", "Either specify metaobject and id, or spawned object to update its DB representation.");
    var object = native ? obj.spawn({
        db_id: id
    }) : obj;
    var options = (opts && _.isObject(opts)) ? opts : ((id && _.isObject(id)) ? id : {});
    return object.update(options);
}

MetaTree.prototype.remove = function (obj, id) {
    if (!(obj instanceof Abstract))
        throw new Error("INVALID_ARGUMENT", "First argument must be inherited from Abstract.");
    return obj.remove();
}

MetaTree.prototype.link = function (obj1, obj2, relation) {
    if (!(obj1 instanceof Abstract) && !(obj2 instanceof Abstract) && !(_.isString(obj1)) && !(_.isString(obj2)))
        throw new Error("INVALID_ARGUMENT", "Arguments should be either objects or strings.");
    var obj1_sel = (obj1 instanceof Abstract) ? obj1.selector : obj1;
    var obj2_sel = (obj2 instanceof Abstract) ? obj2.selector : obj2;
    return this._linker.link(obj1_sel, obj2_sel, relation);
}

MetaTree.prototype.link_mutual = function (obj1, obj2, relation) {
    if (!(obj1 instanceof Abstract) && !(obj2 instanceof Abstract) && !(_.isString(obj1)) && !(_.isString(obj2)))
        throw new Error("INVALID_ARGUMENT", "Arguments should be either objects or strings.");
    var obj1_sel = (obj1 instanceof Abstract) ? obj1.selector : obj1;
    var obj2_sel = (obj2 instanceof Abstract) ? obj2.selector : obj2;
    return this._linker.link_mutual(obj1_sel, obj2_sel, relation);
}

MetaTree.prototype.unlink = function (obj1, obj2) {
    var obj1_sel = (obj1 instanceof Abstract) ? obj1.selector : obj1;
    var obj2_sel = (obj2 instanceof Abstract) ? obj2.selector : obj2;
    return this._linker.unlink(obj1_sel, obj2_sel);
}

MetaTree.prototype.unlink_mutual = function (obj1, obj2) {
    var obj1_sel = (obj1 instanceof Abstract) ? obj1.selector : obj1;
    var obj2_sel = (obj2 instanceof Abstract) ? obj2.selector : obj2;
    return this._linker.unlink_mutual(obj1_sel, obj2_sel);
}

MetaTree.prototype.getObjectLinks = function (obj1, selector) {
    var obj1_sel = (obj1 instanceof Abstract) ? obj1.selector : obj1;
    var opts = {};
    if (selector) {
        var chunks = selector.split("/");
        opts = {
            obj_type: chunks[0]
        }
    }
    return this._linker.object_links(obj1_sel, opts);
}

module.exports = MetaTree;