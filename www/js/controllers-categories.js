
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

    $scope.inEditMode = false;
    $scope.allowParent = false;
    $scope.currentItem = {
        'categoryname': '',
        'categorytype': '',
        'categoryparent': '',
        'categorysort': ''
    };
    $scope.$on('$ionicView.beforeEnter', function () {
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
moneyleashapp.controller('CategoriesController', function ($scope, $filter, $state, $ionicHistory, $ionicListDelegate, $ionicActionSheet, CategoriesFactory, PickParentCategoryService, PickCategoryTypeService) {
  
    // CREATE
    $scope.createCategory = function () {
        PickCategoryTypeService.typeSelected = '';
        PickParentCategoryService.parentcategorySelected = '';
        $state.go('app.category');
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

    // GET CATEGORIES
    $scope.list = function () {
        $scope.expensecategories = CategoriesFactory.getCategoriesByTypeAndGroup('Expense');
        $scope.expensecategories.$loaded().then(function () {
        });
        $scope.incomecategories = CategoriesFactory.getCategoriesByTypeAndGroup('Income');
        $scope.incomecategories.$loaded().then(function () {
        });
    };

    // EDIT
    $scope.editCategory = function ($event, category) {
        $ionicListDelegate.closeOptionButtons();
        $state.go('app.category', { categoryid: category.$id, type: category.categorytype });
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
                        newChildRef.key() === category.$id;
                    })
                } else {
                    $scope.expensecategories.$remove(category).then(function (newChildRef) {
                        newChildRef.key() === category.$id;
                    })
                }
                return true;
            }
        });
    };

})