
angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth) {
        return $firebaseAuth(fb);
    })

    .factory('MembersFactory', function ($firebaseArray, $q) {
        var ref = fb.child("members");
        var authData = fb.getAuth();
        return {
            ref: function () {
                return ref;
            },
            getMembers: function () {
                if (authData) {
                    var members = $firebaseArray(ref);
                    return members;
                }
            },
            getMember: function () {
                if (authData) {
                    var deferred = $q.defer();
                    var memberRef = ref.child(authData.uid);
                    memberRef.once("value", function (snap) {
                        deferred.resolve(snap.val());
                    });
                    return deferred.promise;
                }
            },
        };
    })

    .factory('CategoriesFactory', function ($firebaseArray, $q) {
        var ref = {};
        var categories = {};
        var parentcategories = {};
        var categoriesByType = {};
        var categoryRef = {};
        var authData = fb.getAuth();
        return {
            getCategories: function (type) {
                ref = fb.child("membercategories").child(authData.uid).child(type).orderByChild('categoryname');
                categories = $firebaseArray(ref);
                return categories;
            },
            getParentCategories: function (type) {
                ref = fb.child("membercategories").child(authData.uid).child(type).orderByChild('categoryparent');
                parentcategories = $firebaseArray(ref);
                return parentcategories;
            },
            getCategoriesByTypeAndGroup: function (type) {
                ref = fb.child("membercategories").child(authData.uid).child(type).orderByChild('categoryparent');
                categoriesByType = $firebaseArray(ref);
                return categoriesByType;
            },
            getCategory: function (categoryid, type) {
                var deferred = $q.defer();
                ref = fb.child("membercategories").child(authData.uid).child(type).child(categoryid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getCategoryRef: function (categoryid, type) {
                categoryRef = fb.child("membercategories").child(authData.uid).child(type).child(categoryid);
                return categoryRef;
            },
        };
    })

    .factory('AccountsFactory', function ($firebaseArray, $q) {
        var ref = {};
        var accounts = {};
        var accounttypes = {};
        var transactions = {};
        var transactionsByDate = {};
        var transactionsbycategoryRef = {};
        var transactionsbypayeeRef = {};
        var accountRef = {};
        var transactionRef = {};
        var transactionsRef = {};
        var authData = fb.getAuth();
        return {
            ref: function (userid) {
                ref = fb.child("members").child(userid).child("accounts");
                return ref;
            },
            getAccounts: function () {
                ref = fb.child("memberaccounts").child(authData.uid);
                accounts = $firebaseArray(ref);
                return accounts;
            },
            getAccount: function (accountid) {
                var deferred = $q.defer();
                ref = fb.child("memberaccounts").child(authData.uid).child(accountid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getAccountRef: function (accountid) {
                accountRef = fb.child("memberaccounts").child(authData.uid).child(accountid);
                return accountRef;
            },
            getAccountTypes: function () {
                ref = fb.child("memberaccounttypes").child(authData.uid);
                accounttypes = $firebaseArray(ref);
                return accounttypes;
            },
            getTransaction: function (accountid, transactionid) {
                var deferred = $q.defer();
                ref = fb.child("membertransactions").child(authData.uid).child(accountid).child(transactionid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getTransactions: function (accountid) {
                ref = fb.child("membertransactions").child(authData.uid).child(accountid);
                transactions = $firebaseArray(ref);
                return transactions;
            },
            getTransactionsByDate: function (accountid) {
                ref = fb.child("membertransactions").child(authData.uid).child(accountid).orderByChild('date');
                transactionsByDate = $firebaseArray(ref);
                return transactionsByDate;
            },
            getTransactionRef: function (accountid, transactionid) {
                transactionRef = fb.child("membertransactions").child(authData.uid).child(accountid).child(transactionid);
                return transactionRef;
            },
            getTransactionByCategoryRef: function (categoryid, transactionid) {
                transactionsbycategoryRef = fb.child("membertransactionsbycategory").child(authData.uid).child(categoryid).child(transactionid);
                return transactionsbycategoryRef;
            },
            getTransactionByPayeeRef: function (payeeid, transactionid) {
                transactionsbypayeeRef = fb.child("membertransactionsbypayee").child(authData.uid).child(payeeid).child(transactionid);
                return transactionsbypayeeRef;
            },
            createNewAccount: function (currentItem) {
                // Create the account
                accounts.$add(currentItem).then(function (newChildRef) { });
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
                accountRef = fb.child("memberaccounts").child(authData.uid).child(accountid);
                accountRef.update(currentItem);
            },
            createTransaction: function (currentAccountId, currentItem) {
                //
                var accountId = '';
                var otherAccountId = '';
                var OtherTransaction = {};
                //
                if (currentItem.istransfer) {
                    angular.copy(currentItem, OtherTransaction);
                    if (currentAccountId === currentItem.accountToId) {
                        //For current account: transfer is coming into the current account as an income
                        currentItem.type = 'Income';
                        accountId = currentItem.accountToId;
                        otherAccountId = currentItem.accountFromId;
                        OtherTransaction.type = 'Expense';
                    } else {
                        //For current account: transfer is moving into the other account as an expense
                        currentItem.type = 'Expense';
                        accountId = currentItem.accountFromId;
                        otherAccountId = currentItem.accountToId;
                        OtherTransaction.type = 'Income';
                    }
                } else {
                    accountId = currentAccountId;
                }
                //
                // Save transaction
                //
                var ref = fb.child("membertransactions").child(authData.uid).child(accountId);
                var newChildRef = ref.push(currentItem);
                newChildRef.setWithPriority(currentItem, -1 * currentItem.date);
                //
                // Save transaction under category
                //
                var categoryTransactionRef = fb.child("membertransactionsbycategory").child(authData.uid).child(currentItem.categoryid).child(newChildRef.key());
                var categoryTransaction = {
                    payee: currentItem.payee,
                    amount: currentItem.amount,
                    date: currentItem.date,
                    type: currentItem.type,
                    iscleared: currentItem.iscleared
                };
                categoryTransactionRef.update(categoryTransaction);
                //
                // Save transaction under payee
                //
                var payeeTransactionRef = fb.child("membertransactionsbypayee").child(authData.uid).child(currentItem.payeeid).child(newChildRef.key());
                var payeeTransaction = {
                    payee: currentItem.payee,
                    amount: currentItem.amount,
                    date: currentItem.date,
                    type: currentItem.type,
                    iscleared: currentItem.iscleared
                };
                payeeTransactionRef.update(payeeTransaction);
                //
                // Save payee-category relationship
                //
                var payeeRef = fb.child("memberpayees").child(authData.uid).child(currentItem.payeeid);
                var payee = {
                    lastamount: currentItem.amount,
                    lastcategory: currentItem.category,
                    lastcategoryid: currentItem.categoryid
                };
                payeeRef.update(payee);

                if (currentItem.istransfer) {
                    //
                    // Save the other transaction, get the transaction id and link it to this transaction
                    //
                    OtherTransaction.linkedtransactionid = newChildRef.key();
                    var othertransRef = fb.child("membertransactions").child(authData.uid).child(otherAccountId);
                    var sync = $firebaseArray(othertransRef);
                    sync.$add(OtherTransaction).then(function (otherChildRef) {
                        //
                        // Update this transaction with other transaction id
                        newChildRef.update({ linkedtransactionid: otherChildRef.key() })
                        //
                    });
                }
            },
            deleteTransaction: function (accountid, transactionid) {
                transactionRef = fb.child("membertransactions").child(authData.uid).child(accountid).child(transactionid);
                transactionRef.remove();
            }
        };
    })

    .factory('PayeesService', function ($firebaseArray, $q) {
        var ref = {};
        var payees = {};
        var payeeRef = {};
        var transactionsByPayeeRef = {};
        var transactionsByCategoryRef = {};
        var authData = fb.getAuth();
        return {
            getPayees: function () {
                ref = fb.child("memberpayees").child(authData.uid).orderByChild('payeename');
                payees = $firebaseArray(ref);
                return payees;
            },
            getTransactionsByPayee: function (payeeid) {
                ref = fb.child("membertransactionsbypayee").child(authData.uid).child(payeeid);
                transactionsByPayeeRef = $firebaseArray(ref);
                return transactionsByPayeeRef;
            },
            getTransactionsByCategory: function (categoryid) {
                ref = fb.child("membertransactionsbycategory").child(authData.uid).child(categoryid);
                transactionsByCategoryRef = $firebaseArray(ref);
                return transactionsByCategoryRef;
            },
            getPayeeRef: function (payeeid) {
                payeeRef = fb.child("memberpayees").child(authData.uid).child(payeeid);
                return payeeRef;
            },
        };
    })

    .factory('PayeesFactory', function ($firebaseArray, $q, $timeout) {
        var ref = {};
        var payees = {};
        var authData = fb.getAuth();
        ref = fb.child("memberpayees").child(authData.uid).orderByChild('payeename');
        payees = $firebaseArray(ref);
        var searchPayees = function (searchFilter) {
            //console.log(searchFilter);
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

    // Current User
    .service("CurrentUserService", function () {
        var thisUser = this;
        thisUser.updateUser = function (user) {
            this.firstname = user.firstname;
            this.lastname = user.lastname;
            this.email = user.email;
            this.paymentplan = user.paymentplan;
        }
    })

    // Account Pick Lists
    .service("PickAccountServices", function () {
        var accountName = this;
        var accountAmount = this;
        var accountDate = this;
        var accountType = this;
        accountName.updateAccountName = function (value) {
            this.nameSelected = value;
        }
        accountAmount.updateAmount = function (value) {
            this.amountSelected = value;
        }
        accountDate.updateDate = function (value) {
            this.dateSelected = value;
        }
        accountType.updateType = function (value) {
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
        transactionType.updateType = function (value, type) {
            this.typeDisplaySelected = value;
            this.typeInternalSelected = type;
        }
        transCategory.updateCategory = function (value, id) {
            this.categorySelected = value;
            this.categoryid = id;
        }
        transPayee.updatePayee = function (payee, id) {
            this.payeeSelected = payee.payeename;
            this.categorySelected = payee.lastcategory;
            this.categoryid = payee.lastcategoryid;
            this.amountSelected = payee.lastamount;
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