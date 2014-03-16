// Romantic.js
// ----------------------------------
// v0.0.1
//
// Copyright (c)2013 Jake Craige
// Distributed under MIT license
//
// http://jcraige.com
//
// More info in readme found at https://github.com/jakecraige/romantic

(function(root, factory) {

  root.Romantic = factory(root, {}, root._);

}(this, function(root, Romantic, _) {

  // Borrowed from: https://github.com/jashkenas/underscore/issues/557
  _.mixin({
    deepIndex: function (array, item) {
      var result = -1;
      _.some(array, function (value, index) {
        if (_.isEqual(value, item)) {
          result = index;
          return true;
        }
      });
      return result;
    }
  });

  // Create local references to array methods we'll want to use later.(Backbone)
  var array = [];

  Romantic.VERSION = '0.1.0';

  Romantic.String = {
    capitalize: function(str) {
      return str.substr(0,1).toUpperCase() + str.substr(1);
    }
  };

  // LocalForage Adapter Constructor
  // -------------------------------

  var LocalForage = Romantic.LocalForage = function() {
    this.initialize.apply(this, arguments);
  };

  // LocalForage Adapter Methods
  // ------------------------------

  // Guid generation borrowed from
  // http://documentup.com/jeromegn/backbone.localStorage
  // Generate four random hex digits.
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  // Adapter API
  //  + replace
  //  + batch
  //  + keys
  //  + set
  //  + get
  //  + destroy
  //  + all
  //  + exists
  //  + destroyAll
  _.extend(LocalForage.prototype, {
    initialize: function(options) {
      this.dbName = options.dbName;
      this.tableName = options.tableName;
      this.setup();
      return this;
    },

    setup: function(callback) {
      this.setupDatabase();
      this.setupTable(callback);
    },

    setupDatabase: function() {
      this.database = null;
      this.database = new Romantic.LocalForage.DB(this.dbName);
    },

    setupTable: function(callback) {
      var that = this;
      if(!_.include(this.tables(), this.tableName)) {
        this.table = [];
        this.setTable([]);
        if(callback) {
          callback([]);
        }
      } else {
        this.database.get(this.tableName, function(data){
          that.table = data;
          if(callback) {
            callback(_.clone(data));
          }
        });
      }
    },

    // Replaces the table with the array of objects passed in
    replace: function(newTable, callback) {
      if(newTable == null) { newTable = this.table; }
      return this.setTable(newTable, callback);
    },

    setTable: function(data, callback) {
      var that = this;
      if(_.isArray(data)) {
        this.database.set(this.tableName, data, function(newData){
          that.table = newData;
          if(callback) {
            callback(newData);
          }
        });
      } else {
        // If this function called without any data we are trying to reset the
        // database to the local copy
        this.setup(callback)
      }
      return this.table;
    },

    // Returns a list of all the tables in the database
    tables: function(tableName) {
      return this.database.tables();
    },

    // Removes the table completely from the database
    destroyAll: function(callback) {
      var that = this;
      return this.database.destroy(this.tableName, function() {
        that.setup(callback);
      });
    },

    // Returns the table, an array of objects
    all: function(callback) {
      return callback(_.clone(this.table));
    },

    // When passed in an object/string/num it will pull out the id or cid and
    // find that in the table and return the found object, the id will always
    // take precedence
    find: function(data, callback) {
      var _this, id, cid, match, isValidId;
      id = data;

      if(_.isObject(data) && !_.isArray(data)) {
        id = data.id;
        cid = data.cid;
      }

      isValidId = function(id) {
        if(_.isNumber(id) && id >= 0) {
          return true;
        } else if(_.isString(id)) {
          return true;
        }
      };

      if((id || id === 0) && !isValidId(id)) {
        throw new Error('id: ' + id + ' is not a valid id');
      } else if((cid || cid === 0) && !isValidId(cid)) {
        throw new Error('cid: ' + cid + ' is not a valid id');
      }

      // Used to find matches in the table. Purposely using lazy == so that
      // there aren't issues with an id being a string like "123" and not
      // matching 124
      _this = this;
      lazyFindMatch = function(key, val) {
        return _.find(_this.table, function(row){
          if(row[key] == val) {
            return true;
          }
        });
      };

      // Loop through table to find the first match. It starts by trying to find
      // one by id and if it can't, it falls back to looking by cid
      // TODO: this could definitely be refactored
      if(id || id === 0) {
        match = lazyFindMatch('id', id);
      }
      if(!match) {
        if(cid || cid === 0) {
          match = lazyFindMatch('cid', cid);
        }
        if (!match && id ) {
          match =  lazyFindMatch('cid', id);
        }
      }
      return callback(_.clone(match));
    },

    // Pass in an object that will be given a unique cid, pushed onto the table,
    // and saved
    // Returns the new object
    create: function(data, callback) {
      var table;
      data.cid = guid();
      this.table.push(data);
      table = this.table

      return this.replace(table, function() {
        callback(_.clone(data));
      });
    },

    // Pass in an object that will be updated and saved
    // Returns the modified object
    update: function(data, callback) {
      var row, index, that = this;
      return this.find(data, function(row){
        index = _.deepIndex(that.table, row);
        if(!row) {
          throw new Error('Couldnt find record with that id or cid');
        }
        row = _.extend(row, data);
        that.table[index] = row;
        that.replace(that.table, function() {
          return callback(_.clone(row));
        });
      });
    },

    // Pass in an object/id that will be destroyed and saved on the table
    // Returns the deleted row
    destroy: function(data, callback) {
      var that = this;
      return this.find(data, function(row){
        var index;
        if(!row) { callback(false); return; }
        index = _.deepIndex(that.table, row);
        if(index !== undefined) {
          that.table.splice(index,1);
        }
        that.replace(that.table, function(){
          callback(_.clone(row));
        });
      });
    }
  });

  // DB Constructor
  // -------------------------------

  var DB = Romantic.LocalForage.DB = function() {
    this.initialize.apply(this, arguments);
  };

  // DB Methods
  // ------------------------------

  _.extend(DB.prototype, {
    initialize: function(dbName) {
      this._dbName = dbName;
      this.reload();
      return this;
    },

    // Sets up the local database. Called externally to reload the database
    // after it's been cleared
    reload: function() {
      this._database = localforage.namespace(this._dbName);
      return this._database;
    },

    all: function(callback) {
      var that = this;
      return this._database._getKeysCache(function(keys){
        if(callback && !keys) { callback([]); }

        promises = keys.map(function(key){
          that._database.get(key)
        });

        Promise.all(promises).then(function(results){
          if(callback) {
            callback(results)
          }
        })
      });
    },

    tables: function() {
      return _.keys(this.all());
    },

    get: function(tableName, callback) {
      return this._database.getItem(tableName, callback);
    },

    set: function(tableName, data, callback) {
      return this._database.setItem(tableName, data, callback);
    },

    destroy: function(tableName, callback) {
      return this._database.removeItem(tableName, callback);
    }

  });



  // Table Constructor
  // ------------------

  var Table = Romantic.Table = function(name, options) {
    this.initialize.apply(this, arguments);
  };

  // Table Methods
  // ------------------

  _.extend(Table.prototype, {

    // When initializing a table you pass in it's name and options. If you
    // create another adapter you can pass in an adapter to the options hash
    initialize: function(tableName, options) {
      if(!tableName && !this.tableName) {
        throw new Error('You must provide a table name when initializing a table');
      }
      options || (options = {});

      options = _.defaults(options, {
        dbName: 'romantic'
      });

      this._setStore(tableName, options);
      return this;
    },

    // This sets up the store instance inside the object
    _setStore: function(tableName, options) {
      options.tableName = this.tableName || tableName
      this._store = this.adapter ? new this.adapter(options) : new Romantic.LocalForage(options);
    },

    // Takes an optional table parameter(array of objects), this allows you to
    // completely replace the database with a new data set.
    //
    // It is used internally after the create, update, destroy functions
    //
    // Example:
    //
    //     var cars = [{make: 'Chevrolet', cid: 1}, {make: 'Dodge', cid: 2}];
    //     var carsTable = new Romantic.DB.Table('cars');
    //     carsTable.replace(cars);
    replace: function(table, callback) {
      this._store.setTable(this.filterData(table), callback);
    },

    // Utility function to console.table out the table for easy debugging
    logTable: function() {
      console.table(this._store.table);
    },

    // Utility function to console.log out the table for easy debugging
    log: function() {
      console.log(this._store.table);
    },

    // Filters data to attributes specified in table `schema`.
    //
    // It can be an array of keys:
    //     ['firstName', 'lastName']
    //
    // An object with the key as the name and value as a type or function
    // validation:
    //     {
    //       'address':   'string',
    //       'age':       'integer'
    //       'firstName': function(name) {
    //         if(name === 'John') {
    //           return true;
    //         }
    //       }
    //     }
    //
    // Accepted types are:
    //   + Any
    //   + Array
    //   + Object
    //   + String
    //   + Number
    //   + Boolean
    //   + Custom function returning a boolean for if it's accepted or not
    //
    //  The object can be mixed with functions and type strings
    //
    filterData: function(data) {
      if(this.schema) {
        var validKeys;
        // We start with the cid and id, they will always be permitted
        validKeys = ['cid', 'id'];

        // The schema is only an array of keys, no validations will be done
        if(_.isArray(this.schema)) {
          // Add each value in the array as a valid key
          _.each(this.schema, function(column){
            validKeys.push(column);
          });

          // Schema is an object so we will need to specify validations
        } else if(_.isObject(this.schema)) {

          _.each(this.schema, function(val, key) {
            // Accept any attribute if the value is ''
            // or
            // Accept attribute if value is a function that returns true when
            // given the attributes value in this object
            //
            // TODO: Would it be better to use if/elseif here for some
            // reason? Instead of the ||
            if(val === '' || _.isFunction(val) && val(data[key])) {
              validKeys.push(key);
            } else {
              // Loop through accepted types and use underscores method to
              // verify that it is one of those types
              acceptedTypes = ['array', 'object', 'string', 'number', 'boolean'];
              _.each(acceptedTypes, function(type) {
                if(val === type && _['is'+Romantic.String.capitalize(type)](data[key])) {
                  validKeys.push(key);
                }
              });
            }

          });

        }

        // Returns new object with only the keys from validKeys pulled out
        return _.pick(data, validKeys);
      }
      return data;
    },

    // Defers to current store's `create`
    create: function(data, callback) {
      return this._store.create(this.filterData(data), callback);
    },

    // Gets all data from current store via `all` and filters it and returns an
    // array of that data
    all: function(callback) {
      var that = this;
      return this._store.all(function(data) {
        callback(_.map(data, function(row) {
          return this.filterData(row);
        }, that));
      });
    },

    // Defers to the current store's `find`
    find: function(data, callback) {
      return this._store.find(data, callback);
    },

    // Filters data via schema and defers to current store's `update`
    update: function(data, callback) {
      return this._store.update(this.filterData(data), callback);
    },

    // Defers to the current store's `deferAll`
    destroyAll: function(callback) {
      return this._store.destroyAll(callback);
    },

    // Defers to current store's `create`
    destroy: function(data, callback) {
      return this._store.destroy(data, callback);
    }

  });

  // Code Borrowed From Backbone
  // http://backbonejs.org

  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', ,'detect', 'filter', 'select',
    'reject', 'every', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'where', 'findWhere'];

  // Mix in each Underscore method as a proxy to `Table#_table`.
  _.each(methods, function(method) {
    Table.prototype[method] = function() {
      var args = array.slice.call(arguments);
      args.unshift(this._table);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Table.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model[value];
      };
      return _[method](this._table, iterator, context);
    };
  });

  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the Table

  // End of Code Borrowed From Backbone
  // http://backbonejs.org
  DB.extend = LocalForage.extend = Table.extend = extend;

  return Romantic;
}));
