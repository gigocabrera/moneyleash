
angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth) {
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

    .factory('CategoriesFactory', function ($firebaseArray, $q) {
        var ref = {};
        var fbAuth = fb.getAuth();
        var categories = {};
        var parentcategories = {};
        var categoriesByType = {};
        var categoryRef = {};
        return {
            getCategories: function (type) {
                ref = fb.child("membercategories").child(fbAuth.uid).child(type).orderByChild('categoryname');
                categories = $firebaseArray(ref);
                return categories;
            },
            getParentCategories: function (type) {
                ref = fb.child("membercategories").child(fbAuth.uid).child(type).orderByChild('categoryparent');
                parentcategories = $firebaseArray(ref);
                return parentcategories;
            },
            getCategoriesByTypeAndGroup: function (type) {
                ref = fb.child("membercategories").child(fbAuth.uid).child(type).orderByChild('categoryparent');
                categoriesByType = $firebaseArray(ref);
                return categoriesByType;
            },
            getCategory: function (categoryid, type) {
                var deferred = $q.defer();
                ref = fb.child("membercategories").child(fbAuth.uid).child(type).child(categoryid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getCategoryRef: function (categoryid, type) {
                categoryRef = fb.child("membercategories").child(fbAuth.uid).child(type).child(categoryid);
                return categoryRef;
            },
        };
    })

    .factory('AccountsFactory', function ($firebaseArray, $q) {
        var ref = {};
        var fbAuth = fb.getAuth();
        var accounts = {};
        var accounttypes = {};
        var transactions = {};
        var transactionsByDate = {};
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
                transactionsByDate = $firebaseArray(ref);
                return transactionsByDate;
            },
            getTransactionRef: function (accountid, transactionid) {
                transactionRef = fb.child("membertransactions").child(fbAuth.uid).child(accountid).child(transactionid);
                return transactionRef;
            },
            createNewAccount: function (currentItem) {

                // Create the account
                accounts.$add(currentItem).then(function (newChildRef) {

                    // Create initial transaction for begining balance under new account node
                    var initialTransaction = {
                        type: 'Income',
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

                //// Update transaction
                //var initialTransaction = {
                //    amount: currentItem.balancebegining,
                //    date: dtOpen
                //};
                //var initialTransRef = fb.child("membertransactions").child(fbAuth.uid).child(accountid).child(currentItem.transactionid);
                //initialTransRef.update(initialTransaction);
            },
            createTransaction: function (currentItem, accountId) {
                var transRef = fb.child("membertransactions").child(fbAuth.uid).child(accountId);
                var sync = $firebaseArray(transRef);
                sync.$add(currentItem).then(function (newChildRef) {
                });
            },
            deleteTransaction: function (accountid, transactionid) {
                transactionRef = fb.child("membertransactions").child(fbAuth.uid).child(accountid).child(transactionid);
                transactionRef.remove();
            }
        };
    })

    .factory('PayeesService', function ($firebaseArray, $q) {
        var ref = {};
        var fbAuth = fb.getAuth();
        var payees = {};
        return {
            getPayees: function () {
                ref = fb.child("memberpayees").child(fbAuth.uid).orderByChild('payeename');
                payees = $firebaseArray(ref);
                return payees;
            },
        };
    })

    .factory('PayeesFactory', function ($firebaseArray, $q, $timeout) {
        var ref = {};
        var payees = {};
        var fbAuth = fb.getAuth();
        ref = fb.child("memberpayees").child(fbAuth.uid).orderByChild('payeename');
        payees = $firebaseArray(ref);
        var searchPayees = function (searchFilter) {
            //console.log('Searching airlines for ' + searchFilter);
            var deferred = $q.defer();
            var matches = payees.filter(function (payee) {
                if (payee.payeename.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) return true;
            })
            $timeout(function () {
                deferred.resolve(matches);
            }, 100);
            return deferred.promise;
        };
        return {
            searchPayees: searchPayees
        }
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
        $rootScope.hide = function () {
            $ionicLoading.hide();
        };
        return {

            clearData: function () {
                currentData = false;
            },
        }
    })

    .service("CategoryTypeService", function () {
        var cattype = this;
        cattype.updateType = function (value) {
            this.typeSelected = value;
        }
    })

    .service("PickParentCategoryService", function () {
        var cat = this;
        cat.updateParentCategory = function (value) {
            this.parentcategorySelected = value;
        }
    })
    .service("PickCategoryTypeService", function () {
        var type = this;
        type.updateType = function (value) {
            this.typeSelected = value;
        }
    })

    // Transaction Pick Lists
    .service("PickTransactionServices", function () {
        var transactionType = this;
        var transCategory = this;
        var transPayee = this;
        var transDate = this;
        var transAmount = this;
        var transAccountFrom = this;
        var transAccountTo = this;
        transactionType.updateType = function (value) {
            this.typeSelected = value;
        }
        transCategory.updateCategory = function (value, id) {
            this.categorySelected = value;
            this.categoryid = id;
        }
        transPayee.updatePayee = function (value, id) {
            this.payeeSelected = value;
            this.payeeid = id;
        }
        transDate.updateDate = function (value) {
            this.dateSelected = value;
        }
        transAmount.updateAmount = function (value) {
            this.amountSelected = value;
        }
        transAccountFrom.updateAccountFrom = function (value, id) {
            this.accountFromSelected = value;
            this.accountFromId = id;
        }
        transAccountTo.updateAccountTo = function (value, id) {
            this.accountToSelected = value;
            this.accountToId = id;
        }
    })

;