
// REGISTER CONTROLLER
moneyleashapp.controller('PersonalProfileController', function ($scope, $rootScope, $state, MembersFactory, dateFilter) {

    $scope.getProfile = function () {
        var fbAuth = fb.getAuth();
        MembersFactory.getMember(fbAuth.uid).then(function (user) {
            var sFirstName = user.firstname;
            var sLastName = user.lastname;
            var sEmail = user.email;
            var dtCreated = new Date(user.datecreated);
            var dtUpdated = new Date(user.dateupdated);
            var temp = {
                firstname: sFirstName,
                lastname: sLastName,
                email: sEmail,
                datecreated: dateFilter(dtCreated, 'MMMM dd, yyyy HH:mm:ss'),
                dateupdated: dateFilter(dtUpdated, 'MMMM dd, yyyy HH:mm:ss')
            }
            $scope.member = temp;
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
            $rootScope.hide();
            $state.go('app.settings');
        });
    };
})