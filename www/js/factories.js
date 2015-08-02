
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

    .factory('fireBaseData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $q) {
        //
        // https://github.com/oriongunning/myExpenses
        //
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
                template: '<i class="icon ion-looping"></i><br>' + text,
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
            refreshData: function () {
                var output = {};
                var deferred = $q.defer();
                var authData = fb.getAuth();
                if (authData) {
                    var usersRef = fb.child("members").child(authData.uid);
                    usersRef.once("value", function (snap) {
                        output.currentUser = snap.val();
                        var housesRef = fb.child("houses").child(output.currentUser.houseid);
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

    .factory('HouseFactory', function ($state, $q) {
        //
        // https://github.com/oriongunning/myExpenses
        //
        var authData = fb.getAuth();
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
            joinHouse: function (id) {
                var temp = {
                    houseid: id
                }
                var memberRef = fb.child("members").child(authData.uid);
                memberRef.update(temp);
                memberRef.setPriority(id);
            },
            createHouse: function (house) {

                /* PREPARE HOUSE DATA */
                currentHouse = {
                    name: house.name,
                    number: house.number,
                    admin: authData.password.email,
                    created: Date.now(),
                    updated: Date.now(),
                    join_code: RandomHouseCode() + house.number
                };
                
                /* SAVE HOUSE */
                var ref = fb.child("houses");
                var newChildRef = ref.push(currentHouse);
                
                /* UPDATE USER WITH HOUSE ID AND SET PRIORITY */
                temp = {
                    houseid: newChildRef.key()
                };
                var memberRef = fb.child("members").child(authData.uid);
                memberRef.update(temp);
                memberRef.setPriority(newChildRef.key());

                /* SAVE DEFAULT ACCOUNT TYPES */
                var ref = fb.child("houses").child(newChildRef.key()).child("memberaccounttypes");
                ref.push({ name: 'Checking', icon: '0' });
                ref.push({ name: 'Savings', icon: '0' });
                ref.push({ name: 'Credit Card', icon: '0' });
                ref.push({ name: 'Debit Card', icon: '0' });
                ref.push({ name: 'Investment', icon: '0' });
                ref.push({ name: 'Brokerage', icon: '0' });
                ref.push({ name: 'Checking', icon: '0' });

                /* SAVE DEFAULT CATEGORIES */
                var ref = fb.child("houses").child(newChildRef.key()).child("membercategories").child('Income');
                ref.push({ categoryname: 'Income', categoryparent: '', categorysort: 'Income', categorytype: 'Income' });
                ref.push({ categoryname: 'Beginning Balance', categoryparent: 'Income', categorysort: 'Income:Beginning Balance', categorytype: 'Income' });

                var ref = fb.child("houses").child(newChildRef.key()).child("membercategories").child('Expense');
                ref.push({ categoryname: 'Auto', categoryparent: '', categorysort: 'Auto', categorytype: 'Expense' });
                ref.push({ categoryname: 'Gasoline', categoryparent: 'Auto', categorysort: 'Auto:Gas', categorytype: 'Expense' });
                ref.push({ categoryname: 'Car Payment', categoryparent: 'Auto', categorysort: 'Auto:Car Payment', categorytype: 'Expense' });

                /* SAVE DEFAULT PAYEES */
                var ref = fb.child("houses").child(newChildRef.key()).child("memberpayees");
                ref.push({ lastamount: '', lastcategory: '', lastcategoryid: '', payeename: 'Beginning Balance' });
            }
        };
    })

    .factory('CategoriesFactory', function ($firebaseArray, $q, fireBaseData) {
        var ref = {};
        var categories = {};
        var parentcategories = {};
        var categoriesByType = {};
        var categoryRef = {};
        var authData = fb.getAuth();
        return {
            getCategories: function (type) {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membercategories").child(type).orderByChild('categoryname');
                categories = $firebaseArray(ref);
                return categories;
            },
            getParentCategories: function (type) {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membercategories").child(type).orderByChild('categoryparent');
                parentcategories = $firebaseArray(ref);
                return parentcategories;
            },
            getCategoriesByTypeAndGroup: function (type) {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membercategories").child(type).orderByChild('categoryparent');
                categoriesByType = $firebaseArray(ref);
                return categoriesByType;
            },
            getCategory: function (categoryid, type) {
                var deferred = $q.defer();
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membercategories").child(type).child(categoryid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getCategoryRef: function (categoryid, type) {
                categoryRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membercategories").child(type).child(categoryid);
                return categoryRef;
            },
        };
    })

    .factory('AccountsFactory', function ($firebaseArray, $q, fireBaseData) {
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
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberaccounts");
                return ref;
            },
            getAccounts: function () {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberaccounts");
                accounts = $firebaseArray(ref);
                return accounts;
            },
            getAccount: function (accountid) {
                var deferred = $q.defer();
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberaccounts").child(accountid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getAccountRef: function (accountid) {
                accountRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberaccounts").child(accountid);
                return accountRef;
            },
            getAccountTypes: function () {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberaccounttypes");
                accounttypes = $firebaseArray(ref);
                return accounttypes;
            },
            getTransaction: function (accountid, transactionid) {
                var deferred = $q.defer();
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactions").child(accountid).child(transactionid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getTransactions: function (accountid) {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactions").child(accountid);
                transactions = $firebaseArray(ref);
                return transactions;
            },
            getTransactionsByDate: function (accountid) {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactions").child(accountid).orderByChild('date');
                transactionsByDate = $firebaseArray(ref);
                return transactionsByDate;
            },
            getTransactionRef: function (accountid, transactionid) {
                transactionRef = fb.child("membertransactions").child(authData.uid).child(accountid).child(transactionid);
                return transactionRef;
            },
            getTransactionByCategoryRef: function (categoryid, transactionid) {
                transactionsbycategoryRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactionsbycategory").child(categoryid).child(transactionid);
                return transactionsbycategoryRef;
            },
            getTransactionByPayeeRef: function (payeeid, transactionid) {
                transactionsbypayeeRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactionsbypayee").child(payeeid).child(transactionid);
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
                accountRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberaccounts").child(accountid);
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
                var ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactions").child(accountId);
                var newChildRef = ref.push(currentItem);
                newChildRef.setWithPriority(currentItem, currentItem.date);
                //
                // Save transaction under category
                //
                var categoryTransactionRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactionsbycategory").child(currentItem.categoryid).child(newChildRef.key());
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
                var payeeTransactionRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactionsbypayee").child(currentItem.payeeid).child(newChildRef.key());
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
                var payeeRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberpayees").child(currentItem.payeeid);
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
                    var othertransRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactions").child(otherAccountId);
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
                transactionRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactions").child(accountid).child(transactionid);
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
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberpayees").orderByChild('payeename');
                payees = $firebaseArray(ref);
                return payees;
            },
            getTransactionsByPayee: function (payeeid) {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactionsbypayee").child(payeeid);
                transactionsByPayeeRef = $firebaseArray(ref);
                return transactionsByPayeeRef;
            },
            getTransactionsByCategory: function (categoryid) {
                ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("membertransactionsbycategory").child(categoryid);
                transactionsByCategoryRef = $firebaseArray(ref);
                return transactionsByCategoryRef;
            },
            getPayeeRef: function (payeeid) {
                payeeRef = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberpayees").child(payeeid);
                return payeeRef;
            },
        };
    })

    .factory('PayeesFactory', function ($firebaseArray, $q, $timeout) {
        var ref = {};
        var payees = {};
        var authData = fb.getAuth();
        ref = fb.child("houses").child(fireBaseData.currentData.currentHouse.id).child("memberpayees").orderByChild('payeename');
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

function escapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email;
}

function unescapeEmailAddress(email) {
    if (!email)
        return false
    email = email.toLowerCase();
    email = email.replace(/\,/g, '.');
    return email;
}

function RandomHouseCode() {
    return Math.floor((Math.random() * 100000000) + 100);
}