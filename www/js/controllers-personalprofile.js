
// REGISTER CONTROLLER
moneyleashapp.controller('PersonalProfileController', function ($scope, $rootScope, $state, $firebaseAuth, UserData) {

    $scope.getProfile = function () {
        
        var authData = fb.getAuth();
        UserData.getMember(authData.password.email).then(function (user) {
            $scope.user = user;
        });
    };

    $scope.saveProfile = function (user) {
        var authData = fb.getAuth();
        var usersRef = UserData.ref();
        var myUser = usersRef.child(escapeEmailAddress(authData.password.email));
        myUser.update(user, function () {
            $rootScope.hide();
            $state.go('app.settings');
        });
    };
})