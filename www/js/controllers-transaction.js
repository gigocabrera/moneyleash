
// PICK TRANSACTION PHOTO CONTROLLER
moneyleashapp.controller('PickTransactionPhotoController', function ($scope, $ionicHistory, $cordovaCamera, PickTransactionServices) {
    
    $scope.currentItem = { photo: PickTransactionServices.photoSelected };
    $scope.uploadPhoto = function () {
        if (PickTransactionServices.photoSelected === 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' || PickTransactionServices.photoSelected === '') {
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                targetWidth: 800,
                targetHeight: 800,
                saveToPhotoAlbum: false
            };
            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.currentItem.photo = imageData;
            }, function (error) {
                console.error(error);
            })
        }
    };
    $scope.savePhoto = function () {
        PickTransactionServices.updatePhoto($scope.currentItem.photo);
        $ionicHistory.goBack();
    };
    $scope.removePhoto = function () {
        $scope.currentItem.photo = '';
        PickTransactionServices.updatePhoto('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
        $ionicHistory.goBack();
    }
})

// PICK TRANSACTION-TYPE CONTROLLER
moneyleashapp.controller('PickTransactionTypeController', function ($scope, $ionicHistory, PickTransactionServices) {
    $scope.TransactionTypeList = [
        { text: 'Income', value: 'Income' },
        { text: 'Expense', value: 'Expense' },
        { text: 'Transfer', value: 'Transfer' }];
    $scope.currentItem = { typedisplay: PickTransactionServices.typeDisplaySelected };
    $scope.itemchanged = function (item) {
        PickTransactionServices.updateType(item.value, item.value);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION ACCOUNT-FROM CONTROLLER
moneyleashapp.controller('PickTransactionAccountFromController', function ($scope, $ionicHistory, AccountsFactory, PickTransactionServices) {
    //
    // Get accounts
    //
    $scope.TransactionAccountList = AccountsFactory.getAccounts();
    $scope.TransactionAccountList.$loaded().then(function () {});
    $scope.currentItem = { accountFrom: PickTransactionServices.accountFromSelected };
    $scope.itemchanged = function (account) {
        PickTransactionServices.updateAccountFrom(account.accountname, account.$id);
        PickTransactionServices.categorySelected = '';
        PickTransactionServices.categoryid = '';
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION ACCOUNT-TO CONTROLLER
moneyleashapp.controller('PickTransactionAccountToController', function ($scope, $ionicHistory, AccountsFactory, PickTransactionServices) {
    //
    // Get accounts
    //
    $scope.TransactionAccountList = AccountsFactory.getAccounts();
    $scope.TransactionAccountList.$loaded().then(function () { });
    $scope.currentItem = { accountFrom: PickTransactionServices.accountToSelected };
    $scope.itemchanged = function (account) {
        PickTransactionServices.updateAccountTo(account.accountname, account.$id);
        PickTransactionServices.categorySelected = '';
        PickTransactionServices.categoryid = '';
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION-PAYEE CONTROLLER
moneyleashapp.controller('PickTransactionPayeeController', function ($scope, $ionicHistory, PayeesFactory, PayeesService, PickTransactionServices) {

    $scope.inEditMode = false;
    $scope.hideValidationMessage = true;
    $scope.PayeeTitle = '';
    $scope.currentItem = {};
    $scope.data = { "payees": [], "search": '' };
    $scope.search = function () {
        PayeesFactory.searchPayees($scope.data.search).then(
    		function (matches) {
    		    $scope.data.payees = matches;
    		}
    	)
    }
    
    // EDIT / CREATE PAYEE
    if (typeof PickTransactionServices.payeeSelected !== 'undefined' && PickTransactionServices.payeeSelected !== '') {
        // Edit Payee
        $scope.inEditMode = true;
        $scope.PayeeTitle = "Edit Payee";
        PayeesService.getPayee(PickTransactionServices.payeeid).then(function (payee) {
            $scope.currentItem = payee;
        });
        $scope.data.search = PickTransactionServices.payeeSelected;
    } else {
        $scope.PayeeTitle = "Select Payee";
        $scope.inEditMode = false;
    }

    // SAVE PAYEE
    $scope.savePayee = function () {

        // Validate form data
        if (typeof $scope.data.search === 'undefined' || $scope.data.search === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter payee name"
            return;
        }
        $scope.currentItem.payeename = $scope.data.search;
        $scope.currentItem.payeesort = $scope.data.search.toUpperCase();
        if ($scope.inEditMode) {
            // Update
            var onComplete = function (error) {
                if (error) {
                    //console.log('Synchronization failed');
                }
            };
            //
            // Update this payee
            //
            var payeeRef = PayeesService.getPayeeRef(PickTransactionServices.payeeid);
            payeeRef.update($scope.currentItem, onComplete);


            ////
            //// Update all transactions under this payee
            ////
            //$scope.transactionsbypayee = PayeesService.getTransactionsByPayee(PickTransactionServices.payeeid);
            //$scope.transactionsbypayee.$loaded().then(function () {
            //    angular.forEach($scope.transactionsbypayee, function (transaction) {
            //        transaction.payee = $scope.currentItem.payeename;
            //        $scope.transactionsbypayee.$save(transaction).then(function (ref) {
                        
            //        });
            //    })
            //})


            //
            // TODO: Update all transactions with new payee name
            // Find a way to update all necessary transactions with new payee name 
            //
            // Rehydrate payee and go back
            //
            $scope.inEditMode = false;
            PickTransactionServices.updatePayee($scope.currentItem, PickTransactionServices.payeeid);
            $ionicHistory.goBack();
            //
        } else {
            //
            // Create New Payee
            //
            var payeesRef = PayeesService.getPayeesRef();
            var newpayeeRef = payeesRef.push($scope.currentItem, function (error) {
                if (error) {
                    console.log("Data could not be saved." + error);
                } else {
                    var payeeid = '';
                    payeeid = newpayeeRef.key();
                    PickTransactionServices.updatePayee($scope.currentItem, payeeid, PickTransactionServices.typeInternalSelected);
                    $ionicHistory.goBack();
                }
            });
        }
    }
    $scope.selectPayee = function (payee) {
        PickTransactionServices.updatePayee(payee, payee.$id, PickTransactionServices.typeInternalSelected);
        $ionicHistory.goBack();
    }
})

// PICK TRANSACTION CATEGORY CONTROLLER
moneyleashapp.controller('PickTransactionCategoryController', function ($scope, $state, $ionicHistory, CategoriesFactory, PickTransactionServices, PickCategoryTypeService, PickParentCategoryService) {
    //
    // To fetch categories, we need to know the transaction type first (Expense/Income)
    //
    if (PickTransactionServices.typeInternalSelected === '') {
        $scope.TransactionCategoryList = '';
    } else {
        $scope.categoriesDividerTitle = PickTransactionServices.typeInternalSelected;
        $scope.TransactionCategoryList = CategoriesFactory.getCategoriesByTypeAndGroup(PickTransactionServices.typeInternalSelected);
        $scope.TransactionCategoryList.$loaded().then(function () {
        });
    };
    $scope.currentItem = { categoryname: PickTransactionServices.categorySelected };
    $scope.categorychanged = function (item) {
        PickTransactionServices.updateCategory(item.categoryname, item.$id);
        $ionicHistory.goBack();
    };
    // CREATE CATEGORY
    $scope.createCategory = function () {
        PickCategoryTypeService.typeSelected = '';
        PickParentCategoryService.parentcategorySelected = '';
        $state.go('app.category');
    }
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
moneyleashapp.controller('PickTransactionDateController', function ($scope, $ionicHistory, PickTransactionServices) {
    
    $scope.transactionTime = '';
    if (typeof PickTransactionServices.dateSelected !== 'undefined' && PickTransactionServices.dateSelected !== '') {
        $scope.myDate = moment(PickTransactionServices.dateSelected, 'MMMM D, YYYY').format('YYYY-MM-DD');
        // Get the time for the timepicker control
        var l = moment(PickTransactionServices.timeSelected);
        $scope.transactionTime = (l.hours() * 3600) + (l.minutes() * 60);
    }

    $scope.timePickerObject = {
        inputEpochTime: $scope.transactionTime,  //Optional
        step: 1,  //Optional
        format: 12,  //Optional
        titleLabel: 'Transaction time',  //Optional
        setLabel: 'Set',  //Optional
        closeLabel: 'Close',  //Optional
        setButtonType: 'button-positive',  //Optional
        closeButtonType: 'button-stable',  //Optional
        callback: function (val) {    //Mandatory
            timePickerCallback(val);
        }
    };

    var selectedTime = '';
    function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
            //console.log('Time not selected');
        } else {
            $scope.timePickerObject.inputEpochTime = val;
            selectedTime = new Date(val * 1000);
            //console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
        }
    }

    $scope.saveDateTime = function (transDate) {
        var dt = moment(transDate, 'YYYY-MM-DD').hour(selectedTime.getUTCHours()).minute(selectedTime.getUTCMinutes());
        dt = dt.format('MMMM D, YYYY hh:mm a');
        PickTransactionServices.updateDate(dt);
        $ionicHistory.goBack();
    };
})

// PICK TRANSACTION NOTES CONTROLLER
moneyleashapp.controller('PickTransactionNoteController', function ($scope, $ionicHistory, PickTransactionServices) {

    if (typeof PickTransactionServices.noteSelected !== 'undefined' && PickTransactionServices.noteSelected !== '') {
        $scope.note = PickTransactionServices.noteSelected;
    }
    $scope.saveNote = function () {
        PickTransactionServices.updateNote($scope.note);
        $ionicHistory.goBack();
    };

})

// TRANSACTION CONTROLLER
moneyleashapp.controller('TransactionController', function ($scope, $state, $stateParams, $ionicHistory, AccountsFactory, PickTransactionServices, PayeesService, myCache, CurrentUserService) {

    $scope.hideValidationMessage = true;
    $scope.loadedClass = 'hidden';
    $scope.transactions = [];
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.isTransfer = false;
    $scope.ItemFrom = {};
    $scope.ItemTo = {};
    $scope.ItemOriginal = {};
    $scope.DisplayDate = '';
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
        'isphoto': false,
        'notes': '',
        'payee': '',
        'photo': '',
        'runningbalance': '',
        'type': '',
        'typedisplay': ''
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.hideValidationMessage = true;
        $scope.currentItem.typedisplay = PickTransactionServices.typeDisplaySelected;
        $scope.currentItem.type = PickTransactionServices.typeInternalSelected;
        $scope.currentItem.payee = PickTransactionServices.payeeSelected;
        $scope.currentItem.payeeid = PickTransactionServices.payeeid;
        $scope.currentItem.category = PickTransactionServices.categorySelected;
        $scope.currentItem.categoryid = PickTransactionServices.categoryid;
        $scope.currentItem.amount = PickTransactionServices.amountSelected;
        $scope.currentItem.accountFrom = PickTransactionServices.accountFromSelected;
        $scope.currentItem.accountFromId = PickTransactionServices.accountFromId;
        $scope.currentItem.accountTo = PickTransactionServices.accountToSelected;
        $scope.currentItem.accountToId = PickTransactionServices.accountToId;
        $scope.currentItem.photo = PickTransactionServices.photoSelected;
        if ($scope.currentItem.photo === '') {
            $scope.currentItem.photo = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        }
        $scope.currentItem.note = PickTransactionServices.noteSelected;
        $scope.isTransfer = ($scope.currentItem.typedisplay === "Transfer") ? true : false;
        // Handle transaction date
        if (typeof PickTransactionServices.dateSelected !== 'undefined' && PickTransactionServices.dateSelected !== '') {
            $scope.DisplayDate = PickTransactionServices.dateSelected;
        }
        // Handle transaction type
        if ($scope.currentItem.typedisplay === "Transfer" && $stateParams.accountId === $scope.currentItem.accountToId) {
            PickTransactionServices.typeInternalSelected = 'Income';
        } else if ($scope.currentItem.typedisplay === "Transfer" && $stateParams.accountId !== $scope.currentItem.accountToId) {
            PickTransactionServices.typeInternalSelected = 'Expense';
        }
    });

    // EDIT / CREATE TRANSACTION
    if ($stateParams.transactionId === '') {
        //
        // Create transaction
        //
        $scope.TransactionTitle = "Create Transaction";
        // Handle defaults
        if (CurrentUserService.defaultdate === "None") {
            // Leave field blank
        } else if (CurrentUserService.defaultdate === "Today") {
            // Enter today's date
            $scope.DisplayDate = moment(new Date()).format('MMMM D, YYYY');
            PickTransactionServices.dateSelected = $scope.DisplayDate;
        } else if (CurrentUserService.defaultdate === "Last") {
            // Enter last date used
            $scope.DisplayDate = moment(CurrentUserService.lastdate).format('MMMM D, YYYY');
            PickTransactionServices.dateSelected = $scope.DisplayDate;
        }
    } else {
        //
        // Edit transaction
        //
        var transaction = AccountsFactory.getTransaction($stateParams.transactionId);
        $scope.inEditMode = true;
        $scope.currentItem = transaction;
        $scope.DisplayDate = moment(transaction.date).format('MMMM D, YYYY hh:mm a');
        PickTransactionServices.dateSelected = $scope.DisplayDate;
        PickTransactionServices.timeSelected = transaction.date; //epoch date from Firebase
        $scope.isTransfer = $scope.currentItem.istransfer;
        PickTransactionServices.typeDisplaySelected = $scope.currentItem.typedisplay;
        PickTransactionServices.typeInternalSelected = $scope.currentItem.type;
        PickTransactionServices.categorySelected = $scope.currentItem.category;
        PickTransactionServices.categoryid = $scope.currentItem.categoryid;
        PickTransactionServices.amountSelected = $scope.currentItem.amount;
        PickTransactionServices.payeeSelected = $scope.currentItem.payee;
        PickTransactionServices.payeeid = $scope.currentItem.payeeid;
        PickTransactionServices.accountFromSelected = $scope.currentItem.accountFrom;
        PickTransactionServices.accountFromId = $scope.currentItem.accountFromId;
        PickTransactionServices.accountToSelected = $scope.currentItem.accountTo;
        PickTransactionServices.accountToId = $scope.currentItem.accountToId;
        PickTransactionServices.noteSelected = $scope.currentItem.note;
        PickTransactionServices.photoSelected = $scope.currentItem.photo;
        if ($scope.currentItem.photo === '') {
            $scope.currentItem.photo = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        }
        if ($scope.currentItem.istransfer) {
            angular.copy($scope.currentItem, $scope.ItemOriginal);
        }
        $scope.TransactionTitle = "Edit Transaction";
    }

    // GET PAYEE
    // Make sure the transaction type (Expense, Income, Transfer) has been selected first
    $scope.getPayee = function () {
        if (typeof $scope.currentItem.typedisplay === 'undefined' || $scope.currentItem.typedisplay === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select Transaction Type"
            return;
        } else {
            $state.go('app.picktransactionpayee');
        }
    }

    // SAVE
    $scope.saveTransaction = function () {

        // Validate form data
        if (typeof $scope.currentItem.typedisplay === 'undefined' || $scope.currentItem.typedisplay === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select Transaction Type"
            return;
        }
        if (typeof $scope.currentItem.category === 'undefined' || $scope.currentItem.category === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select a Category"
            return;
        }
        if (typeof $scope.currentItem.payee === 'undefined' || $scope.currentItem.payee === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select a Payee"
            return;
        }
        if (typeof $scope.currentItem.amount === 'undefined' || $scope.currentItem.amount === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter an amount for this transaction"
            return;
        }
        if ($scope.ItemOriginal.istransfer) {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Transfers cannot be edited. You can delete it and enter it again!"
            return;
        }

        // Format date
        var dtTran = moment(PickTransactionServices.dateSelected, 'MMMM D, YYYY hh:mm').valueOf();
        $scope.currentItem.date = dtTran;

        if (typeof $scope.currentItem.date === 'undefined' || $scope.currentItem.date === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select a date for this transaction"
            return;
        }

        // Handle transaction type
        if ($scope.currentItem.typedisplay === "Transfer" && $stateParams.accountId === $scope.currentItem.accountToId) {
            $scope.currentItem.type = 'Income';
            $scope.currentItem.istransfer = true;
        } else if ($scope.currentItem.typedisplay === "Transfer" && $stateParams.accountId !== $scope.currentItem.accountToId) {
            $scope.currentItem.type = 'Expense';
            $scope.currentItem.istransfer = true;
        } else {
            $scope.currentItem.accountFrom = '';
            $scope.currentItem.accountFromId = '';
            $scope.currentItem.accountTo = '';
            $scope.currentItem.accountToId = '';
            $scope.currentItem.type = $scope.currentItem.typedisplay;
            $scope.currentItem.istransfer = false;
        }

        // Handle default blank photo
        if ($scope.currentItem.photo === 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==') {
            $scope.currentItem.photo = '';
            $scope.currentItem.isphoto = false;
        } else {
            $scope.currentItem.isphoto = true;
        }

        if ($scope.inEditMode) {
            //
            // Update Existing Transaction
            //
            var onComplete = function (error) {
                if (error) {
                    //console.log('Synchronization failed');
                }
            };
            AccountsFactory.saveTransaction($scope.currentItem);


            ////
            //// Update transaction under category
            ////
            //var categoryTransactionRef = AccountsFactory.getTransactionByCategoryRef($scope.currentItem.categoryid, $stateParams.transactionId);
            //var categoryTransaction = {
            //    payee: $scope.currentItem.payee,
            //    amount: $scope.currentItem.amount,
            //    date: $scope.currentItem.date,
            //    type: $scope.currentItem.type,
            //    iscleared: $scope.currentItem.iscleared
            //};
            //categoryTransactionRef.update(categoryTransaction, onComplete);
            ////
            //// Update transaction under payee
            ////
            //var payeeTransactionRef = AccountsFactory.getTransactionByPayeeRef($scope.currentItem.payeeid, $stateParams.transactionId);
            //var payeeTransaction = {
            //    payee: $scope.currentItem.payee,
            //    amount: $scope.currentItem.amount,
            //    date: $scope.currentItem.date,
            //    type: $scope.currentItem.type,
            //    iscleared: $scope.currentItem.iscleared
            //};
            //payeeTransactionRef.update(payeeTransaction, onComplete);


            //
            // Update payee-category relationship
            //
            var payee = {};
            var payeeRef = PayeesService.getPayeeRef($scope.currentItem.payeeid);
            if ($scope.currentItem.type === "Income") {
                payee = {
                    lastamountincome: $scope.currentItem.amount,
                    lastcategoryincome: $scope.currentItem.category,
                    lastcategoryidincome: $scope.currentItem.categoryid
                };
            } else if ($scope.currentItem.type === "Expense") {
                payee = {
                    lastamount: $scope.currentItem.amount,
                    lastcategory: $scope.currentItem.category,
                    lastcategoryid: $scope.currentItem.categoryid
                };
            }
            payeeRef.update(payee);

            //if ($scope.ItemOriginal.istransfer) {
            //    //
            //    // Update transfer relationship
            //    //
            //    if ($scope.currentItem.typedisplay !== "Transfer") {
            //        //
            //        // User changed transaction type from 'Transfer' to something else. Delete transfer-transaction if applicable.
            //        //
            //        var otherAccountId = '';
            //        if ($stateParams.accountId === $scope.ItemOriginal.accountToId) {
            //            otherAccountId = $scope.ItemOriginal.accountFromId;
            //        } else {
            //            otherAccountId = $scope.ItemOriginal.accountToId;
            //        }
            //        var transferRef = AccountsFactory.getTransactionRef(otherAccountId, $scope.ItemOriginal.linkedtransactionid);
            //        transferRef.remove();
            //        //
            //    } else {
            //        //
            //        // User DID NOT change transaction type but changed From/To accounts. Update both transactions in the transfer
            //        //
                    
            //    }
            //}
            $scope.inEditMode = false;
            //
        } else {
            //
            // Create New Transaction
            //
            if (isNaN($scope.currentItem.notes)) {
                $scope.currentItem.notes = "";
            }
            if (isNaN($scope.currentItem.photo)) {
                $scope.currentItem.photo = "";
            }
            // Set current house member
            $scope.currentItem.addedby = myCache.get('thisUserName');
            //
            AccountsFactory.createTransaction($stateParams.accountId, $scope.currentItem);
        }
        $scope.currentItem = {};
        $ionicHistory.goBack();
    }
});