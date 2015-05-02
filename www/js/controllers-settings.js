
// SETTINGS CONTROLLER
moneyleashapp.controller('SettingsController', function ($scope, $rootScope, $state, $ionicActionSheet, $translate, fireBaseData, $ionicHistory, Auth, UserData) {

    // DUMMY SETTINGS
    $scope.airplaneMode = true;
    $scope.wifi = false;
    $scope.bluetooth = true;
    $scope.personalHotspot = true;
    $scope.checkOpt1 = true;
    $scope.checkOpt2 = true;
    $scope.checkOpt3 = false;
    $scope.radioChoice = 'B';

    $scope.showPersonalProfile = function () {
        $state.go('app.personalprofile');
    };
    $scope.showGroupProfile = function () {
        //$state.go('app.groupprofile');
    };
    $scope.showAccountTypes = function () {
        $state.go('app.accounttypes');
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