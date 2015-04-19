"use strict";
var _ = require("lodash");
var Promise = require("bluebird");
var Error = require("./Error");
var DB_Face = require('./Couchbird/DB_Face');
var traverse = require("traverse");

var Config = function (bucket_name) {
    var _cfg_keys = [];
    var _cfg_origs = {};
    var _db = DB_Face.bucket(bucket_name);
    var _path_delimiter = ".";

    var _promisedConfig = function (cfg_name) {
        console.log("Cfg name", cfg_name);
        return _db.get(cfg_name).then(function (res) {
                if (_.indexOf(_cfg_keys, cfg_name) < 0)
                    _cfg_keys.push(cfg_name);
                _cfg_origs[cfg_name] = res.value;
                var def = _.cloneDeep(res.value.default);
                return Promise.resolve(_.merge(def, res.value));
            })
            .catch(function (err) {
                _cfg_keys = _.filter(_cfg_keys, function (n) {
                    return n == cfg_name;
                });
                return Promise.resolve(false);
            });
    }

    var _getTraverse = function (obj, where) {
        var path = _.isArray(where) ? where : where.split(_path_delimiter);
        path = (_.first(path) != "default") ? path : _.rest(path);
        return traverse(obj).get(path);
    }

    var pub = {
        set_path_delimiter: function (delim) {
            _path_delimiter = delim;
        },
        clean: function () {
            var self = this;
            _.forEach(_cfg_keys, function (key) {
                console.log("Deleting key", key);
                delete self[key];
                delete _cfg_origs[key];
            });
        },
        load: function (cfgs) {
            if (!_.isArray(cfgs))
                throw new Error("INVALID_ARGUMENT", "A list of config ids should be passed");
            var cfg_ids = _.union(cfgs, _cfg_keys);
            console.log("Loading ids", cfg_ids);
            var props = {};
            var self = this;
            _.forEach(cfg_ids,
                function (val) {
                    props[val] = _promisedConfig(val);
                });
            return Promise.props(props)
                .then(function (res) {
                    _.forEach(_cfg_keys, function (key) {
                        self[key] = res[key];
                    });
                    return Promise.resolve(self);
                });
        },
        init: function () {
            return this.load();
        },
        reload: function () {
            this.clean();
            return this.load(_cfg_keys);
        },
        get_default: function (cfg, path) {
            if (!_.isArray(path) && !_.isString(path))
                throw new Error("INVALID_ARGUMENT", "Path should be either string with '" + _path_delimiter + "' as delimiter, or an array.");
            if (_.indexOf(_cfg_keys, cfg) < 0 || !_cfg_origs[cfg].default)
                return {};
            return _getTraverse(_cfg_origs[cfg].default, path);
        },
        get_nodefault: function (cfg, path) {
            if (!_.isArray(path) && !_.isString(path))
                throw new Error("INVALID_ARGUMENT", "Path should be either string with '" + _path_delimiter + "' as delimiter, or an array.");
            if (_.indexOf(_cfg_keys, cfg) < 0)
                return {};
            return _getTraverse(_cfg_origs[cfg], path);
        },
        safe_get: function (cfg, path) {
            if (!_.isArray(path) && !_.isString(path))
                throw new Error("INVALID_ARGUMENT", "Path should be either string with '" + _path_delimiter + "' as delimiter, or an array.");
            return _getTraverse(_cfg_origs[cfg], path) || _getTraverse(_cfg_origs[cfg].default, path);
        },
        get: function (cfg, path) {
            return this.safe_get(cfg, path);
        }
    };

    return pub;
}
module.exports = Config;