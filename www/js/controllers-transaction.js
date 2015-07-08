
// PICK TRANSACTION TYPE CONTROLLER
moneyleashapp.controller('PickTransactionTypeController', function ($scope, $state, $ionicHistory, PickTransactionServices) {
    $scope.TransactionTypeList = [
        { text: 'Income', value: 'Income' },
        { text: 'Expense', value: 'Expense' },
        { text: 'Transfer', value: 'Transfer' }];
    $scope.currentItem = { typedisplay: PickTransactionServices.typeSelected };
    $scope.itemchanged = function (item) {
        PickTransactionServices.updateType(item.value);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION ACCOUNT FROM CONTROLLER
moneyleashapp.controller('PickTransactionAccountFromController', function ($scope, $state, $ionicHistory, AccountsFactory, PickTransactionServices) {
    //
    // Get accounts
    //
    $scope.TransactionAccountList = AccountsFactory.getAccounts();
    $scope.TransactionAccountList.$loaded().then(function () {});
    $scope.currentItem = { accountFrom: PickTransactionServices.accountFromSelected };
    $scope.itemchanged = function (account) {
        PickTransactionServices.updateAccountFrom(account.accountname, account.$id);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION ACCOUNT TO CONTROLLER
moneyleashapp.controller('PickTransactionAccountToController', function ($scope, $state, $ionicHistory, AccountsFactory, PickTransactionServices) {
    //
    // Get accounts
    //
    $scope.TransactionAccountList = AccountsFactory.getAccounts();
    $scope.TransactionAccountList.$loaded().then(function () { });
    $scope.currentItem = { accountFrom: PickTransactionServices.accountToSelected };
    $scope.itemchanged = function (account) {
        PickTransactionServices.updateAccountTo(account.accountname, account.$id);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION PAYEE CONTROLLER
moneyleashapp.controller('PickTransactionPayeeController', function ($scope, $state, $ionicHistory, PayeesFactory, PayeesService, PickTransactionServices) {

    $scope.data = { "payees": [], "search": '' };
    $scope.search = function () {
        PayeesFactory.searchPayees($scope.data.search).then(
    		function (matches) {
    		    $scope.data.payees = matches;
    		}
    	)
    }

    // SAVE PAYEE
    $scope.savePayee = function () {
        $scope.currentItem = {
            'payeename': $scope.data.search,
            'lastcategory': '',
            'lastcategoryid': '',
            'lastamount': ''
        };
        var sync = PayeesService.getPayees();
        var payeeid = '';
        sync.$add($scope.currentItem).then(function (newChildRef) {
            payeeid = newChildRef.key();
            PickTransactionServices.updatePayee($scope.currentItem.payeename, payeeid);
            $ionicHistory.goBack();
        });
    }

    $scope.selectPayee = function (payee) {
        PickTransactionServices.updatePayee(payee.payeename, payee.$id);
        $ionicHistory.goBack();
    }
})

// PICK TRANSACTION CATEGORY CONTROLLER
moneyleashapp.controller('PickTransactionCategoryController', function ($scope, $ionicHistory, CategoriesFactory, PickTransactionServices) {
    //
    // To fetch categories, we need to know the transaction type first (Expense/Income)
    //
    if (PickTransactionServices.typeSelected === '') {
        $scope.TransactionCategoryList = '';
    } else {
        $scope.categoriesDividerTitle = PickTransactionServices.typeSelected;
        $scope.TransactionCategoryList = CategoriesFactory.getCategoriesByTypeAndGroup(PickTransactionServices.typeSelected);
        $scope.TransactionCategoryList.$loaded().then(function () {
        });
    };
    $scope.currentItem = { categoryname: PickTransactionServices.categorySelected };
    $scope.categorychanged = function (item) {
        PickTransactionServices.updateCategory(item.categoryname, item.$id);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION AMOUNT CONTROLLER
moneyleashapp.controller('PickTransactionAmountController', function ($scope, $ionicHistory, PickTransactionServices) {

    $scope.clearValue = true;
    $scope.displayValue = 0;
    if (typeof PickTransactionServices.amountSelected !== 'undenifed') {
        $scope.displayValue = PickTransactionServices.amountSelected;
    }
    $scope.digitClicked = function (digit) {
        if (digit === 'C') {
            $scope.displayValue = '';
            $scope.clearValue = true;
        } else if (digit === '.') {
            $scope.displayValue = $scope.displayValue + digit;
        } else if (digit === 'B') {
            $scope.displayValue = $scope.displayValue.substring(0, $scope.displayValue.length - 1);
            $scope.clearValue = false;
        } else if (digit === 'D') {
            PickTransactionServices.updateAmount($scope.displayValue);
            $ionicHistory.goBack();
        } else {
            if ($scope.clearValue) {
                $scope.displayValue = digit;
                $scope.clearValue = false;
            } else {
                $scope.displayValue = $scope.displayValue + digit;
            }
        }
    };
})

// PICK TRANSACTION DATE CONTROLLER
moneyleashapp.controller('PickTransactionDateController', function ($scope, $ionicHistory, PickTransactionServices, dateFilter) {
    
    if (typeof PickTransactionServices.dateSelected !== 'undefined' && PickTransactionServices.dateSelected !== '') {
        // format date to be used by pickadate directive
        var format = 'yyyy-MM-dd';
        $scope.myDate = dateFilter(PickTransactionServices.dateSelected, format);
    }
    $scope.dateChanged = function (transDate) {
        PickTransactionServices.updateDate(transDate);
        $ionicHistory.goBack();
    };
})

// TRANSACTION CONTROLLER
moneyleashapp.controller('TransactionController', function ($scope, $state, $stateParams, $ionicHistory, AccountsFactory, PickTransactionServices, dateFilter) {
   
    $scope.hideValidationMessage = true;
    $scope.loadedClass = 'hidden';
    $scope.transactions = [];
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.isTransfer = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.ItemFrom = {};
    $scope.ItemTo = {};
    $scope.currentItem = {
        'accountFrom': '',
        'accountFromId': '',
        'accountTo': '',
        'accountToId': '',
        'amount': '',
        'category': '',
        'categoryid': '',
        'date': '',
        'iscleared': false,
        'isrecurring': false,
        'istransfer': false,
        'notes': '',
        'payee': '',
        'photo': '',
        'runningbalance': '',
        'type': '',
        'typedisplay': ''
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.hideValidationMessage = true;
        $scope.currentItem.typedisplay = PickTransactionServices.typeSelected;
        $scope.currentItem.category = PickTransactionServices.categorySelected;
        $scope.currentItem.categoryid = PickTransactionServices.categoryid;
        $scope.currentItem.amount = PickTransactionServices.amountSelected;
        $scope.currentItem.payee = PickTransactionServices.payeeSelected;
        $scope.currentItem.payeeid = PickTransactionServices.payeeid;
        $scope.currentItem.accountFrom = PickTransactionServices.accountFromSelected;
        $scope.currentItem.accountFromId = PickTransactionServices.accountFromId;
        $scope.currentItem.accountTo = PickTransactionServices.accountToSelected;
        $scope.currentItem.accountToId = PickTransactionServices.accountToId;
        if (typeof PickTransactionServices.dateSelected !== 'undefined' && PickTransactionServices.dateSelected !== '') {
            // format date to be displayed
            var format = 'MMMM dd, yyyy';
            $scope.currentItem.date = dateFilter(PickTransactionServices.dateSelected, format);
        }
        $scope.isTransfer = ($scope.currentItem.typedisplay === "Transfer") ? true : false;
    });

    // EDIT / CREATE ACCOUNT
    if ($stateParams.transactionId === '') {
        $scope.TransactionTitle = "Create Transaction";
    } else {
        // Edit transaction
        $scope.editIndex = $stateParams.transactionId;
        $scope.inEditMode = true;
        AccountsFactory.getTransaction($stateParams.accountId, $stateParams.transactionId).then(function (transaction) {
            var dtTransDate = new Date(transaction.date);
            if (isNaN(dtTransDate)) {
                transaction.date = "";
            } else {
                // save date in ISO format in service
                dtTransDate = dtTransDate.toISOString();
                PickTransactionServices.dateSelected = dtTransDate;
                // format date to be displayed
                var format = 'MMMM dd, yyyy';
                transaction.date = dateFilter(dtTransDate, format);
            }
            $scope.currentItem = transaction;
            $scope.isTransfer = $scope.currentItem.istransfer;
            PickTransactionServices.typeSelected = $scope.currentItem.typedisplay
            PickTransactionServices.categorySelected = $scope.currentItem.category;
            PickTransactionServices.categoryid = $scope.currentItem.categoryid;
            PickTransactionServices.amountSelected = $scope.currentItem.amount;
            PickTransactionServices.payeeSelected = $scope.currentItem.payee;
            PickTransactionServices.payeeid = $scope.currentItem.payeeid;
            PickTransactionServices.accountFromSelected = $scope.currentItem.accountFrom;
            PickTransactionServices.accountFromId = $scope.currentItem.accountFromId;
            PickTransactionServices.accountToSelected = $scope.currentItem.accountTo;
            PickTransactionServices.accountToId = $scope.currentItem.accountToId;
        });
        $scope.TransactionTitle = "Edit Transaction";
    }

    // SAVE
    $scope.saveTransaction = function () {

        // Validate form data
        if (typeof $scope.currentItem.typedisplay === 'undefined' || $scope.currentItem.typedisplay === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select Transaction Type"
            return;
        }
        if ($scope.currentItem.typedisplay === 'Transfer') {
            // Do not validate payee and category if this is a transfer
        } else {
            if (typeof $scope.currentItem.payee === 'undefined' || $scope.currentItem.payee === '') {
                $scope.hideValidationMessage = false;
                $scope.validationMessage = "Please select a Payee"
                return;
            }
            if (typeof $scope.currentItem.category === 'undefined' || $scope.currentItem.category === '') {
                $scope.hideValidationMessage = false;
                $scope.validationMessage = "Please select a Category"
                return;
            }
        }
        if (typeof $scope.currentItem.amount === 'undefined' || $scope.currentItem.amount === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter an amount for this transaction"
            return;
        }
        if (typeof $scope.currentItem.date === 'undefined' || $scope.currentItem.date === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select a date for this transaction"
            return;
        }

        // Format date
        var dtTran = new Date($scope.currentItem.date);
        dtTran = +dtTran;
        $scope.currentItem.date = dtTran;

        // Handle transaction type
        if ($scope.currentItem.typedisplay === "Transfer" && $stateParams.accountId === $scope.currentItem.accountToId) {
            $scope.currentItem.type = 'Income';
            $scope.currentItem.category = 'Tranfer';
            $scope.currentItem.categoryid = 'Tranfer';
            $scope.currentItem.istransfer = true;
        } else if ($scope.currentItem.typedisplay === "Transfer" && $stateParams.accountId !== $scope.currentItem.accountToId) {
            $scope.currentItem.type = 'Expense';
            $scope.currentItem.category = 'Tranfer';
            $scope.currentItem.categoryid = 'Tranfer';
            $scope.currentItem.istransfer = true;
        } else {
            $scope.currentItem.accountFrom = '';
            $scope.currentItem.accountFromId = '';
            $scope.currentItem.accountTo = '';
            $scope.currentItem.accountToId = '';
            $scope.currentItem.type = $scope.currentItem.typedisplay;
            $scope.currentItem.istransfer = false;
        }

        if ($scope.inEditMode) {
            //
            // Update Existing
            //
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                }
            };
            var transactionRef = AccountsFactory.getTransactionRef($stateParams.accountId, $stateParams.transactionId);
            transactionRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
        } else {
            //
            // Create New
            //
            if (isNaN($scope.currentItem.notes)) {
                $scope.currentItem.notes = "";
            }
            if (isNaN($scope.currentItem.photo)) {
                $scope.currentItem.photo = "";
            }

            if ($scope.currentItem.typedisplay === 'Transfer') {

                angular.copy($scope.currentItem, $scope.ItemFrom);
                angular.copy($scope.currentItem, $scope.ItemTo);
                //
                // Create the 'Account FROM' transaction
                //
                if ($stateParams.accountId === $scope.ItemFrom.accountFromId) {
                    $scope.ItemFrom.payee = 'Tranfer from ' + $scope.ItemFrom.accountFrom;
                    $scope.ItemFrom.type = 'Income';
                    AccountsFactory.createTransaction($scope.ItemFrom, $scope.ItemFrom.accountToId);
                } else {
                    $scope.ItemFrom.payee = 'Tranfer to ' + $scope.ItemFrom.accountTo;
                    $scope.ItemFrom.type = 'Expense';
                    AccountsFactory.createTransaction($scope.ItemFrom, $scope.ItemFrom.accountFromId);
                }
                console.log($scope.ItemFrom);
                //
                // Create the 'Account TO' transaction
                //
                if ($stateParams.accountId === $scope.ItemTo.accountToId) {
                    $scope.ItemTo.payee = 'Tranfer from ' + $scope.ItemTo.accountFrom;
                    $scope.ItemTo.type = 'Income';
                    AccountsFactory.createTransaction($scope.ItemTo, $scope.ItemTo.accountToId);
                } else {
                    $scope.ItemTo.payee = 'Tranfer to ' + $scope.ItemTo.accountTo;
                    $scope.ItemTo.type = 'Expense';
                    AccountsFactory.createTransaction($scope.ItemTo, $scope.ItemTo.accountToId);
                }
                console.log($scope.ItemTo);
                
            } else {
                AccountsFactory.createTransaction($scope.currentItem, $stateParams.accountId);
            }
            
        }
        $scope.currentItem = {};
        $ionicHistory.goBack();
    }
})
