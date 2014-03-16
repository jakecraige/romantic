;(function(localforage){
  'use strict';
  localforage.namespace = function(name) {
    var namespace = name;

    return {
      namespace: function() {
        return namespace;
      },
      _namespacedKey: function(key) {
        return this.namespace() + ':' + key;
      },
      _includes: function(array, key) {
        var i;
        for(i = 0; i < array.length; i++) {
          if(array[i] === key) {
            return true;
          }
        }
        return false;
      },
      _addToKeysCache: function(key) {
        var that = this;
        return localforage.getItem(this._namespacedKey('keysCache'), function(keysCache){
          if(!keysCache) { keysCache = []; }
          if(!that._includes(keysCache, key)) {
            keysCache.push(key);
            localforage.setItem(that._namespacedKey('keysCache'), keysCache)
          }
        });
      },
      _getKeysCache: function(callback) {
        return localforage.getItem(this._namespacedKey('keysCache'), callback);
      },
      _delegateMethod: function(method, callback) {
        var that = this;
        var args = [].slice.call(arguments, 2);
        return new Promise(function(resolve, reject) {
          if (callback) {
            args.push(callback)
            localforage[method].apply(null, args);
          } else {
            localforage[method].apply(null, args.slice(2)).then(resolve);
          }
        });
      },
      setItem: function(key, value, callback) {
        var nsKey = this._namespacedKey(key);
        this._addToKeysCache(key);
        return this._delegateMethod("setItem", callback, nsKey, value);
      },
      getItem: function(key, callback) {
        return this._delegateMethod("getItem", callback, this._namespacedKey(key));
      },
      removeItem: function(key, callback) {
        return this._delegateMethod("removeItem", callback, this._namespacedKey(key));
      },
      key: function(key, callback) {
        return this._delegateMethod("key", callback, this._namespacedKey(key));
      },
      clear: function(callback) {
        var that = this;
        return new Promise(function(resolve, reject) {
          that._getKeysCache(function(keys){
            var promises = keys.map(function(key){
              return that.removeItem(key);
            }).push(that.removeItem('keysCache'));

            Promise.all(promises).then(function(){
              if(callback) {
                callback(true);
              }
              resolve(true);
            }).catch(function(err){
              if(callback) {
                callback(false);
              }
              resolve(false);
            });
          });
        });

      },
      length: function(callback) {
        var that = this;
        return new Promise(function(resolve, reject) {
          that._getKeysCache(function(keys){
            if(!keys) { keys = []; }
            if(callback) {
              callback(keys.length);
            }
            resolve(keys.length);
          });
        });
      },
    };
  };
})(localforage);
