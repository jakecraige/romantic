var UserModel = angular.module('UserModel', [])
 .factory('User', function() {
   var UsersTable = Romantic.Table.extend({
     tableName: 'users',
     //adapter: Romantic.LocalStorage,
     schema: {
       'firstName': function(name) {
         if(name === 'Jake') {
           return true;
         }
       },
       'lastName': 'string'
     }
   });
   return new UsersTable();
 });
