{
    ddoc: linker,
    name: object_links,
    map: function (doc, meta) {
        var parts = meta.id.split("/");
        if (parts[0] == "link") {
            parts.shift();
            var data = {
                id: meta.id,
                value: doc
            };
            emit(parts, data);
        }
    },
    reduce: function (keys, vals) {
        var out = [];
        for (var i in vals) {
            out.push(vals[i]);
        }
        return out;
    }
}