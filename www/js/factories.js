angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth, $rootScope) {
        return $firebaseAuth(fb);
    })

    .factory("AccountTypes", ["$firebaseObject",
        function($firebaseObject) {
            return function(email) {
                var ref = fb.child("members/" + escapeEmailAddress(email) + "/accounttypes/");
                return $firebaseObject(ref);
            }
        }
    ])

    .factory('MembersFactory', function ($firebaseArray, $q) {
        var ref = fb.child("members");
        return {
            ref: function () {
                return ref;
            },
            getMembers: function () {
                members = $firebaseArray(ref);
                return members;
            },
            getMember: function (userid) {
                var deferred = $q.defer();
                var memberRef = ref.child(userid);
                memberRef.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
        };
    })

    .factory('AccountsFactory', function ($firebaseArray, $q) {
        var accounts = {};
        var accounttypes = {};
        return {
            ref: function (userid) {
                var ref = fb.child("members").child(userid).child("accounts");
                return ref;
            },
            getAccounts: function (userid) {
                var ref = fb.child("members").child(userid).child("accounts");
                accounts = $firebaseArray(ref);
                return accounts;
            },
            getAccount: function (userid, accountid) {
                var deferred = $q.defer();
                var ref = fb.child("members").child(userid).child("accounts").child(accountid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getAccountTypes: function (userid) {
                var ref = fb.child("members").child(userid).child("accounttypes");
                accounttypes = $firebaseArray(ref);
                return accounttypes;
            },
            getTransaction: function (userid, accountid, transactionid) {
                var deferred = $q.defer();
                var ref = fb.child("members").child(userid).child("accounts").child(accountid).child("transactions").child(transactionid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
        };
    })

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
                template: '<ion-spinner icon="ios"></ion-spinner><br>' + text,
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

            checkDuplicateEmail: function (email) {
                var deferred = $q.defer();
                var usersRef = fb.child("roommates/" + escapeEmailAddress(email));
                usersRef.once("value", function (snap) {
                    if (snap.val() === null) {
                        deferred.resolve(true);
                    } else {
                        deferred.reject('EMAIL EXIST');
                    }

                });
                return deferred.promise;
            },

            refreshData: function () {
                var output = {};
                var deferred = $q.defer();
                var authData = fb.getAuth();
                if (authData) {
                    var usersRef = fb.child("roommates/" + escapeEmailAddress(authData.password.email));
                    usersRef.once("value", function (snap) {
                        output.currentUser = snap.val();
                        var housesRef = fb.child("houses/" + output.currentUser.houseid);
                        housesRef.once("value", function (snap) {
                            output.currentHouse = snap.val();
                            output.currentHouse.id = housesRef.key();
                            output.isadmin = (output.currentHouse.admin === output.currentUser.email ? true : false);
                            deferred.resolve(output);
                        });
                    });
                } else {
                    output = currentData;
                    deferred.resolve(output);
                }
                return deferred.promise;
            }
        }

    })
;