
// REGISTER CONTROLLER
moneyleashapp.controller('PersonalProfileController', function ($scope, $rootScope, $state, $firebaseAuth, UserData) {

    $scope.getProfile = function () {
        
        var authData = fb.getAuth();
        UserData.getMember(authData.password.email).then(function (user) {
            var sFirstName = user.firstname;
            var sLastName = user.lastname;
            var sEmail = user.email;
            var dtCreated = new Date(user.datecreated);
            var dtUpdated = new Date(user.dateupdated);
            var temp = {
                firstname: sFirstName,
                lastname: sLastName,
                email: sEmail,
                datecreated: dtCreated,
                dateupdated: dtUpdated
            }
            $scope.user = temp;
        });
    };

    $scope.saveProfile = function (user) {
        var authData = fb.getAuth();
        var usersRef = UserData.ref();
        var myUser = usersRef.child(escapeEmailAddress(authData.password.email));
        var sFirstName = user.firstname;
        var sLastName = user.lastname;
        var sEmail = user.email;
        var dtCreated = new Date(user.datecreated);
        var dtUpdated = new Date();
        if (isNaN(dtCreated)) {
            dtCreated = new Date();
        }
        dtCreated = +dtCreated;
        dtUpdated = +dtUpdated;
        var temp = {
            firstname: sFirstName,
            lastname: sLastName,
            email: sEmail,
            datecreated: dtCreated,
            dateupdated: dtUpdated
        }
        myUser.update(temp, function () {
            $rootScope.hide();
            $state.go('app.settings');
        });
    };
})