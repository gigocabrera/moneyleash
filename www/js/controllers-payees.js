
// PAYEE CONTROLLER
moneyleashapp.controller('PayeeController', function ($scope, $state, $ionicHistory, $stateParams, PayeesFactory) {

    $scope.inEditMode = false;
    $scope.currentItem = {
        'payeename': $scope.data.search,
        'lastcategory': '',
        'lastcategoryid': '',
        'lastamount': ''
    };

    // EDIT / CREATE CATEGORY
    if ($stateParams.categoryid === '') {
        // create
        $scope.CategoryTitle = "Add Payee";
    } else {
        // edit
        $scope.inEditMode = true;
        CategoriesFactory.getCategory($stateParams.categoryid, $stateParams.type).then(function (category) {
            $scope.currentItem = category;
            PickCategoryTypeService.typeSelected = $scope.currentItem.categorytype;
            PickParentCategoryService.parentcategorySelected = $scope.currentItem.categoryparent;
        });
        $scope.CategoryTitle = "Edit Payee";
    }

    // SAVE
    $scope.saveCategory = function () {
        if ($scope.currentItem.categoryparent === '') {
            $scope.currentItem.categorysort = $scope.currentItem.categoryname;
        } else {
            $scope.currentItem.categorysort = $scope.currentItem.categoryparent + ":" + $scope.currentItem.categoryname;
        }
        if ($scope.inEditMode) {
            // Update
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                }
            };
            var categoryRef = CategoriesFactory.getCategoryRef($stateParams.categoryid, $stateParams.type);
            categoryRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
        } else {
            // Create
            var sync = CategoriesFactory.getCategories($scope.currentItem.categorytype);
            sync.$add($scope.currentItem).then(function (newChildRef) {
                $scope.currentItem = {
                    accountid: newChildRef.key()
                };
            });
        }
        $scope.currentItem = {};
        $state.go('app.categories');
    }
})

// CATEGORIES CONTROLLER
moneyleashapp.controller('PayeesController', function ($scope, $filter, $state, $ionicListDelegate, $ionicActionSheet, PayeesFactory) {
  
    // CREATE
    $scope.createPayee = function () {
        $state.go('app.payee');
    }

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeAndTap = function ($event, transaction) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {}
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.list();
    });

    // GET PAYEES
    $scope.list = function () {
        $scope.payees = PayeesFactory.getPayees();
        $scope.payees.$loaded().then(function () {

        });
    };

    // EDIT
    $scope.editPayee = function ($event, payee) {
        $ionicListDelegate.closeOptionButtons();
        $state.go('app.payee', { payeeid: payee.$id });
    };

    // DELETE
    $scope.deletePayee = function (payee) {
        // Show the action sheet
        $ionicActionSheet.show({
            destructiveText: 'Delete Payee',
            titleText: 'Are you sure you want to delete ' + payee.payeename + '? This will permanently delete the payee from the app',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                var myButton = index;
                return true;
            },
            destructiveButtonClicked: function () {
                $ionicListDelegate.closeOptionButtons();
                $scope.payees.$remove(payee).then(function (newChildRef) {
                    newChildRef.key() === payee.$id;
                })
                return true;
            }
        });
    };
})