
var moneyleashapp = angular.module('moneyleash.controllers', [])

// APP CONTROLLER : SIDE MENU
moneyleashapp.controller('AppCtrl', function ($scope, $state, $ionicActionSheet, $ionicHistory, MembersFactory) {

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
                var myButton = index;
                return true;
            },
            destructiveButtonClicked: function () {
                //Called when the destructive button is clicked.
                //Return true to close the action sheet, or false to keep it opened.
                $ionicHistory.clearCache();
                fb.unauth();
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
moneyleashapp.controller('IntroController', function ($scope, $state, $ionicHistory) {
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
moneyleashapp.controller("LoginController", function ($scope, $ionicLoading, $ionicPopup, $state, CurrentUserService) {

    //$scope.user = {email: 'gigo@test.com', password: '123'};
    $scope.user = {};
    $scope.notify = function (title, text) {
        $ionicPopup.alert({
            title: title ? title : 'Error',
            template: text
        });
    };

    $scope.doLogIn = function (user) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br>Loggin In...'
        });

        /* Check user fields*/
        if (!user.email || !user.password) {
            $ionicLoading.hide();
            $scope.notify('Oops', 'Please check your Email or Password!');
            return;
        }

        /* All good, let's authentify */
        var ref = new Firebase("https://brilliant-inferno-1044.firebaseio.com");
        ref.authWithPassword({
            "email": user.email,
            "password": user.password
        }, function (error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                $ionicLoading.hide();
                $state.go('app.dashboard');
            }
        });
    }
})

//REGISTER CONTROLLER
moneyleashapp.controller('RegisterController', function ($scope, $state, $ionicLoading, $firebase, $firebaseArray, MembersFactory) {

    $scope.user = {};

    $scope.goToLogIn = function () {
        $state.go('login');
    };

    $scope.createMember = function (user) {
        var firstname = user.firstname;
        var lastname = user.lastname;
        var email = user.email;
        var password = user.password;

        // Validate form data
        if (typeof user.firstname === 'undefined' || user.firstname === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter your first name"
            return;
        }
        if (typeof user.lastname === 'undefined' || user.lastname === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter your last name"
            return;
        }
        if (typeof user.email === 'undefined' || user.email === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter your email"
            return;
        }
        if (typeof user.password === 'undefined' || user.password === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter your password"
            return;
        }

        $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br>Registering...'
        });

        fb.createUser({
            email: email,
            password: password
        }, function (error, userData) {
            if (error) {
                switch (error.code) {
                    case "EMAIL_TAKEN":
                        $ionicLoading.hide();
                        $scope.hideValidationMessage = false;
                        $scope.validationMessage = "The email entered is already in use"
                        break;
                    case "INVALID_EMAIL":
                        $ionicLoading.hide();
                        $scope.hideValidationMessage = false;
                        $scope.validationMessage = "The specified email is not a valid email"
                        break;
                    default:
                        $ionicLoading.hide();
                        $scope.hideValidationMessage = false;
                        $scope.validationMessage = "Oops. Something went wrong"
                }
            } else {

                fb.authWithPassword({
                    "email": email,
                    "password": password
                }, function (error, authData) {
                    if (error) {
                        $ionicLoading.hide();
                        $scope.hideValidationMessage = false;
                        $scope.validationMessage = "Error. Login failed!"
                    } else {

                        /* PREPARE DATA FOR FIREBASE*/
                        $scope.temp = {
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            groupid: 0,
                            paymentplan: 'FREE',
                            datecreated: Date.now(),
                            dateupdated: Date.now()
                        }

                        /* SAVE MEMBER DATA */
                        var membersref = MembersFactory.ref();
                        var newUser = membersref.child(authData.uid);
                        newUser.update($scope.temp, function (ref) {
                            //console.log("user created");
                        });

                        /* SAVE DEFAULT ACCOUNT TYPES DATA FOR THIS MEMBER */
                        var ref = fb.child("memberaccounttypes").child(authData.uid);
                        ref.push({ name: 'Checking', icon: '0' });
                        ref.push({ name: 'Savings', icon: '0' });
                        ref.push({ name: 'Credit Card', icon: '0' });
                        ref.push({ name: 'Debit Card', icon: '0' });
                        ref.push({ name: 'Investment', icon: '0' });
                        ref.push({ name: 'Brokerage', icon: '0' });
                        ref.push({ name: 'Checking', icon: '0' });
                        
                        $ionicLoading.hide();
                        $state.go('app.dashboard');
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
moneyleashapp.controller('DashboardController', function ($scope, $state, $stateParams, CurrentUserService) {
    
    //// Load global user settings
    //MembersFactory.getMember().then(function (user) {
    //    CurrentUserService.updateUser(user);
    //    $scope.displayname = CurrentUserService.firstname;
    //});

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
      { id: 50 }
    ];
})

// Sample code - to be removed when going live
moneyleashapp.controller('ItemDetailsCtrl', function ($scope, $state, $stateParams) {
    $scope.item = { id: $stateParams.itemId };
    $scope.sizechanged = function (item) {
        var test = item;
        //$state.go('eventmenu.checkin');
    };
})

// RECURRING CONTROLLER
moneyleashapp.controller('RecurringController', function ($scope) {
    $scope.temp = '';
})

// ACCOUNT TYPE MODAL CONTROLLER
.controller('AccountTypeModalController', function ($scope) {
    $scope.hideModal = function () {
        $scope.modalCtrl.hide();
    };
    $scope.selectAccountType = function (type) {
        $scope.currentItem.accounttype = type.name;
        $scope.modalCtrl.hide();
    };
    $scope.data = { accountType: $scope.currentItem.accounttype };
})