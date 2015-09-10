
// REGISTER CONTROLLER
moneyleashapp.controller('PersonalProfileController', function ($scope, $state, MembersFactory) {

    $scope.getProfile = function () {
        MembersFactory.getMember().then(function (user) {
            var sFirstName = user.firstname;
            var sLastName = user.lastname;
            var sEmail = user.email;
            var sPaymentPlan = user.paymentplan;
            var temp = {
                firstname: sFirstName,
                lastname: sLastName,
                email: sEmail,
                paymentplan: sPaymentPlan
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
            $state.go('app.settings');
        });
    };
})