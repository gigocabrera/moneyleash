
/* FIREBASE */
var fb = new Firebase("https://brilliant-inferno-1044.firebaseio.com");

// Ionic MoneyLeash App, v1.0
var moneyleashapp = angular.module('moneyleash', ['ionic', 'ngIOS9UIWebViewPatch', 'angular.filter', 'firebase', 'moneyleash.controllers', 'moneyleash.directives', 'moneyleash.factories', 'pickadate', 'jett.ionic.filter.bar', 'ngCordova', 'ionic-timepicker'])

moneyleashapp.run(function ($ionicPlatform, $rootScope, $ionicLoading, $state, Auth, $cordovaStatusbar, $cordovaSplashscreen) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        setTimeout(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
        }, 300);
        setTimeout(function () {
            $cordovaStatusbar.overlaysWebView(true);
            $cordovaStatusbar.style(2);
        }, 300);
        setTimeout(function () {
            $cordovaSplashscreen.hide()
        }, 3000);

        setTimeout(function () {
            $cordovaTouchID.checkSupport().then(function () {
                $cordovaTouchID.authenticate("You must authenticate").then(function () {
                    $state.go("login");
                }, function (error) {
                    console.log(JSON.stringify(error));
                });
            }, function (error) {
                console.log(JSON.stringify(error));
            });
        }, 5000);

        //Auth.$onAuth(function (authData) {
        //    if (authData) {
        //        //console.log("Logged in as:", authData);
        //        $rootScope.authData = authData;
        //    } else {
        //        $state.go("login");
        //    }
        //});

        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            if (error === "AUTH_REQUIRED") {
                $state.go("signin");
            }
        });
    });
})

moneyleashapp.config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider) {

    //$ionicConfigProvider.views.maxCache(0);
    $stateProvider

      // LOGIN
      .state('login', {
          url: "/",
          cache: false,
          templateUrl: "templates/login.html",
          controller: 'LoginController'
      })
    
      // REGISTER
      .state('register', {
          url: "/register",
          templateUrl: "templates/register.html",
          controller: 'RegisterController'
      })

      // HOUSE
      .state('housechoice', {
          url: '/housechoice',
          templateUrl: 'templates/house-choice.html',
          controller: 'HouseChoiceController'
      })
      .state('housecreate', {
          url: '/housecreate',
          templateUrl: 'templates/house-create.html',
          controller: 'HouseCreateController'
      })
      .state('housejoin', {
          url: '/housejoin',
          templateUrl: 'templates/house-join.html',
          controller: 'HouseJoinController'
      })

      // FORGOT PASSWORD
      .state('forgot-password', {
          url: "/forgot-password",
          templateUrl: "templates/forgot-password.html",
          controller: 'ForgotPasswordCtrl'
      })

      // APP
      .state('app', {
          url: "/app",
          abstract: true,
          templateUrl: "templates/side-menu.html",
          controller: 'AppCtrl'
      })

    // ACCOUNTS
    .state('app.accounts', {
        url: "/accounts",
        cache: true,
        views: {
            'menuContent': {
                templateUrl: "templates/accounts.html",
                controller: 'AccountsController'
            }
        }
    })
    .state('app.account', {
        url: "/accounts/account/:accountId/:isNew",
        views: {
            'menuContent': {
                templateUrl: "templates/account.html",
                controller: 'AccountController'
            }
        }
    })
    .state('app.pickaccountdate', {
        url: "/pickaccountdate",
        views: {
            'menuContent': {
                templateUrl: "templates/pickaccountdate.html",
                controller: "PickAccountDateController"
            }
        }
    })
    .state('app.pickaccounttype', {
        url: "/pickaccounttype",
        views: {
            'menuContent': {
                templateUrl: "templates/pickaccounttype.html",
                controller: "PickAccountTypeController"
            }
        }
    })

    // TRANSACTIONS
    .state('app.transactions', {
        url: "/accounts/:accountId/:accountName",
        cache: true,
        views: {
            'menuContent': {
                templateUrl: "templates/transactions.html",
                controller: 'TransactionsController'
            }
        }
    })
    .state('app.transaction', {
        url: "/transactions/:accountId/:accountName/:transactionId",
        views: {
            'menuContent': {
                templateUrl: "templates/transaction.html",
                controller: 'TransactionController'
            }
        }
    })
    .state('app.picktransactiontype', {
        url: "/picktransactiontype",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactiontype.html",
                controller: "PickTransactionTypeController"
            }
        }
    })
    .state('app.picktransactionaccountfrom', {
        url: "/picktransactionaccountfrom",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactionaccountfrom.html",
                controller: "PickTransactionAccountFromController"
            }
        }
    })
    .state('app.picktransactionaccountto', {
        url: "/picktransactionaccountto",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactionaccountto.html",
                controller: "PickTransactionAccountToController"
            }
        }
    })
    .state('app.picktransactionpayee', {
        url: "/picktransactionpayee",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactionpayee.html",
                controller: "PickTransactionPayeeController"
            }
        }
    })
    .state('app.picktransactioncategory', {
        url: "/picktransactioncategory",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactioncategory.html",
                controller: "PickTransactionCategoryController"
            }
        }
    })
    .state('app.picktransactiondate', {
        url: "/picktransactiondate",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactiondate.html",
                controller: "PickTransactionDateController"
            }
        }
    })
    .state('app.picktransactionamount', {
        url: "/picktransactionamount",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactionamount.html",
                controller: "PickTransactionAmountController"
            }
        }
    })
    .state('app.picktransactionphoto', {
        url: "/picktransactionphoto",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactionphoto.html",
                controller: "PickTransactionPhotoController"
            }
        }
    })
    .state('app.picktransactionnote', {
        url: "/picktransactionnote",
        views: {
            'menuContent': {
                templateUrl: "templates/picktransactionnote.html",
                controller: "PickTransactionNoteController"
            }
        }
    })

    // RECURRING
    .state('app.recurring', {
        url: "/recurring",
        views: {
            'menuContent': {
                templateUrl: "templates/recurring.html",
                controller: 'RecurringController'
            }
        }
    })

    // CATEGORIES
    .state('app.categories', {
        url: "/categories",
        views: {
            'menuContent': {
                templateUrl: "templates/categories.html",
                controller: 'CategoriesController'
            }
        }
    })
    .state('app.category', {
        url: "/category/:categoryid/:type",
        views: {
            'menuContent': {
                templateUrl: "templates/category.html",
                controller: 'CategoryController'
            }
        }
    })
    .state('app.pickcategorytype', {
        url: "/pickcategorytype",
        views: {
            'menuContent': {
                templateUrl: "templates/pickcategorytype.html",
                controller: "PickCategoryTypeController"
            }
        }
    })
    .state('app.pickparentcategory', {
        url: "/pickparentcategory",
        views: {
            'menuContent': {
                templateUrl: "templates/pickparentcategory.html",
                controller: "PickParentCategoryController"
            }
        }
    })
    .state('app.categorytransactions', {
        url: "/categorytransactions/:categoryid",
        views: {
            'menuContent': {
                templateUrl: "templates/categorytransactions.html",
                controller: 'CategoryTransactionsController'
            }
        }
    })

    // PAYEES
    .state('app.payees', {
        url: "/payees",
        views: {
            'menuContent': {
                templateUrl: "templates/payees.html",
                controller: "PayeesController"
            }
        }
    })
    .state('app.payee', {
        url: "/payees/:payeeid",
        views: {
            'menuContent': {
                templateUrl: "templates/payee.html",
                controller: 'PayeeController'
            }
        }
    })
    .state('app.payeetransactions', {
        url: "/payeetransactions/:payeeid",
        views: {
            'menuContent': {
                templateUrl: "templates/payeetransactions.html",
                controller: 'PayeeTransactionsController'
            }
        }
    })
    
    // BUDGETS
    .state('app.budgets', {
        url: "/budgets",
        views: {
            'menuContent': {
                templateUrl: "templates/budgets.html"
            }
        }
    })

    // REPORTS
    .state('app.reports', {
        url: "/reports",
        views: {
            'menuContent': {
                templateUrl: "templates/reports.html"
            }
        }
    })

    // SETTINGS
    .state('app.settings', {
        url: "/settings",
        views: {
            'menuContent': {
                templateUrl: "templates/settings.html",
                controller: 'SettingsController'
            }
        }
    })
    .state('app.personalprofile', {
        url: "/personalprofile",
        views: {
            'menuContent': {
                templateUrl: "templates/personalprofile.html",
                controller: 'PersonalProfileController'
            }
        }
    })
    .state('app.accounttypes', {
        url: "/accounttypes",
        views: {
            'menuContent': {
                templateUrl: "templates/accounttypes.html",
                controller: 'AccountTypesController'
            }
        }
    })
    .state('app.accountsettings', {
        url: "/accountsettings",
        views: {
            'menuContent': {
                templateUrl: "templates/accountsettings.html",
                controller: 'AccountSettingsController'
            }
        }
    })
    .state('app.picksettingsdefaultdate', {
        url: "/picksettingsdefaultdate",
        views: {
            'menuContent': {
                templateUrl: "templates/picksettingsdefaultdate.html",
                controller: "PickSettingsDefaultDateController"
            }
        }
    })
    .state('app.picksettingsdefaultbalance', {
        url: "/picksettingsdefaultbalance",
        views: {
            'menuContent': {
                templateUrl: "templates/picksettingsdefaultbalance.html",
                controller: "PickSettingsDefaultBalanceController"
            }
        }
    })

    // ABOUT
    .state('app.about', {
        url: "/about",
        views: {
            'menuContent': {
                templateUrl: "templates/about.html",
                controller: 'AboutController'
            }
        }
    })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/');
});
