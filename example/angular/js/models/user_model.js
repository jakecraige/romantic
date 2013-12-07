var UserModel = angular.module('UserModel', [])
 .factory('User', function() {
   var UsersTable = Romantic.Table.extend({
     tableName: 'users',
     schema: ['firstName']
   });
   return new UsersTable();
 });
