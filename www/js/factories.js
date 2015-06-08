
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
                var members = $firebaseArray(ref);
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
        var transactionRef = {};
        var transactionsRef = {};
        return {
            ref: function (userid) {
                ref = fb.child("members").child(userid).child("accounts");
                return ref;
            },
            getAccounts: function () {
                ref = fb.child("memberaccounts").child(fbAuth.uid);
                accounts = $firebaseArray(ref);
                return accounts;
            },
            getAccount: function (accountid) {
                var deferred = $q.defer();
                ref = fb.child("memberaccounts").child(fbAuth.uid).child(accountid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getAccountRef: function (accountid) {
                accountRef = fb.child("memberaccounts").child(fbAuth.uid).child(accountid);
                return accountRef;
            },
            getAccountTypes: function () {
                ref = fb.child("memberaccounttypes").child(fbAuth.uid);
                accounttypes = $firebaseArray(ref);
                return accounttypes;
            },
            getTransaction: function (accountid, transactionid) {
                var deferred = $q.defer();
                ref = fb.child("membertransactions").child(fbAuth.uid).child(accountid).child(transactionid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getTransactions: function (accountid) {
                ref = fb.child("membertransactions").child(fbAuth.uid).child(accountid);
                transactions = $firebaseArray(ref);
                return transactions;
            },
            getTransactionsByDate: function (accountid) {
                ref = fb.child("membertransactions").child(fbAuth.uid).child(accountid).orderByChild('date');
                transactions = $firebaseArray(ref);
                return transactions;
            },
            getTransactionRef: function (accountid, transactionid) {
                transactionRef = fb.child("membertransactions").child(fbAuth.uid).child(accountid).child(transactionid);
                return transactionRef;
            },
            //getTransactionsRef: function (accountid, transactionid) {
            //    transactionsRef = fb.child("membertransactions").child(fbAuth.uid);
            //    return transactionsRef;
            //},
            createNewAccount: function (currentItem) {

                // Create the account
                accounts.$add(currentItem).then(function (newChildRef) {

                    // Create initial transaction for begining balance under new account node
                    var initialTransaction = {
                        type: 'income',
                        payee: 'Begining Balance',
                        category: 'Begining Balance',
                        amount: currentItem.balancebegining,
                        date: currentItem.dateopen,
                        notes: '',
                        photo: '',
                        iscleared: 'false',
                        isrecurring: 'false'
                    };
                    if (currentItem.autoclear.checked) {
                        initialTransaction.iscleared = 'true';
                    }
                    var ref = fb.child("membertransactions").child(fbAuth.uid).child(newChildRef.key());
                    ref.push(initialTransaction);

                    // Update account with transaction id
                    newChildRef.update({ transactionid: ref.key() })
                });
            },
            updateAccount: function (accountid, currentItem) {
                var dtOpen = new Date(currentItem.dateopen);
                if (isNaN(dtOpen)) {
                    currentItem.dateopen = "";
                } else {
                    dtOpen = +dtOpen;
                    currentItem.dateopen = dtOpen;
                }
                // Update account
                accountRef = fb.child("memberaccounts").child(fbAuth.uid).child(accountid);
                accountRef.update(currentItem);

                // Update transaction
                var initialTransaction = {
                    amount: currentItem.balancebegining,
                    date: dtOpen
                };
                var initialTransRef = fb.child("membertransactions").child(fbAuth.uid).child(accountid).child(currentItem.transactionid);
                initialTransRef.update(initialTransaction);
            },
            deleteTransaction: function (accountid, transactionid) {
                transactionRef = fb.child("membertransactions").child(fbAuth.uid).child(accountid).child(transactionid);
                transactionRef.remove();
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
            $ionicPopup.alert({
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