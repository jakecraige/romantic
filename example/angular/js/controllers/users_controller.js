var UsersApp = angular.module('UsersApp', ['UserModel'])
 .controller('UsersCtrl', ['$scope', 'User', function($scope, User) {

   // Set users inside of a function so we can call it later to reload them
   var setUsers = function() {
    $scope.users = User.all();
   };
   setUsers();

   $scope.create = function(user) {
     User.create(user);
     $scope.newUser = {}; // Clear out the input fields
     setUsers(); // We need to reload them so everything updates
   };

   $scope.update = function(user) {
     User.update(user); // Clear out input fields
     setUsers(); // We need to reload them so everything updates
   };

   $scope.destroy = function(user) {
     User.destroy(user);
     $scope.newUser = {}; // Clear out input fields
     setUsers(); // We need to reload them so everything updates
   };
 }]);
