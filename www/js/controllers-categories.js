
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
moneyleashapp.controller('CategoryController', function ($scope, $state, $ionicHistory, CategoriesFactory, PickCategoryService, PickCategoryTypeService) {

    $scope.inEditMode = false;
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
    if ($scope.inEditMode) {
        // Edit Category
        //AccountsFactory.getCategory($stateParams.accountId, $stateParams.transactionId).then(function (category) {
        //    $scope.currentItem = category;
        //});
        $scope.CategoryTitle = "Edit Category";
    } else {
        $scope.CategoryTitle = "Create Category";
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
            //var transactionRef = AccountsFactory.getCategoryRef($stateParams.accountId, $stateParams.transactionId);
            //transactionRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
            console.log("saving edited");
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
moneyleashapp.controller('CategoriesController', function ($scope, $state, $ionicHistory, CategoriesFactory, PickCategoryService, PickCategoryTypeService) {
  
    // CREATE
    $scope.createCategory = function (title) {
        PickCategoryTypeService.typeSelected = '';
        PickCategoryService.categorySelected = '';
        $state.go('app.category');
    }

    // GET CATEGORIES
    $scope.groups = [];
    $scope.categories = CategoriesFactory.getCategoriesByTypeAndGroup('Expense');
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

})