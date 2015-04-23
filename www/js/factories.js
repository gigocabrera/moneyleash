angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth, $rootScope) {
        return $firebaseAuth(fb);
    })

    .constant('FIREBASE_URL', 'https://brilliant-inferno-1044.firebaseio.com')

     .factory('AccountsFactory', function ($firebaseObject, FIREBASE_URL) {
         return {
             getAccount: function (userid, accountid) {
                 return $firebaseObject(new Firebase(FIREBASE_URL + '/users/' + userid + '/accounts/' + accountid));
             },
             getAllAccounts: function (userid) {
                 //return $firebaseObject(fireRef.child("users/" + userid));
                 return fireRef.child("users/" + userid);
             },
             ref: function () {
                 return new Firebase(FIREBASE_URL);
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
                template: '<i class="icon ion-load-c"></i><br>' + text,
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

    .factory('HouseData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth, $q) {

        var ref = fb.child("houses");

        return {

            ref: function () {
                return ref;
            },

            getHouse: function (email) {
                var deferred = $q.defer();
                var usersRef = ref.child(escapeEmailAddress(email));
                usersRef.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },

            getHouseByCode: function (code) {
                var deferred = $q.defer();
                ref.orderByChild("join_code").startAt(code)
                    .endAt(code)
                    .once('value', function (snap) {
                        if (snap.val()) {
                            var house, houseid;
                            angular.forEach(snap.val(), function (value, key) {
                                house = value;
                                houseid = key;
                            });
                            if (house.join_code === code) {
                                deferred.resolve(houseid);
                            }
                        }
                    }, function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                    });
                return deferred.promise;
            },

            getHouses: function (id) {
                var deferred = $q.defer();
                var output = {};
                ref.once('value', function (snap) {
                    console.log(snap.val());
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },

            randomHouseCode: function () {
                return Math.floor((Math.random() * 100000000) + 100);
            }
        };
    })

    .factory('UserData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth, $q) {

        var ref = fb.child("roommates");

        return {

            ref: function () {
                return ref;
            },

            getRoomMate: function (email) {
                var deferred = $q.defer();
                var usersRef = ref.child(escapeEmailAddress(email));
                usersRef.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },

            checkRoomMateHasHouse: function (email) {
                var deferred = $q.defer();
                var usersRef = ref.child(escapeEmailAddress(email));
                usersRef.once("value", function (snap) {
                    var user = snap.val();
                    if (user.houseid) {
                        deferred.resolve(true);
                    } else {
                        deferred.reject(false);
                    }
                });
                return deferred.promise;
            },

            getRoomMates: function (houseid) {
                var deferred = $q.defer();
                var output = {};
                ref.startAt(houseid)
                    .endAt(houseid)
                    .once('value', function (snap) {
                        deferred.resolve(snap.val());
                    });
                return deferred.promise;
            },

            quitHouse: function (houseid) {
                var deferred = $q.defer();
                var output = {};
                ref.startAt(houseid)
                    .endAt(houseid)
                    .once('value', function (snap) {
                        deferred.resolve(snap.val());
                    });
                return deferred.promise;
            }
        };
    })

    .factory('ExpensesData', function ($firebase, $rootScope, $firebaseAuth, $q, UserData, fireBaseData) {

        var expenses = {};

        /* Filter Vars */
        var filter = 'all',
            startTime = '0000000000',
            endTime = 0;

        return {

            all: function () {
                return expenses;
            },

            getExpenses: function (houseId, filter) {
                var deferred = $q.defer();
                var expensesRef = fb.child("houses/" + houseId + '/expenses');
                expenses = $firebase(expensesRef).$asArray();
                expenses.$loaded().then(function () {
                    angular.forEach(expenses, function (value, key) {
                        UserData.getRoomMate(expenses[key].user).then(function (user) {
                            expenses[key].user = user.firstname + " " + user.surname;
                        });
                    });

                    deferred.resolve(expenses);
                });
                return deferred.promise;

            },

            getExpense: function (expenseId) {
                var deferred = $q.defer();
                var usersRef = fb.child("houses/" + fireBaseData.currentData.currentHouse.id + "/expenses/" + expenseId);
                usersRef.once("value", function (snap) {
                    var expense = snap.val();
                    deferred.resolve(expense);
                });
                return deferred.promise;
            },

            addExpense: function (expense, houseId) {
                var deferred = $q.defer();
                var output = {};

                var sync = $firebase(fb.child("houses/" + houseId + '/expenses'));
                sync.$push(expense).then(function (data) {
                    console.log();
                    deferred.resolve(data);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        }
    })

;