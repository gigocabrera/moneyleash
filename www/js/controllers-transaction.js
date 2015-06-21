
// PICK TRANSACTION AMOUNT CONTROLLER
moneyleashapp.controller('PickTransactionAmountController', function ($scope, $ionicHistory, PickTransactionAmountService) {

    $scope.clearValue = true;
    $scope.displayValue = 0;
    if (typeof PickTransactionAmountService.amountSelected != 'undenifed') {
        $scope.displayValue = PickTransactionAmountService.amountSelected;
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
            PickTransactionAmountService.updateAmount($scope.displayValue);
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
moneyleashapp.controller('PickTransactionDateController', function ($scope, $ionicHistory, PickTransactionDateService, dateFilter) {
    
    if (typeof PickTransactionDateService.dateSelected != 'undefined' && PickTransactionDateService.dateSelected != '') {
        // format date to be used by pickadate directive
        var format = 'yyyy-MM-dd';
        $scope.myDate = dateFilter(PickTransactionDateService.dateSelected, format);
    }
    $scope.dateChanged = function (transDate) {
        PickTransactionDateService.updateDate(transDate);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION CATEGORY CONTROLLER
moneyleashapp.controller('PickTransactionCategoryController', function ($scope, $ionicHistory, CategoriesFactory, PickTransactionTypeService, PickTransactionCategoryService) {
    //
    // To fetch categories, we need to know the transaction type first (Expense/Income)
    //
    if (PickTransactionTypeService.typeSelected === '') {
        $scope.TransactionCategoryList = '';
    } else {
        $scope.TransactionCategoryList = CategoriesFactory.getCategoriesByTypeAndGroup(PickTransactionTypeService.typeSelected);
        $scope.TransactionCategoryList.$loaded().then(function () {
        });
    };
    $scope.currentItem = { categoryname: PickTransactionCategoryService.categorySelected };
    $scope.categorychanged = function (item) {
        PickTransactionCategoryService.updateCategory(item.categoryname);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION TYPE CONTROLLER
moneyleashapp.controller('PickTransactionTypeController', function ($scope, $state, $ionicHistory, PickTransactionTypeService) {
    $scope.TransactionTypeList = [
        { text: 'Income', value: 'Income' },
        { text: 'Expense', value: 'Expense' },
        { text: 'Transfer', value: 'Transfer' }];
    $scope.currentItem = { typedisplay: PickTransactionTypeService.typeSelected };
    $scope.itemchanged = function (item) {
        PickTransactionTypeService.updateType(item.value);
        $ionicHistory.goBack();
    };
})

// TRANSACTION CONTROLLER
moneyleashapp.controller('TransactionController', function ($scope, $state, $rootScope, $ionicHistory, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory, PickTransactionTypeService, PickTransactionCategoryService, PickTransactionDateService, PickTransactionAmountService, dateFilter) {
   
    $scope.transactions = [];
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.isTransfer = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.currentItem = {
        'accountFrom': '',
        'accountFromId': '',
        'accountTo': '',
        'accountToId': '',
        'amount': '',
        'category': '',
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
        $scope.currentItem.typedisplay = PickTransactionTypeService.typeSelected;
        $scope.currentItem.category = PickTransactionCategoryService.categorySelected;
        $scope.currentItem.amount = PickTransactionAmountService.amountSelected;
        if (typeof PickTransactionDateService.dateSelected != 'undefined' && PickTransactionDateService.dateSelected != '') {
            console.log("HH " + PickTransactionDateService.dateSelected);
            // format date to be displayed
            var format = 'MMMM dd, yyyy';
            $scope.currentItem.date = dateFilter(PickTransactionDateService.dateSelected, format);
            console.log("TT " + $scope.currentItem.date);
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
                PickTransactionDateService.dateSelected = dtTransDate;
                // format date to be displayed
                var format = 'MMMM dd, yyyy';
                transaction.date = dateFilter(dtTransDate, format);
            }
            $scope.currentItem = transaction;
            $scope.isTransfer = $scope.currentItem.istransfer;
            PickTransactionTypeService.typeSelected = $scope.currentItem.typedisplay
            PickTransactionCategoryService.categorySelected = $scope.currentItem.category;
            PickTransactionAmountService.amountSelected = $scope.currentItem.amount;
        });
        $scope.TransactionTitle = "Edit Transaction";
    }

    // SAVE
    $scope.saveTransaction = function (currentItem) {

        // Format date
        var dtTran = new Date($scope.currentItem.date);
        dtTran = +dtTran;
        $scope.currentItem.date = dtTran;

        // Handle transaction type
        if ($scope.currentItem.typedisplay.toUpperCase() === "TRANSFER" && currentItem.accountToId === $stateParams.accountId) {
            $scope.currentItem.type = 'Income';
            $scope.currentItem.istransfer = true;
        } else if ($scope.currentItem.typedisplay.toUpperCase() === "TRANSFER" && currentItem.accountToId !== $stateParams.accountId) {
            $scope.currentItem.type = 'Expense';
            $scope.currentItem.istransfer = true;
        } else {
            $scope.currentItem.type = $scope.currentItem.typedisplay;
            $scope.currentItem.istransfer = false;
        }

        if ($scope.inEditMode) {
            // Update
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                }
            };
            var transactionRef = AccountsFactory.getTransactionRef($stateParams.accountId, $stateParams.transactionId);
            transactionRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
        } else {
            // Create
            if (isNaN($scope.currentItem.notes)) {
                $scope.currentItem.notes = "";
            }
            if (isNaN($scope.currentItem.photo)) {
                $scope.currentItem.photo = "";
            }
            var sync = AccountsFactory.getTransactions($stateParams.accountId);
            sync.$add($scope.currentItem).then(function (newChildRef) {
                $scope.currentItem = {
                    accountid: newChildRef.key()
                };
            });
        }
        $rootScope.hide();
        $scope.currentItem = {};
        $state.go('app.transactionsByDay', { accountId: $stateParams.accountId, accountName: $stateParams.accountName });
    }
})
