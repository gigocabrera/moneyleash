
// PICK CATEGORY CONTROLLER
moneyleashapp.controller('PickCategoryController', function ($scope, $state, $ionicHistory, CategoriesFactory, PickCategoryService, PickCategoryTypeService) {

    if (PickCategoryTypeService.typeSelected === '') {
        $scope.CategoryList = '';
    } else {
        $scope.CategoryList = CategoriesFactory.getCategories(PickCategoryTypeService.typeSelected);
    }
    $scope.currentItem = { categoryparent: PickCategoryService.cat };
    $scope.categorychanged = function (item) {
        PickCategoryService.updateCategory(item.categoryname);
        console.log(item.categoryname);
        $ionicHistory.goBack();
    };
})

// PICK CATEGORYTYPE CONTROLLER
moneyleashapp.controller('PickCategoryTypeController', function ($scope, $state, $ionicHistory, PickCategoryTypeService) {
    $scope.CategoryTypeList = [
          { text: 'Income', value: 'Income' },
          { text: 'Expense', value: 'Expense' }];

    $scope.currentItem = { categorytype: PickCategoryTypeService.type };
    $scope.itemchanged = function (item) {
        PickCategoryTypeService.updateType(item.value);
        $ionicHistory.goBack();
    };
})

// CATEGORY CONTROLLER
moneyleashapp.controller('CategoryController', function ($scope, $state, $ionicHistory, $stateParams, CategoriesFactory, PickCategoryService, PickCategoryTypeService) {

    $scope.inEditMode = false;
    $scope.allowParent = false;
    $scope.typeSelected = '';
    $scope.currentItem = {
        'categoryname': '',
        'categorytype': '',
        'categoryparent': ''
    };
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.currentItem.categoryparent = PickCategoryService.categorySelected;
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
            console.log(category);
        });
        $scope.CategoryTitle = "Edit Category";
    }

    // SAVE
    $scope.saveCategory = function (currentItem) {
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
moneyleashapp.controller('CategoriesController', function ($scope, $state, $ionicHistory, $ionicListDelegate, $ionicActionSheet, CategoriesFactory, PickCategoryService, PickCategoryTypeService) {
  
    // CREATE
    $scope.createCategory = function (title) {
        PickCategoryTypeService.typeSelected = '';
        PickCategoryService.categorySelected = '';
        $state.go('app.category');
    }

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeAndTap = function ($event, transaction) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            // TODO: Add filter by payee option
        }
    };

    // GET CATEGORIES
    $scope.list = function () {
        $scope.categories = CategoriesFactory.getCategoriesByTypeAndGroup('Expense');
        $scope.groups = [];
        $scope.categories.$loaded().then(function () {
            var currentCategory = '_DEFAULT_';
            var group = {};
            angular.forEach($scope.categories, function (category) {
                currentCategory = category.categoryparent;
                if (currentCategory == "") {
                    group = {
                        name: category.categoryname,
                        items: []
                    };
                    $scope.groups.push(group);
                } else {
                    if (category.categoryparent == currentCategory) {
                        group.items.push(category);
                    }
                }
            })
        })
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
            titleText: 'Are you sure you want to delete ' + category.categoryname + '? This will permanently delete the account from the app.',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                //Called when one of the non-destructive buttons is clicked,
                //with the index of the button that was clicked and the button object.
                //Return true to close the action sheet, or false to keep it opened.
                return true;
            },
            destructiveButtonClicked: function () {
                //Called when the destructive button is clicked.
                //Return true to close the action sheet, or false to keep it opened.
                $ionicListDelegate.closeOptionButtons();
                $scope.categories.$remove(category).then(function (newChildRef) {
                    newChildRef.key() === category.$id;
                })
                return true;
            }
        });
    };

})