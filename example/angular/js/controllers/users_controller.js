var UsersApp = angular.module('UsersApp', ['UserModel']);

UsersApp.controller('UsersCtrl', ['$scope', 'User', function($scope, User) {

  // Refresh users on the scope, Execute on controller load
  // This is called after changing data to reload the data so the template will
  // update
  ($scope.refreshUsers = function() {
    $scope.users = User.all();
  })();

  $scope.create = function(user) {
    User.create(user);
    $scope.newUser = {}; // Clear out the input fields
    $scope.refreshUsers();
  };

}]);

UsersApp.controller('UserCtrl', ['$scope', 'User', function($scope, User) {
  $scope.update = function(user) {
    User.update(user);
    $scope.refreshUsers();
  };

  $scope.destroy = function(user) {
    User.destroy(user);
    $scope.refreshUsers();
  };
}]);
