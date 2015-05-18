# MetaTree
Meta Tree object model implementation.

## Configuring
Config file is located at Consts/config.js. Later it will be incapsulated in separete module.
Note that MetaTree usage requires:

1. Couchbase installed 
2. Node.js or io.js installed
3. Node.js driver for Couchbase installed. It can be rather painful.
4. All that stuff from package.json

## Creating model objects
Hence you are going to create a metaobject (class) called Something.

1. Create a document with id "schema/something" in your Couchbase bucket.
2. Create file Model/Something.js with minimal contents:

    ```
    'use strict';
    
    var Abstract = require("./Abstract");
    
    function Something() {
        Abstract.call(this);
    }
    
    require("util").inherits(Something, Abstract);
    
    module.exports = Something;
    ```
3.  Now you can override any method of Abstract in your metaobject.
    E.g.,

    ```
    Something.prototype.remove = function(){
        this.enabled = false;
        return this.save();
    }
    ```

Note that it is meant to return promises from overriden functions and leave exception handling to higher level code.

## Error handling
Currently all error types are stored in Consts/errors. Feel free to add something.

## Linker
Note that Linker use views that should be installed to bucket before you can use links. This can be done with the following code (it resides in bucketSetup.js):
```
var init_bucket = require("./DB_Setup");
init_bucket();
```

## Object lifecycle example
Note that MetaTree implementation of lifecycle methods includes additional assertions and tend to be more fool-proof.
```
'use strict';

var MetaTree = require("./MetaTree");
var OperatorClass = require("./Model/Operator")
var AbstractClass = require("./Model/Abstract")
var util = require("util");
var config = require("./Consts/config");

var meta_tree = new MetaTree({
    bucket_name: config.db.bucket_name
});
var op1 = null;
var Operator = null;
meta_tree.initModel()
    .then(function () {
    var opts = {
            db_id: 1,
            id: 1,
            qaTerminalDesign: {
                something: "right"
            }
        };
        Operator = meta_tree.Operator;
        // equivalent to op1 = Operator.spawn(opts);
        op1 = meta_tree.create(Operator, opts);
        //save to db, also can be performed as op1.save()
        return meta_tree.save(op1);
    })
    .then(function (res) {
    //also meta_tree.retrieve(op1) || meta_tree.retrieve(Operator, op1.db_id)
        return op1.retrieve();
    })
    .then(function (res) {
        //also meta_tree.update(op1, {...}) || meta_tree.update(Operator, op1.db_id, {...})
             return op1.update({
                 hr_desc: "Spirit of the Operator",
                qaTerminalDesign: {
                    something: "wrong"
                }
           });
    })
    .then(function (res) {
    //meta_tree.remove(op1)
    return op1.remove();
    });
```
