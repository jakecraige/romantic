// Romantic.DB.js   by Jake Craige 2013
//
// TODO:
//    Set up locator functions to accept an array
//

(function(root, factory) {

  root.Romantic = factory(root, {}, root._);

}(this, function(root, Romantic, _) {

  // Create local references to array methods we'll want to use later.
  var array = [];

  Romantic.VERSION = '0.0.1';

  var Table = Romantic.Table = function(name, options) {
    this.initialize.apply(this, arguments);
  };

  _.extend(Table.prototype, {
    initialize: function(name, options) {
      options || (options = {});

      options = _.defaults(options, {
        dbName: 'romantic'
      });

      this._setDatabase(options);
      this._setTable(name);
      return this;
    },
    _setDatabase: function(options) {
      var dbName;
      console.log(this);
      if(options.dbName) {
        dbName = options.dbName;
      } else {
        dbName = 'kaf'
      }

      this._database =  store.namespace(dbName);
    },
    _setTable: function(name) {
      this._tableName = name;

      if(!this._database.has(name)) { this._database(name, []); }

      this._table = this._database(name);
    },
    save: function(table) {
      if(table == null) { table = this._table; }
      this._database(this._tableName, table);
      return table;
    },
    create: function(data) {
      data.cid = _.uniqueId('c');
      this._table.push(data);
      this.save();
      return data;
    },
    all: function() {
      return this._table;
    },
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
    update: function(data) {
      var row, index;
      row   = this.find(data);
      index = _.indexOf(this._table, row);

      if(!row) { return false; }
      this._table[index] = _.extend(row, data);
      this.save();
      return row;
    },
    destroyAll: function() {
      this._database.remove(this.tableName);
    },
    destroy: function(data) {
      var row;
      row = this.find(data);
      this._table = _.without(this._table, row);
      this.save();
      return row;
    }

  });

  // Backbone, wooo!
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

  // Thanks Backbone!
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

  // Set up inheritance for the model, collection, router, view and history.
  Table.extend = extend;

  return Romantic;
}));



