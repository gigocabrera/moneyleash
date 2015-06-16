
var moneyleashapp = angular.module('moneyleash.controllers', [])

// APP CONTROLLER : SIDE MENU
moneyleashapp.controller('AppCtrl', function ($scope, $rootScope, $state, $ionicActionSheet, fireBaseData, $ionicHistory, Auth) {

    $scope.showMenuIcon = true;

    // Triggered on a the logOut button click
    $scope.showLogOutMenu = function () {

        // Show the action sheet
        $ionicActionSheet.show({
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
                $ionicHistory.clearCache();
                Auth.$unauth();
                $state.go('intro');
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
moneyleashapp.controller('IntroController', function ($scope, $state, $rootScope, $ionicHistory) {
    $ionicHistory.clearHistory();
    $scope.hideBackButton = true;
    $scope.login = function () {
        $state.go('login');
    };
    $scope.register = function () {
        $state.go('register');
    };
})

// LOGIN CONTROLLER
moneyleashapp.controller("LoginController", function ($scope, $rootScope, $state, Auth, fireBaseData) {

    $scope.user = {email: 'gigo@test.com', password: '123'};

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
            $rootScope.hide();
            $state.go('app.dashboard');
        }).catch(function (error) {
            $rootScope.hide();
            $rootScope.notify('Error', 'Email or Password is incorrect!');
        });
    }
})

//REGISTER CONTROLLER
moneyleashapp.controller('RegisterController', function ($scope, $rootScope, $state, $firebase, $firebaseArray, $firebaseAuth, MembersFactory, fireBaseData) {

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
                        $rootScope.hide();
                        $rootScope.notify('The new user account cannot be created because the email is already in use.');
                        break;
                    case "INVALID_EMAIL":
                        $rootScope.hide();
                        $rootScope.notify('The specified email is not a valid email.');
                        break;
                    default:
                        $rootScope.hide();
                        $rootScope.notify('Oops. Something went wrong.');
                }
            } else {
                fb.authWithPassword({
                    "email": email,
                    "password": password
                }, function (error, authData) {
                    if (error) {
                        $rootScope.hide();
                        $rootScope.notify('Error', 'Login failed!');
                    } else {
                        /* PREPARE DATA FOR FIREBASE*/
                        $scope.temp = {
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            groupid: 0,
                            datecreated: Date.now(),
                            dateupdated: Date.now()
                        }
                        /* SAVE MEMBER DATA */
                        var membersref = MembersFactory.ref();
                        var newUser = membersref.child(authData.uid);
                        newUser.update($scope.temp, function (ref) {
                            $rootScope.hide();
                            $state.go('app.about');
                        });
                        /* SAVE DEFAULT ACCOUNT TYPES DATA FOR THIS MEMBER */
                        var newtyperef = membersref.child(authData.uid).child("accounttypes");
                        var sync = $firebaseArray(newtyperef);
                        sync.$add({ name: 'Checking', icon: '0' }).then(function (newChildRef) {
                            $scope.temp = {
                                accountid: newChildRef.key()
                            };
                        });
                        sync.$add({ name: 'Savings', icon: '0' }).then(function (newChildRef) {
                            $scope.temp = {
                                accountid: newChildRef.key()
                            };
                        });
                        sync.$add({ name: 'Credit Card', icon: '0' }).then(function (newChildRef) {
                            $scope.temp = {
                                accountid: newChildRef.key()
                            };
                        });
                        sync.$add({ name: 'Debit Card', icon: '0' }).then(function (newChildRef) {
                            $scope.temp = {
                                accountid: newChildRef.key()
                            };
                        });
                        sync.$add({ name: 'Investment', icon: '0' }).then(function (newChildRef) {
                            $scope.temp = {
                                accountid: newChildRef.key()
                            };
                        });
                        sync.$add({ name: 'Brokerage', icon: '0' }).then(function (newChildRef) {
                            $scope.temp = {
                                accountid: newChildRef.key()
                            };
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
moneyleashapp.controller('DashboardController', function ($scope, $state, $stateParams) {
    
    $scope.editTransaction = function (item) {
        //alert('Edit Item: ' + item.id);
        $state.go('app.itemdetailsview', { itemId: item.id });
    };
    $scope.deleteTransaction = function (item) {
        alert('Delete Item: ' + item.id);
    };

    $scope.items = [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
      { id: 12 },
      { id: 13 },
      { id: 14 },
      { id: 15 },
      { id: 16 },
      { id: 17 },
      { id: 18 },
      { id: 19 },
      { id: 20 },
      { id: 21 },
      { id: 22 },
      { id: 23 },
      { id: 24 },
      { id: 25 },
      { id: 26 },
      { id: 27 },
      { id: 28 },
      { id: 29 },
      { id: 30 },
      { id: 31 },
      { id: 32 },
      { id: 33 },
      { id: 34 },
      { id: 35 },
      { id: 36 },
      { id: 37 },
      { id: 38 },
      { id: 39 },
      { id: 40 },
      { id: 41 },
      { id: 42 },
      { id: 43 },
      { id: 44 },
      { id: 45 },
      { id: 46 },
      { id: 47 },
      { id: 48 },
      { id: 49 },
      { id: 50 },
      { id: 51 },
      { id: 52 },
      { id: 53 },
      { id: 54 },
      { id: 55 },
      { id: 56 },
      { id: 57 },
      { id: 58 },
      { id: 59 },
      { id: 60 },
      { id: 61 },
      { id: 62 },
      { id: 63 },
      { id: 64 },
      { id: 65 },
      { id: 66 },
      { id: 67 },
      { id: 68 },
      { id: 69 },
      { id: 70 },
      { id: 71 },
      { id: 72 },
      { id: 73 },
      { id: 74 },
      { id: 75 },
      { id: 76 },
      { id: 77 },
      { id: 78 },
      { id: 79 },
      { id: 80 },
      { id: 81 },
      { id: 82 },
      { id: 83 },
      { id: 84 },
      { id: 85 },
      { id: 86 },
      { id: 87 },
      { id: 88 },
      { id: 89 },
      { id: 90 },
      { id: 91 },
      { id: 92 },
      { id: 93 },
      { id: 94 },
      { id: 95 },
      { id: 96 },
      { id: 97 },
      { id: 98 },
      { id: 99 },
      { id: 100 }
    ];
})
moneyleashapp.controller('ItemDetailsCtrl', function ($scope, $state, $stateParams) {

    $scope.item = { id: $stateParams.itemId };

    $scope.sizechanged = function (item) {
        //$state.go('eventmenu.checkin');
    };

})

// RECURRING CONTROLLER
moneyleashapp.controller('RecurringController', function ($scope) {

})

// ACCOUNT TYPE MODAL CONTROLLER
.controller('AccountTypeModalController', function ($scope, AccountsFactory) {
    $scope.hideModal = function () {
        $scope.modalCtrl.hide();
    };
    $scope.selectAccountType = function (type) {
        $scope.currentItem.accounttype = type.name;
        $scope.modalCtrl.hide();
    };
    $scope.data = { accountType: $scope.currentItem.accounttype };
})