
// REGISTER CONTROLLER
moneyleashapp.controller('PersonalProfileController', function ($scope, $state, $rootScope, MembersFactory) {

    $scope.getProfile = function () {

        $scope.member = {};
        $scope.house = {};
        MembersFactory.getMember($rootScope.authData).then(function (thisuser) {
            $scope.member.firstname = thisuser.firstname;
            $scope.member.lastname = thisuser.lastname;
            $scope.member.email = thisuser.email;
            $scope.member.datecreated = thisuser.datecreated;
            $scope.member.paymentplan = thisuser.paymentplan;
            $scope.house.name = thisuser.housename;
            $scope.house.number = thisuser.housenumber;
            $scope.house.admin = thisuser.houseadmin;
            $scope.house.admin = thisuser.houseadmin;
        });
    };
    
    $scope.saveProfile = function (user) {
        var fbAuth = fb.getAuth();
        var usersRef = MembersFactory.ref();
        var myUser = usersRef.child(fbAuth.uid);
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
            $state.go('app.settings');
        });
    };
})