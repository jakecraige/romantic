var UserModel = angular.module('UserModel', [])
 .factory('User', function() {

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
     }
   });

   return new UsersTable();
 });
