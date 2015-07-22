"use strict";
var _ = require("lodash");
var Promise = require("bluebird");
var Error = require("./Error/MetaTreeError");
var Couchbird = require('Couchbird');
var traverse = require("traverse");

var DB_Face = null;

var Config = function (config) {
    var _cfg_keys = {};
    var _cfg_origs = {};
    var _initial = config;

    DB_Face = Couchbird({
        server_ip: config.db.server_ip,
        n1ql: config.db.n1ql
    });

    var _db = DB_Face.bucket(config.db.bucket_name);
    var _path_delimiter = ".";

    var _promisedConfig = function (cfg_id, cfg_name) {
        return _db.get(cfg_id).then(function (res) {
                if (!_.has(_cfg_keys, cfg_name))
                    _cfg_keys[cfg_name] = cfg_id;
                _cfg_origs[cfg_name] = res.value;
                var def = _.cloneDeep(res.value.default);
                var result = (!def || _.isEmpty(def)) ? res.value : _.merge(def, res.value);
                return Promise.resolve(result);
            })
            .catch(function (err) {
                _cfg_keys = _.omit(_cfg_keys, cfg_name);
                return Promise.resolve(false);
            });
    }

    var _getTraverse = function (obj, where) {
        var path = _.isArray(where) ? where : where.split(_path_delimiter);
        path = (_.first(path) != "default") ? path : _.rest(path);
        return traverse(obj).get(path);
    }

    var pub = {
        initial: _initial,
        set_path_delimiter: function (delim) {
            _path_delimiter = delim;
        },
        clean: function () {
            var self = this;
            _.forEach(_cfg_keys, function (val, key) {
                delete self[key];
                delete _cfg_origs[key];
            });
        },
        load: function (cfg_ids) {
            if (!_.isObject(cfg_ids))
                throw new Error("INVALID_ARGUMENT", "A list of config ids should be passed");
            var props = {};
            var self = this;
            _.forEach(cfg_ids,
                function (val, key) {
                    props[key] = _promisedConfig(val, key);
                });
            return Promise.props(props)
                .then(function (res) {
                    _.forEach(_cfg_keys, function (val, key) {
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
            if (!_.has(_cfg_keys, cfg) || !_.has(_cfg_origs, cfg + ".default"))
                return {};
            return _getTraverse(_cfg_origs[cfg].default, path);
        },
        get_nodefault: function (cfg, path) {
            if (!_.isArray(path) && !_.isString(path))
                throw new Error("INVALID_ARGUMENT", "Path should be either string with '" + _path_delimiter + "' as delimiter, or an array.");
            if (!_.has(_cfg_keys, cfg))
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