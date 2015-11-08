
angular.module('moneyleash.factories', [])

    .factory('Auth', function ($firebaseAuth) {
        return $firebaseAuth(fb);
    })

    .factory('myCache', function ($cacheFactory) {
        return $cacheFactory('myCache', function ($cacheFactory) {
            return $cacheFactory('myCache');
        });
    })

    .factory('MembersFactory', function ($firebaseArray, $q) {
        var ref = fb.child("members");
        return {
            ref: function () {
                return ref;
            },
            getMember: function (authData) {
                var deferred = $q.defer();
                var memberRef = ref.child(authData.uid);
                memberRef.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
        };
    })

    .factory('HouseFactory', function ($state, $q, myCache) {
        //
        // https://github.com/oriongunning/myExpenses
        //
        var authData = fb.getAuth();
        var ref = fb.child("houses");
        return {
            ref: function () {
                return ref;
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
            getHouses: function () {
                var deferred = $q.defer();
                ref.once('value', function (snap) {
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
                var currentHouse = {
                    name: house.name,
                    number: house.number,
                    admin: authData.password.email,
                    created: Date.now(),
                    updated: Date.now(),
                    join_code: RandomHouseCode() + house.number,
                    houseid: ''
                };

                /* SAVE HOUSE */
                var ref = fb.child("houses");
                var newChildRef = ref.push(currentHouse);
                
                /* Save houseid for later use */
                myCache.put('thisHouseId', newChildRef.key());

                /* UPDATE USER WITH HOUSE ID AND SET PRIORITY */
                var temp = {
                    houseid: newChildRef.key(),
                    housename: house.name,
                    housenumber: house.number,
                    houseadmin: authData.password.email,
                    housejoincode: RandomHouseCode() + house.number
                };
                var memberRef = fb.child("members").child(authData.uid);
                memberRef.update(temp);
                memberRef.setPriority(newChildRef.key());

                /* SAVE DEFAULT ACCOUNT TYPES */
                var refTypes = fb.child("houses").child(newChildRef.key()).child("memberaccounttypes");
                refTypes.push({ name: 'Checking', icon: '0' });
                refTypes.push({ name: 'Savings', icon: '0' });
                refTypes.push({ name: 'Credit Card', icon: '0' });
                refTypes.push({ name: 'Debit Card', icon: '0' });
                refTypes.push({ name: 'Investment', icon: '0' });
                refTypes.push({ name: 'Brokerage', icon: '0' });

                /* SAVE DEFAULT CATEGORIES */
                var refCatIncome = fb.child("houses").child(newChildRef.key()).child("membercategories").child('Income');
                refCatIncome.push({ categoryname: 'Income', categoryparent: '', categorysort: 'Income', categorytype: 'Income' });
                refCatIncome.push({ categoryname: 'Beginning Balance', categoryparent: 'Income', categorysort: 'Income:Beginning Balance', categorytype: 'Income' });

                var refCatExpense = fb.child("houses").child(newChildRef.key()).child("membercategories").child('Expense');
                refCatExpense.push({ categoryname: 'Auto', categoryparent: '', categorysort: 'Auto', categorytype: 'Expense' });
                refCatExpense.push({ categoryname: 'Gasoline', categoryparent: 'Auto', categorysort: 'Auto:Gas', categorytype: 'Expense' });
                refCatExpense.push({ categoryname: 'Car Payment', categoryparent: 'Auto', categorysort: 'Auto:Car Payment', categorytype: 'Expense' });

                /* SAVE DEFAULT PAYEES */
                var refPayee = fb.child("houses").child(newChildRef.key()).child("memberpayees");
                refPayee.push({ lastamount: '', lastcategory: '', lastcategoryid: '', payeename: 'Beginning Balance' });
            }
        };
    })

    .factory('CategoriesFactory', function ($firebaseArray, $q, myCache) {
        var ref = {};
        var categories = {};
        var parentcategories = {};
        var categoriesByType = {};
        var categoryRef = {};
        var thisHouseId = myCache.get('thisHouseId');
        return {
            getCategories: function (type) {
                ref = fb.child("houses").child(thisHouseId).child("membercategories").child(type).orderByChild('categoryname');
                categories = $firebaseArray(ref);
                return categories;
            },
            getParentCategories: function (type) {
                ref = fb.child("houses").child(thisHouseId).child("membercategories").child(type).orderByChild('categoryparent');
                parentcategories = $firebaseArray(ref);
                return parentcategories;
            },
            getCategoriesByTypeAndGroup: function (type) {
                ref = fb.child("houses").child(thisHouseId).child("membercategories").child(type).orderByChild('categoryparent');
                categoriesByType = $firebaseArray(ref);
                return categoriesByType;
            },
            getCategory: function (categoryid, type) {
                var deferred = $q.defer();
                ref = fb.child("houses").child(thisHouseId).child("membercategories").child(type).child(categoryid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            getCategoryRef: function (categoryid, type) {
                categoryRef = fb.child("houses").child(thisHouseId).child("membercategories").child(type).child(categoryid);
                return categoryRef;
            },
        };
    })

    .factory('AccountsFactory', function ($firebaseArray, $q, myCache, MembersFactory, CurrentUserService) {
        var ref = {};
        var allaccounts = {};
        var allaccounttypes = {};
        var alltransactions = {};
        var transactionRef = {};
        //var transactionsbycategoryRef = {};
        //var transactionsbypayeeRef = {};
        var thisHouseId = myCache.get('thisHouseId');
        return {
            ref: function () {
                ref = fb.child("houses").child(thisHouseId).child("memberaccounts");
                return ref;
            },
            getAccounts: function () {
                ref = fb.child("houses").child(thisHouseId).child("memberaccounts");
                allaccounts = $firebaseArray(ref);
                return allaccounts;
            },
            getAccount: function (accountid) {
                var thisAccount = allaccounts.$getRecord(accountid);
                return thisAccount;
            },
            getAccountTypes: function () {
                ref = fb.child("houses").child(thisHouseId).child("memberaccounttypes");
                allaccounttypes = $firebaseArray(ref);
                return allaccounttypes;
            },
            getTransaction: function (transactionid) {
                var thisTransaction = alltransactions.$getRecord(transactionid);
                return thisTransaction;
            },
            getTransactionsByDate: function (accountid) {
                ref = fb.child("houses").child(thisHouseId).child("membertransactions").child(accountid).orderByChild('date');
                alltransactions = $firebaseArray(ref);
                return alltransactions;
            },
            getTransactionRef: function (accountid, transactionid) {
                transactionRef = fb.child("houses").child(thisHouseId).child("membertransactions").child(accountid).child(transactionid);
                return transactionRef;
            },
            //getTransactionByCategoryRef: function (categoryid, transactionid) {
            //    transactionsbycategoryRef = fb.child("houses").child(thisHouseId).child("membertransactionsbycategory").child(categoryid).child(transactionid);
            //    return transactionsbycategoryRef;
            //},
            //getTransactionByPayeeRef: function (payeeid, transactionid) {
            //    transactionsbypayeeRef = fb.child("houses").child(thisHouseId).child("membertransactionsbypayee").child(payeeid).child(transactionid);
            //    return transactionsbypayeeRef;
            //},
            createNewAccount: function (currentItem) {
                // Create the account
                allaccounts.$add(currentItem).then(function (newChildRef) { });
            },
            saveAccount: function (account) {
                allaccounts.$save(account).then(function (ref) {
                    
                });
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
                var ref = fb.child("houses").child(thisHouseId).child("membertransactions").child(accountId);
                var newChildRef = ref.push(currentItem);
                //
                // Update preferences - Last Date Used
                //
                var fbAuth = fb.getAuth();
                var usersRef = MembersFactory.ref();
                var myUser = usersRef.child(fbAuth.uid);
                var temp = {
                    lastdate: currentItem.date
                }
                myUser.update(temp, function () {
                    CurrentUserService.lastdate = temp.lastdate;
                });

                ////
                //// Save transaction under category
                ////
                //var categoryTransactionRef = fb.child("houses").child(thisHouseId).child("membertransactionsbycategory").child(currentItem.categoryid).child(newChildRef.key());
                //var categoryTransaction = {
                //    payee: currentItem.payee,
                //    amount: currentItem.amount,
                //    date: currentItem.date,
                //    type: currentItem.type,
                //    iscleared: currentItem.iscleared
                //};
                //categoryTransactionRef.update(categoryTransaction);
                ////
                //// Save transaction under payee
                ////
                //var payeeTransactionRef = fb.child("houses").child(thisHouseId).child("membertransactionsbypayee").child(currentItem.payeeid).child(newChildRef.key());
                //var payeeTransaction = {
                //    payee: currentItem.payee,
                //    amount: currentItem.amount,
                //    date: currentItem.date,
                //    type: currentItem.type,
                //    iscleared: currentItem.iscleared
                //};
                //payeeTransactionRef.update(payeeTransaction);


                //
                // Save payee-category relationship
                //
                var payee = {};
                var payeeRef = fb.child("houses").child(thisHouseId).child("memberpayees").child(currentItem.payeeid);
                if (currentItem.type === "Income") {
                    payee = {
                        lastamountincome: currentItem.amount,
                        lastcategoryincome: currentItem.category,
                        lastcategoryidincome: currentItem.categoryid
                    };
                } else if (currentItem.type === "Expense") {
                    payee = {
                        lastamount: currentItem.amount,
                        lastcategory: currentItem.category,
                        lastcategoryid: currentItem.categoryid
                    };
                }
                payeeRef.update(payee);

                if (currentItem.istransfer) {
                    //
                    // Save the other transaction, get the transaction id and link it to this transaction
                    //
                    OtherTransaction.linkedtransactionid = newChildRef.key();
                    var othertransRef = fb.child("houses").child(thisHouseId).child("membertransactions").child(otherAccountId);
                    var sync = $firebaseArray(othertransRef);
                    sync.$add(OtherTransaction).then(function (otherChildRef) {
                        //
                        // Update this transaction with other transaction id
                        newChildRef.update({ linkedtransactionid: otherChildRef.key() })
                        //
                    });
                }
            },
            deleteTransaction: function () {
                return alltransactions;
            },
            saveTransaction: function (transaction) {
                alltransactions.$save(transaction).then(function (ref) {
                    //ref.key() = transaction.$id;
                });
            }
        };
    })

    .factory('PayeesService', function ($firebaseArray, $q, myCache) {
        var ref = {};
        var allpayees = {};
        var payeesRef = {};
        var payeeRef = {};
        //var transactionsByPayeeRef = {};
        //var transactionsByCategoryRef = {};
        var thisHouseId = myCache.get('thisHouseId');
        return {
            getPayees: function () {
                ref = fb.child("houses").child(thisHouseId).child("memberpayees").orderByChild('payeesort');
                allpayees = $firebaseArray(ref);
                return allpayees;
            },
            getPayee: function (payeeid) {
                var deferred = $q.defer();
                ref = fb.child("houses").child(thisHouseId).child("memberpayees").child(payeeid);
                ref.once("value", function (snap) {
                    deferred.resolve(snap.val());
                });
                return deferred.promise;
            },
            //getTransactionsByPayee: function (payeeid) {
            //    ref = fb.child("houses").child(thisHouseId).child("membertransactionsbypayee").child(payeeid);
            //    transactionsByPayeeRef = $firebaseArray(ref);
            //    return transactionsByPayeeRef;
            //},
            //getTransactionsByCategory: function (categoryid) {
            //    ref = fb.child("houses").child(thisHouseId).child("membertransactionsbycategory").child(categoryid);
            //    transactionsByCategoryRef = $firebaseArray(ref);
            //    return transactionsByCategoryRef;
            //},
            getPayeesRef: function () {
                payeesRef = fb.child("houses").child(thisHouseId).child("memberpayees");
                return payeesRef;
            },
            getPayeeRef: function (payeeid) {
                payeeRef = fb.child("houses").child(thisHouseId).child("memberpayees").child(payeeid);
                return payeeRef;
            },
            savePayee: function (payee) {
                allpayees.$save(payee).then(function (ref) {
                    //ref.key() = payee.$id;
                });
            }
        };
    })

    .factory('PayeesFactory', function ($firebaseArray, $q, $timeout, myCache) {
        var ref = {};
        var payees = {};
        var thisHouseId = myCache.get('thisHouseId');
        ref = fb.child("houses").child(thisHouseId).child("memberpayees").orderByChild('payeename');
        payees = $firebaseArray(ref);
        var searchPayees = function (searchFilter) {
            //console.log(searchFilter);
            var deferred = $q.defer();
            var matches = payees.filter(function (payee) {
                if (payee.payeename.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) {
                    return true;
                }
            });
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
            this.houseid = user.houseid;
            this.defaultdate = user.defaultdate;
            this.defaultbalance = user.defaultbalance;
            this.lastdate = user.lastdate;
        }
    })

    // Account Pick Lists
    .service("PickAccountServices", function () {
        var accountDate = this;
        var accountType = this;
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
        var transPhoto = this;
        var transNote = this;
        var transSearch = this;
        transactionType.updateType = function (value, type) {
            this.typeDisplaySelected = value;
            this.typeInternalSelected = type;
        }
        transCategory.updateCategory = function (value, id) {
            this.categorySelected = value;
            this.categoryid = id;
        }
        transPayee.updatePayee = function (payee, id, type) {
            this.payeeSelected = payee.payeename;
            if (type === "Income") {
                this.categorySelected = payee.lastcategoryincome;
                this.categoryid = payee.lastcategoryidincome;
                this.amountSelected = payee.lastamountincome;
                this.payeeid = id;
            } else if (type === "Expense") {
                this.categorySelected = payee.lastcategory;
                this.categoryid = payee.lastcategoryid;
                this.amountSelected = payee.lastamount;
                this.payeeid = id;
            }
        }
        transDate.updateDate = function (value) {
            this.dateSelected = value;
        }
        transDate.updateTime = function (value) {
            this.timeSelected = value;
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
        transPhoto.updatePhoto = function (value) {
            this.photoSelected = value;
        }
        transNote.updateNote = function (value) {
            this.noteSelected = value;
        }
        transSearch.updateSearch = function (value) {
            this.searchSelected = value;
        }
    })
;

function RandomHouseCode() {
    return Math.floor((Math.random() * 100000000) + 100);
}