
var moneyleashapp = angular.module('moneyleash.controllers', [])

// APP CONTROLLER : SIDE MENU
moneyleashapp.controller('AppCtrl', function ($scope, $rootScope, $state, $ionicActionSheet, fireBaseData, $ionicHistory, Auth) {

    $scope.showMenuIcon = true;

    // Triggered on a the logOut button click
    $scope.showLogOutMenu = function () {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Logout',
            titleText: 'Are you sure you want to logout?',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                //Called when one of the non-destructive buttons is clicked,
                //with the index of the button that was clicked and the button object.
                //Return true to close the action sheet, or false to keep it opened.
                return true;
            },
            destructiveButtonClicked: function () {
                //Called when the destructive button is clicked.
                //Return true to close the action sheet, or false to keep it opened.
                $rootScope.show('');
                fireBaseData.clearData();
                $ionicHistory.clearCache();
                Auth.$unauth();
            }
        });
    };
})

// ABOUT CONTROLLER
moneyleashapp.controller('AboutController', function ($scope, $ionicSlideBoxDelegate) {
    $scope.navSlide = function (index) {
        $ionicSlideBoxDelegate.slide(index, 500);
    }
})

// INTRO CONTROLLER
moneyleashapp.controller('IntroController', function ($scope, $state, $rootScope) {
    $scope.login = function () {
        $state.go('login');
    };
    $scope.register = function () {
        $state.go('register');
    };
})

// LOGIN CONTROLLER
moneyleashapp.controller("LoginController", function ($scope, $rootScope, $state, Auth, fireBaseData) {

    $scope.user = {};

    $scope.doLogIn = function (user) {

        $rootScope.show('Logging In...');

        /* Check user fields*/
        if (!user.email || !user.password) {
            $rootScope.hide();
            $rootScope.notify('Oops', 'Please check your Email or Password!');
            return;
        }

        /* All good, let's authentify */
        Auth.$authWithPassword({
            email: user.email,
            password: user.password
        }).then(function (authData) {
            //console.log(authData);
            $rootScope.hide();
            $state.go('app.accounts');
        }).catch(function (error) {
            $rootScope.hide();
            $rootScope.notify('Error', 'Email or Password is incorrect!');
        });
    }
})

//SIGN UP CONTROLLER
moneyleashapp.controller('RegisterController', function ($scope, $rootScope, $state, $firebase, $firebaseAuth, fireBaseData) {

    $scope.user = {};

    $scope.goToLogIn = function () {
        $state.go('login');
    };

    $scope.createMember = function (user) {
        var firstname = user.firstname;
        var lastname = user.lastname;
        var email = user.email;
        var password = user.password;

        if (!firstname || !lastname || !email || !password) {
            $rootScope.notify("Please enter valid credentials");
            return false;
        }

        $rootScope.show('Registering...');

        fb.createUser({
            email: email,
            password: password
        }, function (error, userData) {
            if (error) {
                switch (error.code) {
                    case "EMAIL_TAKEN":
                        //console.log("The new user account cannot be created because the email is already in use.");
                        $rootScope.hide();
                        $rootScope.notify('The new user account cannot be created because the email is already in use.');
                        break;
                    case "INVALID_EMAIL":
                        //console.log("The specified email is not a valid email.");
                        $rootScope.hide();
                        $rootScope.notify('The specified email is not a valid email.');
                        break;
                    default:
                        //console.log("Error creating user:", error);
                        $rootScope.hide();
                        $rootScope.notify('Oops. Something went wrong.');
                }
            } else {
                //console.log("Successfully created user account with uid:", userData.uid);

                fb.authWithPassword({
                    "email": email,
                    "password": password
                }, function (error, authData) {
                    if (error) {
                        //console.log("Login Failed!", error);
                        $rootScope.hide();
                        $rootScope.notify('Error', 'Login failed!');
                    } else {
                        //console.log("Authenticated successfully with payload:", authData);
                        /* PREPARE DATA FOR FIREBASE*/
                        $scope.temp = {
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            groupid: 0,
                            created: Date.now(),
                            updated: Date.now()
                        }

                        /* SAVE PROFILE DATA */
                        var usersRef = UserData.ref();
                        var myUser = usersRef.child(escapeEmailAddress(user.email));
                        myUser.update($scope.temp, function (ret) {
                            $rootScope.hide();
                            $state.go('app.accounts');
                        });
                    }
                });
            }
        });
    };

})

// FORGOT PASSWORD CONTROLLER
moneyleashapp.controller('ForgotPasswordCtrl', function ($scope, $state) {

    $scope.user = {};

    $scope.recoverPassword = function (user) {
        //$state.go('accounts');
        //console.log(user.email);
    };

    $scope.login = function () {
        $state.go('login');
    };

    $scope.register = function () {
        $state.go('register');
    };
})

// DASHBOARD CONTROLLER
moneyleashapp.controller('DashboardCtrl', function ($scope) {
    
})

// RECURRING
moneyleashapp.controller('RecurringListCtrl', function ($scope) {

})

function escapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
}

function unescapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\,/g, '.');
    return email;
}
