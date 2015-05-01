angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth, $rootScope) {
        return $firebaseAuth(fb);
    })

    .factory('UserData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth, $q) {
        var ref = fb.child("members");
        return {
            ref: function () {
                return ref;
            },
            getMember: function (email) {
                var deferred = $q.defer();
                var usersRef = ref.child(escapeEmailAddress(email));
                usersRef.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            checkMemberHasGroup: function (email) {
                var deferred = $q.defer();
                var usersRef = ref.child(escapeEmailAddress(email));
                usersRef.once("value", function (snap) {
                    var user = snap.val();
                    if (user.groupid) {
                        deferred.resolve(true);
                    } else {
                        deferred.reject(false);
                    }
                });
                return deferred.promise;
            },
            getMembers: function (groupid) {
                var deferred = $q.defer();
                var output = {};
                ref.startAt(groupid)
                    .endAt(groupid)
                    .once('value', function (snap) {
                        deferred.resolve(snap.val());
                    });
                return deferred.promise;
            },
            quitGroup: function (groupid) {
                var deferred = $q.defer();
                var output = {};
                ref.startAt(groupid)
                    .endAt(groupid)
                    .once('value', function (snap) {
                        deferred.resolve(snap.val());
                    });
                return deferred.promise;
            }
        };
    })

    .factory('AccountsData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseArray, $firebaseAuth, $q) {
        var ref = fb.child("users");
        return {
            ref: function () {
                return ref;
            },
            getAccounts: function (userid) {
                var deferred = $q.defer();
                var accountRef = fb.child("users/" + userid + "/accounts/");
                accounts = $firebaseArray(accountRef);
                return deferred.promise;
            },
            getAccount: function (userid, accountid) {
                var deferred = $q.defer();
                var accountRef = fb.child("users/" + userid + "/accounts/" + accountid);
                accountRef.once("value", function (snap) {
                    var account = snap.val();
                    deferred.resolve(account);
                });
                return deferred.promise;
            },
            addAccount: function (account) {
                var deferred = $q.defer();
                var output = {};
                var sync = $firebase(fb.child("users/" + houseId + '/expenses'));
                sync.$push(expense).then(function (data) {
                    console.log();
                    deferred.resolve(data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            updateAccount: function (account, userid) {
                var sync = fb.child("users/" + userid + '/accounts/' + account.id);
                sync.update(account);
            }
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