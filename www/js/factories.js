
angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth, $rootScope) {
        return $firebaseAuth(fb);
    })

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

    .factory("AccountWithBalance", ["$firebaseArray",
        function($firebaseArray) {
            var AccountWithBalance = $firebaseArray.$extend({
                getBalance: function() {
                    var balance = 0;
                    // the array data is located in this.$list
                    angular.forEach(this.$list, function(rec) {
                        balance += rec.startbalance;
                    });
                    return balance;
                }
            });
            return function(listRef) {
                return new AccountWithBalance(listRef);
            }
        }
    ])

    .factory('AccountsFactory', function ($firebaseArray, $q) {
        var ref = {};
        var fbAuth = fb.getAuth();
        var accounts = {};
        var accounttypes = {};
        var transactions = {};
        var accountsRef = {};
        var accountRef = {};
        var networth = {};
        var transRef = {};
        return {
            ref: function (userid) {
                ref = fb.child("members").child(userid).child("accounts");
                return ref;
            },
            getAccounts: function () {
                ref = fb.child("members").child(fbAuth.uid).child("accounts");
                accounts = $firebaseArray(ref);
                return accounts;
            },
            getAccount: function (accountid) {
                var deferred = $q.defer();
                ref = fb.child("members").child(fbAuth.uid).child("accounts").child(accountid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getAccountsRef: function (accountid) {
                accountsRef = fb.child("members").child(fbAuth.uid).child("accounts");
                return accountsRef;
            },
            getAccountRef: function (accountid) {
                accountRef = fb.child("members").child(fbAuth.uid).child("accounts").child(accountid);
                return accountRef;
            },
            getAccountTypes: function () {
                ref = fb.child("members").child(fbAuth.uid).child("accounttypes");
                accounttypes = $firebaseArray(ref);
                return accounttypes;
            },
            getTransaction: function (accountid, transactionid) {
                var deferred = $q.defer();
                ref = fb.child("members").child(fbAuth.uid).child("accounts").child(accountid).child("transactions").child(transactionid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getTransactions: function (accountid) {
                ref = fb.child("members").child(fbAuth.uid).child("accounts").child(accountid).child("transactions");
                transactions = $firebaseArray(ref);
                return transactions;
            },
            getTransactionsByDate: function (accountid) {
                ref = fb.child("members").child(fbAuth.uid).child("accounts").child(accountid).child("transactions").orderByChild('date');
                transactions = $firebaseArray(ref);
                return transactions;
            },
            getTransactionRef: function (accountid, transactionId) {
                transRef = fb.child("members").child(fbAuth.uid).child("accounts").child(accountid).child("transactions").child(transactionId);
                return transRef;
            },
            getNetWorth: function() {
                return networth;
            }
        };
    })

    .factory('fireBaseData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $q) {

        var currentData = {
            currentUser: false,
            currentGroup: false,
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
        }
    })
;