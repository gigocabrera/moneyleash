angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth, $rootScope) {
        return $firebaseAuth(fb);
    })

    .factory('UserData', function ($firebase) {
        var ref = fb.child("users");
        return {
            ref: function () {
                return ref;
            },
        };
    })

    .factory('AccountsData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth, $q) {

        var ref = fb.child("users");

        return {

            ref: function () {
                return ref;
            },

            getAllAccounts: function (userid) {
                return $firebaseObject(ref.child(userid));
            },
        
            getAccount: function (userid, accountid) {
                
            },
        };
    })

    //.factory('AccountsData', function ($firebase, $rootScope) {

    //    var usersRef = fb.child("roommates/" + escapeEmailAddress(email));

    //    return {
    //        getAccount: function (userid, accountid) {
    //             return $firebaseObject(new Firebase(FIREBASE_URL + '/users/' + userid + '/accounts/' + accountid));
    //        },
    //        getAllAccounts: function (userid) {
    //            //return $firebaseObject(fireRef.child("users/" + userid));
    //            return fireRef.child("users/" + userid);
    //        },
    //        ref: function () {
    //            return new Firebase(FIREBASE_URL);
    //        }
    //    };
    // })

    .factory('fireBaseData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $q) {

        var currentData = {
            currentUser: false,
            currentHouse: false,
            idadmin: false
        };

        $rootScope.notify = function (title, text) {
            var alertPopup = $ionicPopup.alert({
                title: title ? title : 'Error',
                template: text
            });
        };

        $rootScope.show = function (text) {
            $rootScope.loading = $ionicLoading.show({
                template: '<ion-spinner icon="spiral"></ion-spinner><br>' + text,
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        };

        $rootScope.hide = function (text) {
            $ionicLoading.hide();
        };

        return {
            clearData: function () {
                currentData = false;
            },
        }
    })

;