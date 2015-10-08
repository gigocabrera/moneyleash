
// CATEGORY TRANSACTIONS CONTROLLER
moneyleashapp.controller('CategoryTransactionsController', function ($scope, $stateParams, PayeesService) {
    //$scope.transactionsbycategory = PayeesService.getTransactionsByCategory($stateParams.categoryid);
})

// PICK PARENT CATEGORY CONTROLLER
moneyleashapp.controller('PickParentCategoryController', function ($scope, $state, $ionicHistory, CategoriesFactory, PickParentCategoryService, PickCategoryTypeService) {
    if (PickCategoryTypeService.typeSelected === '') {
        $scope.ParentCategoryList = '';
    } else {
        $scope.ParentCategoryList = CategoriesFactory.getParentCategories(PickCategoryTypeService.typeSelected);
        $scope.ParentCategoryList.$loaded().then(function () {
            $scope.items = [];
            angular.forEach($scope.ParentCategoryList, function (category) {
                if (category.categoryparent === "") {
                    $scope.items.push(category);
                }
            })
        })
    };
    $scope.currentItem = { categoryname: PickParentCategoryService.parentcategorySelected };
    $scope.categorychanged = function (item) {
        PickParentCategoryService.updateParentCategory(item.categoryname);
        $ionicHistory.goBack();
    };
})

// PICK CATEGORYTYPE CONTROLLER
moneyleashapp.controller('PickCategoryTypeController', function ($scope, $state, $ionicHistory, PickCategoryTypeService) {
    $scope.CategoryTypeList = [
          { text: 'Income', value: 'Income' },
          { text: 'Expense', value: 'Expense' }];
    $scope.currentItem = { categorytype: PickCategoryTypeService.typeSelected };
    $scope.itemchanged = function (item) {
        PickCategoryTypeService.updateType(item.value);
        $ionicHistory.goBack();
    };
})

// CATEGORY CONTROLLER
moneyleashapp.controller('CategoryController', function ($scope, $state, $ionicHistory, $stateParams, CategoriesFactory, PickParentCategoryService, PickCategoryTypeService) {

    $scope.hideValidationMessage = true;
    $scope.inEditMode = false;
    $scope.allowParent = false;
    $scope.currentItem = {
        'categoryname': '',
        'categorytype': '',
        'categoryparent': '',
        'categorysort': ''
    };
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.hideValidationMessage = true;
        $scope.currentItem.categoryparent = PickParentCategoryService.parentcategorySelected;
        $scope.currentItem.categorytype = PickCategoryTypeService.typeSelected;
    });

    // EDIT / CREATE CATEGORY
    if ($stateParams.categoryid === '') {
        // create
        $scope.CategoryTitle = "Create Category";
    } else {
        // edit
        $scope.inEditMode = true;
        CategoriesFactory.getCategory($stateParams.categoryid, $stateParams.type).then(function (category) {
            $scope.currentItem = category;
            PickCategoryTypeService.typeSelected = $scope.currentItem.categorytype;
            PickParentCategoryService.parentcategorySelected = $scope.currentItem.categoryparent;
        });
        $scope.CategoryTitle = "Edit Category";
    }

    // SAVE
    $scope.saveCategory = function () {

        // Validate form data
        if (typeof $scope.currentItem.categoryname === 'undefined' || $scope.currentItem.categoryname === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please type a category name"
            return;
        }
        if (typeof $scope.currentItem.categorytype === 'undefined' || $scope.currentItem.categorytype === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select a category type"
            return;
        }

        if ($scope.currentItem.categoryparent === '') {
            $scope.currentItem.categorysort = $scope.currentItem.categoryname.toUpperCase();
        } else {
            $scope.currentItem.categorysort = $scope.currentItem.categoryparent.toUpperCase() + ":" + $scope.currentItem.categoryname.toUpperCase();
        }
        if ($scope.inEditMode) {
            // Update
            var onComplete = function (error) {
                if (error) {
                    //console.log('Synchronization failed');
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
        $ionicHistory.goBack();
    }
})

// CATEGORIES CONTROLLER
moneyleashapp.controller('CategoriesController', function ($scope, $state, $ionicListDelegate, $ionicActionSheet, CategoriesFactory, PickParentCategoryService, PickCategoryTypeService) {
  
    // SHOW FILTERS - ACTION SHEET
    $scope.moreOptions = function (category) {
        $ionicActionSheet.show({
            buttons: [
              { text: 'Show Transactions' }
            ],
            titleText: '<strong>FILTER</strong>',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
                $ionicListDelegate.closeOptionButtons();
            },
            buttonClicked: function (index) {
                $state.go('app.categorytransactions', { categoryid: category.$id });
                $ionicListDelegate.closeOptionButtons();
                return true;
            }
        });
    };

    // CREATE
    $scope.createCategory = function () {
        PickCategoryTypeService.typeSelected = '';
        PickParentCategoryService.parentcategorySelected = '';
        $state.go('app.category');
    }

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeAndTap = function ($event, category) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $state.go('app.category', { categoryid: category.$id, type: category.categorytype });
        }
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.list();
    });

    // GET CATEGORIES
    $scope.list = function () {
        $scope.expensecategories = CategoriesFactory.getCategoriesByTypeAndGroup('Expense');
        $scope.expensecategories.$loaded().then(function () {
        });
        $scope.incomecategories = CategoriesFactory.getCategoriesByTypeAndGroup('Income');
        $scope.incomecategories.$loaded().then(function () {
        });
    };

    // DELETE
    $scope.deleteCategory = function (category) {
        // Show the action sheet
        $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + category.categoryname + '? This will permanently delete the account from the app',
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
                if (category.categorytype === 'Income') {
                    $scope.incomecategories.$remove(category).then(function (newChildRef) {

                    })
                } else {
                    $scope.expensecategories.$remove(category).then(function (newChildRef) {
                        
                    })
                }
                return true;
            }
        });
    };
})