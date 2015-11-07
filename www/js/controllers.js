
var moneyleashapp = angular.module('moneyleash.controllers', [])

// APP CONTROLLER : SIDE MENU
moneyleashapp.controller('AppCtrl', function ($scope, $state, $rootScope, $ionicActionSheet, $ionicHistory, $cordovaAppVersion) {

    $scope.showMenuIcon = true;
    $scope.appversion = '';
    
    document.addEventListener("deviceready", function () {

    $cordovaAppVersion.getVersionNumber().then(function (version) {
            $scope.appversion = version;
        });
    }, false);

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
                $rootScope.authData = '';
                fb.unauth();
                $state.go('login');
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
moneyleashapp.controller('IntroController', function ($scope, $rootScope, $state, $ionicHistory) {

    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    $rootScope.authData = '';
    fb.unauth();

    $scope.hideBackButton = true;
    $scope.login = function () {
        $state.go('login');
    };
    $scope.register = function () {
        $state.go('register');
    };

})

// LOGIN CONTROLLER
moneyleashapp.controller("LoginController", function ($scope, $rootScope, $ionicLoading, $ionicPopup, $state, MembersFactory, myCache, CurrentUserService, $cordovaDialogs) {

    $scope.user = {};
    $scope.doLogIn = function (user) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br>Loggin In...'
        });

        /* Check user fields*/
        if (!user.email || !user.password) {
            $ionicLoading.hide();
            $cordovaDialogs.alert('Please check your Email or Password!', 'Login Failed', 'Ok')
            return;
        }

        /* Authenticate User */
        var ref = new Firebase("https://brilliant-inferno-1044.firebaseio.com");
        ref.authWithPassword({
            "email": user.email,
            "password": user.password
        }, function (error, authData) {
            if (error) {
                //console.log("Login Failed!", error);
                $ionicLoading.hide();
                $cordovaDialogs.alert('Check your credentials and try again', 'Login Failed', 'Ok')
                    .then(function() {
                    // callback success
                });
            } else {
                
                MembersFactory.getMember(authData).then(function (thisuser) {
                    
                    /* Save user data for later use */
                    myCache.put('thisHouseId', thisuser.houseid);
                    myCache.put('thisUserName', thisuser.firstname);
                    CurrentUserService.updateUser(thisuser);

                    if (thisuser.houseid === '') {
                        $ionicLoading.hide();
                        $state.go('housechoice');
                    } else {
                        $ionicLoading.hide();
                        $state.go('app.accounts');
                    }
                });
            }
        });
    }
})

// AUTO-LOGIN CONTROLLER
moneyleashapp.controller("AutoLoginController", function ($scope, $rootScope, $ionicLoading, $ionicPopup, $state, $localStorage, MembersFactory, myCache, CurrentUserService, $cordovaDialogs) {

    $scope.autologin = function () {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios"></ion-spinner><br>Loggin In...'
        });

        /* Authenticate User */
        var ref = new Firebase("https://brilliant-inferno-1044.firebaseio.com");
        ref.authWithPassword({
            "email": $localStorage.email,
            "password": $localStorage.password
        }, function (error, authData) {
            if (error) {
                //console.log("Login Failed!", error);
                $ionicLoading.hide();
                $cordovaDialogs.alert('Check your credentials and try again', 'Login Failed', 'Ok')
                    .then(function () {
                        $state.go('login');
                    });
            } else {

                MembersFactory.getMember(authData).then(function (thisuser) {

                    /* Save user data for later use */
                    myCache.put('thisHouseId', thisuser.houseid);
                    myCache.put('thisUserName', thisuser.firstname);
                    CurrentUserService.updateUser(thisuser);

                    if (thisuser.houseid === '') {
                        $ionicLoading.hide();
                        $state.go('housechoice');
                    } else {
                        $ionicLoading.hide();
                        $state.go('app.accounts');
                    }
                });
            }
        });
    }
})

//REGISTER CONTROLLER
moneyleashapp.controller('RegisterController', function ($scope, $state, $ionicLoading, MembersFactory) {

    $scope.user = {};
    $scope.goToLogIn = function () {
        $state.go('login');
    };

    $scope.createMember = function (user) {
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
                            houseid: 0,
                            paymentplan: 'Free',
                            datecreated: Date.now(),
                            dateupdated: Date.now()
                        }

                        /* SAVE MEMBER DATA */
                        var membersref = MembersFactory.ref();
                        var newUser = membersref.child(authData.uid);
                        newUser.update($scope.temp, function (ref) {
                            //console.log(newUser);
                        });

                        $ionicLoading.hide();
                        $state.go('housechoice');
                    }
                });
            }
        });
    };

})

// HOUSE CONTROLLER
.controller('HouseChoiceController', function ($scope, $ionicHistory) {

    /* Clear the history stack to prevent going back to login view again */
    $ionicHistory.clearHistory();

})
.controller('HouseCreateController', function ($scope, $state, HouseFactory) {

    $scope.hideValidationMessage = true;
    $scope.house = {
        name: '',
        number: ''
    };

    $scope.saveHouse = function (house) {

        var house_name = house.name;
        var house_number = house.number;

        /* VALIDATE DATA */
        if (!house_name) {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter a name for this house"
            return;
        }
        if (!house_number) {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter a unique number for this house"
            return;
        }
        $scope.hideValidationMessage = true;
        //
        // Create House
        //
        HouseFactory.createHouse(house);
        $state.go('app.accounts');
    };
})
.controller('HouseJoinController', function ($scope, $state, HouseFactory) {

    $scope.hideValidationMessage = true;
    $scope.house = {
        houseid: ''
    };

    $scope.joinHouse = function (house) {
        //
        // Join House
        //
        var house_code = house.houseid;

        /* VALIDATE DATA */
        if (!house_code) {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter the house code you want to join"
            return;
        }
        HouseFactory.getHouseByCode(house_code).then(function (value) {
            if (value) {
                HouseFactory.joinHouse(value);
                $state.go('app.accounts');
            }
        });
    };
})

// FORGOT PASSWORD CONTROLLER
moneyleashapp.controller('ForgotPasswordCtrl', function ($scope, $state) {

    $scope.user = {};

    $scope.recoverPassword = function (user) {
        //$state.go('accounts');
        console.log(user.email);
    };

    $scope.login = function () {
        $state.go('login');
    };

    $scope.register = function () {
        $state.go('register');
    }
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