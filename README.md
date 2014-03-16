Romantic.js
----------------------------------
v0.1.0

*TODO:*
+  Relationships
+  Update How-To section to use callbacks

Description:
--------------------
Library for managing client side model data in web and mobile applications.

It comes with a default localforage adapter that will pick the best storage for
the environment and uses that to manage and query the data.

Dependencies:
------------------
 +  Underscore - https://github.com/jashkenas/underscore
 +  Localforage     - https://github.com/mozilla/localforage

How-To: (out-of-date)
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


Docs & Examples:
--------------------
Docs: 
  + http://jcraige.com/romantic/docs/

Angular: 
  + http://jakecraige.com/romantic/angular/
  + example/angular/index.html in this repo


Run Tests:
-------------------
Open up test/SpecRunner.html in your browser


===========================
Copyright (c)2013 Jake Craige
Distributed under MIT license

http://jcraige.com
