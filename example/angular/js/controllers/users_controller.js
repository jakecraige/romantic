var UsersApp = angular.module('UsersApp', ['UserModel'])
 .controller('UsersCtrl', ['$scope', 'User', function($scope, User) {
   var setUsers = function() {
    $scope.users = User.all();
   };
   setUsers();

   $scope.create = function(user) {
     User.create(user);
     $scope.newUser = {};
     setUsers(); // We need to reload them so it adds it to the table
   };

   $scope.update = function(user) {
     User.update(user);
   };

   $scope.destroy = function(user) {
     User.destroy(user);
     $scope.newUser = {};
     setUsers(); // We need to reload them so it removes it from table
   };
 }]);
