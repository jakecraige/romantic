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

  // Table Constructor
  // ------------------

  var Table = Romantic.Table = function(name, options) {
    this.initialize.apply(this, arguments);
  };

  // Table Methods
  // ------------------

  _.extend(Table.prototype, {

    // When initializing a table you pass in it's name and options
    initialize: function(name, options) {
      options || (options = {});

      options = _.defaults(options, {
        dbName: 'romantic'
      });

      this._setDatabase(options);
      this._setTable(name);
      return this;
    },

    // This sets up the database instance inside the object
    _setDatabase: function(options) {
      var dbName;
      dbName = options.dbName;
      this._database =  store.namespace(dbName);
    },

    // This sets up the table instance and table name inside the object
    _setTable: function(name) {
      this._tableName = name;

      if(!this._database.has(name)) { this._database(name, []); }

      this._table = this._database(name);
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
      if(table == null) { table = this._table; }
      this._database(this._tableName, table);
      return table;
    },

    // Takes in an object of attributes and saves it with a unique cid
    create: function(data) {
      data.cid = _.uniqueId('c');
      this._table.push(data);
      this.save();
      return data;
    },

    // Returns all data in the table as an array
    all: function() {
      return this._table;
    },

    // Accepts either a data object that has an id/cid attribute or just a cid
    // or id. If it contains both, the `id` will take precendence
    find: function(data) {
      var id;
      id = data;

      if(data instanceof Object) {
        id = data.id || data.cid;
      }

      // Purposely using == and not === as to prevent type issues from coming
      // up when using localStorage as it could really be stored either way
      match = _.find(this._table, function(row){
        return row.id == id || row.cid == id
      });
      return match;
    },

    // Accepts a data object with changed values and will update and save the
    // data
    update: function(data) {
      var row, index;
      row   = this.find(data);
      index = _.indexOf(this._table, row);

      if(!row) { return false; }
      this._table[index] = _.extend(row, data);
      this.save();
      return row;
    },

    // This destroys all data in the table and saves it
    destroyAll: function() {
      this._database.remove(this.tableName);
    },

    // Takes an Object or Id/Cid and finds it in the table and destroys it
    destroy: function(data) {
      var row;
      row = this.find(data);
      this._table = _.without(this._table, row);
      this.save();
      return row;
    }

  });

  // Code Borrowed From Backbone
  // http://backbonejs.org

  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', ,'detect', 'filter', 'select',
    'reject', 'every', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

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
  //
  // End of Code Borrowed From Backbone
  // http://backbonejs.org
  Table.extend = extend;

  return Romantic;
}));



