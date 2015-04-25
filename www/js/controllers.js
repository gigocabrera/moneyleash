
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
moneyleashapp.controller("LoginController", function ($scope, $rootScope, $state, Auth) {

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
            console.log(authData);
            $rootScope.hide();
            $state.go('app.dashboard');
        }).catch(function (error) {
            $rootScope.hide();
            $rootScope.notify('Error', 'Email or Password is incorrect!');
        });
    }
})

//SIGN UP CONTROLLER
moneyleashapp.controller('RegisterController', function ($scope, $rootScope, $state, $firebase, $firebaseAuth) {

    $scope.user = {};

    $scope.goToLogIn = function () {
        $state.go('login');
    };

    $scope.doSignUp22 = function(username, password) {
        var fbAuth = $firebaseAuth(fireRef);
        fbAuth.$createUser({email: username, password: password}).then(function() {
            return fbAuth.$authWithPassword({
                email: username,
                password: password
            });
        }).then(function(authData) {
            $state.go('app.dashboard');
        }).catch(function(error) {
            alert("ERROR " + error);
        });
    }

    $scope.register = function (user) {
        var firstname = user.firstname;
        var lastname = user.lastname;
        var email = user.email;
        var password = user.password;

        if (!firstname || !lastname || !email || !password) {
            console.log(firstname);
            console.log(lastname);
            console.log(email);
            console.log(password);
            $rootScope.notify("Please enter valid credentials");
            return false;
        }

        $rootScope.show('Registering...');

        var auth = $firebaseAuth(fb);
        auth.$createUser({ email: email, password: password }).then(function () {
            console.log("User created successfully!");
            return auth.$authWithPassword({
                email: email,
                password: password
            });
        }).then(function (authData) {
            $rootScope.hide();
            $state.go('app.dashboard');
        }).catch(function (error) {
            if (error.code == 'INVALID_EMAIL') {
                $rootScope.hide();
                $rootScope.notify('Error', 'Invalid Email.');
            }
            else if (error.code == 'EMAIL_TAKEN') {
                $rootScope.hide();
                $rootScope.notify('Error', 'Email already taken.');
            }
            else {
                $rootScope.hide();
                $rootScope.notify('Error', 'Oops. Something went wrong.');
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
    };
})

// DASHBOARD CONTROLLER
moneyleashapp.controller('DashboardCtrl', function ($scope) {
    
})

// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountsController', function ($scope, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseObject) {

    $scope.inEditMode = false;
    $scope.editingAccountIndex = 0;

    $scope.currentAccount = {
        AccountName: "",
        StartBalance: "",
        OpenDate: "",
        AccountType: ""
    };

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.enableSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
    };
    $scope.sortThisAccount = function (account, fromIndex, toIndex) {
        $scope.data.accounts.splice(fromIndex, 1);
        $scope.data.accounts.splice(toIndex, 0, account);
    };

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.closeSwipeOptions = function ($event) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $state.go('account');
        }
    };

    // EDIT
    $scope.editAccount = function (index) {
        $ionicListDelegate.closeOptionButtons();
        $scope.inEditMode = true;
        $scope.editingAccountIndex = index;
        $scope.currentAccount = $scope.data.accounts[index];
        $scope.myTitle = "Edit " + $scope.currentAccount.AccountName;
        $scope.modal.show();
    };

    // LIST
    $scope.list = function () {
        $rootScope.show('');
        fbAuth = fb.getAuth();
        if (fbAuth) {
            var syncObject = $firebaseObject(fb.child("users/" + fbAuth.uid));
            syncObject.$bindTo($scope, "data");
        }
        $rootScope.hide();
    }

    // SAVE
    $scope.SaveAccount = function (account, isEditMode) {
        if (isEditMode) {
            $scope.data.accounts[$scope.editingAccountIndex] = $scope.currentAccount;
            $scope.currentContact = {};
            $scope.inEditMode = false;
        } else {
            if ($scope.data.hasOwnProperty("accounts") !== true) {
                $scope.data.accounts = [];
            }
            $scope.data.accounts.push({ 'AccountName': account.AccountName, 'StartBalance': account.StartBalance, 'OpenDate': account.OpenDate, 'AccountType': account.AccountType });
        }
        $scope.currentAccount = {};
        $scope.modal.hide();
    }

    // ACCOUNT SAVE - MODAL 
    $ionicModal.fromTemplateUrl('templates/accountsave.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal
    })

    $scope.openAccountSave = function (title) {
        $scope.myTitle = title + " Account";
        //$scope.currentAccount.AccountName = "";
        //$scope.currentAccount.StartBalance = "";
        //$scope.currentAccount.OpenDate = "";
        //$scope.currentAccount.AccountType = "";
        $scope.currentAccount = {};
        $scope.modal.show();
    }

    $scope.closeModal = function () {
        $scope.modal.hide();
    };

    // DELETE
    $scope.deleteAccount = function (account, index) {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + account.AccountName + '? This will permanently delete the account from the app.',
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
                $scope.data.accounts.splice(index, 1);
                return true;
            }
        });
    };
})

// RECURRING LIST CONTROLLER
moneyleashapp.controller('RecurringListCtrl', function ($scope) {
    
    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true

    $scope.recurringlist = [
        { title: 'Recurring1', id: 1 },
        { title: 'Recurring2', id: 2 },
        { title: 'Recurring3', id: 3 },
    ];

    $scope.addRecurringItem = function() {
        $scope.recurringlist.push({title: 'New Recurring', id: 4})
    }
})

// SETTINGS CONTROLLER
moneyleashapp.controller('SettingsController', function ($scope, $rootScope, $state, $ionicActionSheet, $translate, fireBaseData, $ionicHistory, Auth) {

    $scope.airplaneMode = true;
    $scope.wifi = false;
    $scope.bluetooth = true;
    $scope.personalHotspot = true;

    $scope.checkOpt1 = true;
    $scope.checkOpt2 = true;
    $scope.checkOpt3 = false;

    $scope.radioChoice = 'B';

    $scope.showAccountTypes = function () {
        $state.go('accounttypes');
    };

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
                $rootScope.hide();
                $state.go("intro");
            }
        });
    };

    // DELETE ALL DATA
    $scope.deleteAllData = function () {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            //Here you can add some more buttons
            // buttons: [
            // { text: '<b>Share</b> This' },
            // { text: 'Move' }
            // ],
            destructiveText: 'Delete All Data',
            titleText: 'Are you sure you want to delete ALL your DATA?',
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
                //if (fbAuth) {
                //    var accountPath = fireRef.child("users/" + fbAuth.uid);
                //    //var accountRef = new Firebase(accountPath);
                //    alert(accountPath);
                //    //accountRef.remove();
                //} else {
                //    alert("else part");
                //}
                //$state.go('login');
            }
        });
    };
})

// IMAGE PICKER CONTROLLER
moneyleashapp.controller('ImagePickerCtrl', function ($scope, $rootScope, $cordovaCamera) {

    $scope.images = [];

    $scope.selImages = function () {

        window.imagePicker.getPictures(
			function (results) {
			    for (var i = 0; i < results.length; i++) {
			        console.log('Image URI: ' + results[i]);
			        $scope.images.push(results[i]);
			    }
			    if (!$scope.$$phase) {
			        $scope.$apply();
			    }
			}, function (error) {
			    console.log('Error: ' + error);
			}
		);
    };

    $scope.removeImage = function (image) {
        $scope.images = _.without($scope.images, image);
    };

    $scope.shareImage = function (image) {
        window.plugins.socialsharing.share(null, null, image);
    };

    $scope.shareAll = function () {
        window.plugins.socialsharing.share(null, null, $scope.images);
    };
});

function escapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
}