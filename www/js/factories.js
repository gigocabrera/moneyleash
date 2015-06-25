
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

    .service("CategoryTypeService", function () {
        var cattype = this;
        cattype.updateType = function (value) {
            this.typeSelected = value;
        }
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

        $rootScope.hide = function () {
            $ionicLoading.hide();
        };

        return {

            clearData: function () {
                currentData = false;
            },
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
    .service("PickTransactionTypeService", function () {
        var TransactionType = this;
        TransactionType.updateType = function (value) {
            this.typeSelected = value;
        }
    })
    .service("PickTransactionCategoryService", function () {
        var transcat = this;
        transcat.updateCategory = function (value, id) {
            this.categorySelected = value;
            this.categoryid = id;
        }
    })
    .service("PickTransactionDateService", function () {
        var transdate = this;
        transdate.updateDate = function (value) {
            this.dateSelected = value;
        }
    })
    .service("PickTransactionAmountService", function () {
        var transamount = this;
        transamount.updateAmount = function (value) {
            this.amountSelected = value;
        }
    })

    .factory('FlightDataService', function ($q, $timeout) {

        var airlines = [{ "fs": "LCI", "iata": "LF", "icao": "LCI", "name": "Lao Central Airlines ", "active": true }, { "fs": "TGU", "iata": "5U", "icao": "TGU", "name": "TAG", "active": true }, { "fs": "BT", "iata": "BT", "icao": "BTI", "name": "Air Baltic", "active": true }, { "fs": "9J", "iata": "9J", "icao": "DAN", "name": "Dana Airlines", "active": true }, { "fs": "2O", "iata": "2O", "icao": "RNE", "name": "Island Air Service", "active": true }, { "fs": "NPT", "icao": "NPT", "name": "Atlantic Airlines", "active": true }, { "fs": "C8", "iata": "C8", "icao": "ICV", "name": "Cargolux Italia", "active": true }, { "fs": "FK", "iata": "FK", "icao": "WTA", "name": "Africa West", "active": true }, { "fs": "8K", "iata": "8K", "icao": "EVS", "name": "EVAS Air Charters", "active": true }, { "fs": "W8", "iata": "W8", "icao": "CJT", "name": "Cargojet", "active": true }, { "fs": "JBW", "iata": "3J", "icao": "JBW", "name": "Jubba Airways (Kenya)", "active": true }, { "fs": "TNU", "iata": "M8", "icao": "TNU", "name": "TransNusa", "active": true }, { "fs": "HCC", "iata": "HC", "icao": "HCC", "name": "Holidays Czech Airlines", "active": true }, { "fs": "APJ", "iata": "MM", "icao": "APJ", "name": "Peach Aviation", "active": true }, { "fs": "TUY", "iata": "L4", "icao": "TUY", "name": "LTA", "active": true }, { "fs": "LAE", "iata": "L7", "icao": "LAE", "name": "LANCO", "active": true }, { "fs": "L5*", "iata": "L5", "icao": "LTR", "name": "Lufttransport", "active": true }, { "fs": "QA", "iata": "QA", "icao": "CIM", "name": "Cimber", "active": true }, { "fs": "KBZ", "iata": "K7", "icao": "KBZ", "name": "Air KBZ", "active": true }, { "fs": "L2", "iata": "L2", "icao": "LYC", "name": "Lynden Air Cargo", "active": true }, { "fs": "MPK", "iata": "I6", "icao": "MPK", "name": "Air Indus", "active": true }, { "fs": "CAO", "icao": "CAO", "name": "Air China Cargo ", "active": true }, { "fs": "BEK", "iata": "Z9", "icao": "BEK", "name": "Bek Air", "active": true }, { "fs": "IAE", "iata": "IO", "icao": "IAE", "name": "IrAero", "active": true }, { "fs": "GL*", "iata": "GL", "name": "Airglow Aviation Services", "active": true }, { "fs": "ATN", "iata": "8C", "icao": "ATN", "name": "ATI", "active": true }, { "fs": "GU", "iata": "GU", "icao": "GUG", "name": "Aviateca Guatemala", "active": true }, { "fs": "GHY", "icao": "GHY", "name": "German Sky Airlines ", "active": true }, { "fs": "SS", "iata": "SS", "icao": "CRL", "name": "Corsair", "active": true }, { "fs": "XK", "iata": "XK", "icao": "CCM", "name": "Air Corsica", "active": true }, { "fs": "W9*", "iata": "W9", "icao": "JAB", "name": "Air Bagan", "active": true }, { "fs": "Z8*", "iata": "Z8", "icao": "AZN", "name": "Amaszonas", "active": true }, { "fs": "D2", "iata": "D2", "icao": "SSF", "name": "Severstal Aircompany", "active": true }, { "fs": "SNC", "iata": "2Q", "icao": "SNC", "name": "Air Cargo Carriers", "active": true }, { "fs": "PST", "iata": "7P", "icao": "PST", "name": "Air Panama", "active": true }, { "fs": "VV", "iata": "VV", "icao": "AEW", "name": "Aerosvit Airlines", "active": true }, { "fs": "UJ", "iata": "UJ", "icao": "LMU", "name": "AlMasria", "active": true }, { "fs": "9U", "iata": "9U", "icao": "MLD", "name": "Air Moldova", "active": true }, { "fs": "NF", "iata": "NF", "icao": "AVN", "name": "Air Vanuatu", "phoneNumber": "678 238 48", "active": true }, { "fs": "NJS", "iata": "NC", "icao": "NJS", "name": "Cobham Aviation", "active": true }];

        airlines = airlines.sort(function (a, b) {

            var airlineA = a.name.toLowerCase();
            var airlineB = b.name.toLowerCase();

            if (airlineA > airlineB) return 1;
            if (airlineA < airlineB) return -1;
            return 0;
        });

        console.log(airlines);

        var searchAirlines = function (searchFilter) {

            console.log('Searching airlines for ' + searchFilter);

            var deferred = $q.defer();

            var matches = airlines.filter(function (airline) {
                if (airline.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) return true;
            })

            $timeout(function () {

                deferred.resolve(matches);

            }, 100);

            return deferred.promise;

        };

        return {

            searchAirlines: searchAirlines

        }
    })

;