// RomanticDB.js
// ----------------------------------
// v0.0.1
//
// Copyright (c)2013 Jake Craige
// Distributed under MIT license
//
// http://jcraige.com
//
// *TODO:*
// +  Set up query functions to accept an array
// +  Remove store2 dependency
//
//
// Description:
// --------------------
// Library for managing client side data in web and mobile applications.
//
// It treats the browser localStorage like a database and provides and interface
// for managing and querying the data.
//
//
// Dependencies:
// ------------------
//  +  Underscore - https://github.com/jashkenas/underscore
//  +  Store2     - https://github.com/nbubna/store
//
//
// Example:
// --------------------
//
//     var users          = new Romantic.Table('users', {dbName: 'apple'});
//     var john           = users.create({ id: 1, firstName: 'John', lastName: 'Doe' });
//     var foundJohn      = users.find(1); // or users.find(john)
//     john.firstName     = 'Jane';
//     john               = users.update(john);
//     var destroyedJohn  = users.destroy(1); // or users.destroy(john)

(function(root, factory) {

  root.Romantic = factory(root, {}, root._);

}(this, function(root, Romantic, _) {

  // Create local references to array methods we'll want to use later.(Backbone)
  var array = [];

  Romantic.VERSION = '0.0.1';

  // LocalStorage Adapter Constructor
  // -------------------------------

  var LocalStorage = Romantic.LocalStorage = function() {
    this.initialize.apply(this, arguments);
  };

  // LocalStorage Adapter Methods
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
  //  + save
  //  + batch
  //  + keys
  //  + set
  //  + get
  //  + destroy
  //  + all
  //  + exists
  //  + destroyAll
  _.extend(LocalStorage.prototype, {
    initialize: function(options) {
      this.setupDatabase(options.dbName);
      this.setupTable(options.tableName);
      return this;
    },
    setupDatabase: function(dbName) {
      this.database = store.namespace(dbName);
    },
    setupTable: function(tableName) {
      this.tableName = tableName;

      if(!_.include(this.tables(), this.tableName)) {
        this.setTable([]);
      } else {
        this.table = this.database(this.tableName);
      }
    },

    // Replaces the table with the array of objects passed in
    save: function(newTable) {
      if(newTable == null) { newTable = this.table; }
      return this.setTable(newTable);
    },
    setTable: function(data) {
      this.database.set(this.tableName, data);
      this.table = this.database.get(this.tableName);
      return this.table;
    },
    // Returns a list of all the tables in the database
    tables: function(tableName) {
      return this.database.keys();
    },
    // Removes the table completely from the database
    destroyAll: function() {
      return this.database.remove(this.tableName);
    },
    // Returns the table, an array of objects
    all: function() {
      return this.table;
    },
    // WHen passed in an object/string/num it will pull out the id or cid and
    // find that in the table
    find: function(data) {
      var id;
      id = data;

      if(data instanceof Object) {
        id = data.id || data.cid;
      }

      // Purposely using == and not === as to prevent type issues from coming
      // up when using localStorage as it could really be stored either way
      match = _.find(this.table, function(row){
        return row.id == id || row.cid == id
      });
      return match;
    },
    // Pass in an object that will be given a unique id, pushed onto the table,
    // and saved
    create: function(data) {
      var table;
      data.cid = guid();
      this.table.push(data);
      this.save();
    },
    // Pass in an object that will be updated and saved
    update: function(data) {
      var row, index;
      row   = this.find(data);
      index = _.indexOf(this.table, row);

      if(!row) {
        throw new Error('Couldnt find record with that id or cid');
      }
      this.table[index] = _.extend(row, data);
      this.save();
      return row;
    },
    // Pass in an object/id that will be destroyed and saved on the table
    destroy: function(data) {
      var row;
      row = this.find(data);
      if(!row) { return false; }
      this.table = _.without(this.table, row);
      this.save();
      return row;
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

    // When initializing a table you pass in it's name and options
    initialize: function(tableName, options) {
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
      this._store = this.adapter ? new this.adapter(options) : new Romantic.LocalStorage(options);
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
    //     carsTable.save(cars);
    save: function(table) {
      return this._store.setTable(this.filterData(table));
    },

    // Utility function to console.table out the table for easy debugging
    logTable: function() {
      console.table(this._store.table);
    },

    // Utility function to console.log out the table for easy debugging
    log: function() {
      console.log(this._store.table);
    },

    // Filters data to attributes specified in schema.
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
    //   + Date
    //
    //  The object can be mixed with functions and type strings
    //
    filterData: function(data) {
      if(this.schema) {
        var validKeys;
        // We start with the cid, so it needs to always be allowed
        validKeys = ['cid'];

        if(_.isArray(this.schema)) {
          // Add each value in the array as a valid key
          _.each(this.schema, function(column){
            validKeys.push(column);
          });

        } else if(_.isObject(this.schema)) {

          _.each(this.schema, function(val, key) {
            // Accept attribute if the key is 'any' or it's a function and that
            // function returns true with the value of the key passed in
            if(val === 'any' || _.isFunction(val) && val(data[key])) {
              validKeys.push(key);
            } else {
              // Loop through accepted types and use underscores method to
              // verify that it is one of those types
              acceptedTypes = ['array', 'object', 'string', 'number', 'boolean', 'date'];
              _.each(acceptedTypes, function(type) {
                if(val === type && _['is'+type.capitalize()](data[key])) {
                  validKeys.push(key);
                }
              });
            }

          });

        }

        // Returns new object with only the keys from validKeys pulled out
        return _.pick(data, validKeys);

        } else {
          throw new Error('Invalid schema entered');
        }
      return data;
    },

    // Takes in an object of attributes and saves it with a unique cid
    create: function(data) {
      this._store.create(this.filterData(data));
      return this._store.find(data);
    },

    // Returns all data in the table as an array
    all: function() {
      return _.map(this._store.all(), function(row) {
        return this.filterData(row);
      }, this);
    },

    // Accepts either a data object that has an id/cid attribute or just a cid
    // or id. If it contains both, the `id` will take precendence
    find: function(data) {
      return this._store.find(data);
    },

    // Accepts a data object with modified values and will update and save the
    // data
    update: function(data) {
      data = this.filterData(data);
      console.log('filter', data);
      return this._store.update(data);
    },

    // This destroys all data in the table and saves it
    destroyAll: function() {
      return this._store.destroyAll();
    },

    // Takes an Object or Id/Cid and finds it in the table and destroys it
    destroy: function(data) {
      return this._store.destroy(data);
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
  Table.extend = extend;

  return Romantic;
}));

String.prototype.capitalize = function() {
  return this.substr(0,1).toUpperCase() + this.substr(1);
};



