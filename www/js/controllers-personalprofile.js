
// REGISTER CONTROLLER
moneyleashapp.controller('PersonalProfileController', function ($scope, $rootScope, $state, $firebaseAuth, UserData) {

    $scope.user = {
        firstname: "",
        lastname: "",
        email: "",
        groupid: 0,
        password: ""
    };

    $scope.save = function (user) {
        console.log("saved here");
    };
})