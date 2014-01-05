Romantic.js
----------------------------------
v0.0.1

*TODO:*
+  Test Extending Romantic.Table with Schema
+  Relationships
+  Remove store2 dependency in LocalStorageAdapter

Description:
--------------------
Library for managing client side data in web and mobile applications.

It comes with a LocalStorage adapter that treats LocalStorage database and provides and interface
for managing and querying the data.

Dependencies:
------------------
 +  Underscore - https://github.com/jashkenas/underscore
 +  Store2     - https://github.com/nbubna/store

How-To:
------------------
See example/angular/js/models/user_model.js for an example of how to extend the
basic table so you can add a schema and provide validations.


    var users          = new Romantic.Table('users', {dbName: 'apple'});
    var john           = users.create({ id: 1, firstName: 'John', lastName: 'Doe' });
    var foundJohn      = users.find(1); // or users.find(john)
    john.firstName     = 'Jane';
    john               = users.update(john);
    var destroyedJohn  = users.destroy(1); // or users.destroy(john)

    // Extend Romantic.Table to provide a fixed schema. It will filter all data
    // when creating or updating records. It currently does not alert you on
    // failure. It just will ignore those keys
    var UsersTable = Romantic.Table.extend({
      tableName: 'users',

      schema: {
        firstName: '',
        lastName: 'string',
        age: function(age) {
          if(age > 0) {
            return true;
          }
        },
        height: 'number'
      }
    });

    var users = new UsersTable();
    var jake = users.create({
      firstName: "Jake",
      lastName: "Craige",
      age: -5,
      height: 6,
      website: 'http://google.com'
    });
    console.log(jake); // { firstName: "Jake", lastName: "Craige", height: 6 }


Examples:
--------------------
Angular: Open example/angular/index.html in your browser


Run Tests:
-------------------
Open up test/SpecRunner.html in your browser


===========================
Copyright (c)2013 Jake Craige
Distributed under MIT license

http://jcraige.com
