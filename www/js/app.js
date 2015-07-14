
/* FIREBASE */
var fb = '';
fb = new Firebase("https://brilliant-inferno-1044.firebaseio.com");

// Ionic MoneyLeash App, v1.0
var moneyleashapp = angular.module('moneyleash', ['ionic', 'ngCordova', 'angular.filter', 'firebase', 'moneyleash.controllers', 'moneyleash.directives', 'moneyleash.factories', 'pascalprecht.translate', 'ion-affix', 'pickadate', 'jett.ionic.filter.bar'])

moneyleashapp.run(function ($ionicPlatform, $cordovaStatusbar, $rootScope, $ionicLoading, $state, Auth) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            //StatusBar.styleDefault();
            $cordovaStatusbar.overlaysWebView(true);
            //$cordovaStatusBar.style(1)
            $cordovaStatusbar.styleHex('#ED1C24');
        }
        $rootScope.settings = {
            'languages': [{
                'prefix': 'en',
                'name': 'English'
            }, {
                'prefix': 'es',
                'name': 'Español'
            }]
        };

        Auth.$onAuth(function (authData) {
            if (authData) {
                
            } else {
                $ionicLoading.hide();
                $state.go("intro");
            }
        });
        //$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        //    $ionicLoading.show({
        //        template: '<ion-spinner icon="ios"></ion-spinner><br>'
        //    });
        //});
        //$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        //    $ionicLoading.hide();
        //});
        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            if (error === "AUTH_REQUIRED") {
                $state.go("signin");
            }
        });
    });
})

moneyleashapp.config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, $translateProvider) {

    //$ionicConfigProvider.views.maxCache(0);

    /************************************/
    /* TRANSLATE                        */
    /************************************/
    $translateProvider.translations('en', {
        SIGNIN: "Login",
        REGISTER: "Register",
        LOGOUT: "Logout",
        FORGOT_PASSWORD: "Forgot password",
        RECOVER_PASSWORD: "Recover password",
        REGISTER_DONTHAVEACCOUNT: "I dont have an account",
        REGISTER_ALREADYHAVEACCOUNT: "I already have an account",
        FORM_EMAIL: "Email",
        FORM_PASSWORD: "Password",
        FORM_FIRSTNAME: "First Name",
        FORM_LASTNAME: "Last Name",
        TABS_NAME_DASHBOARD: "Dashboard",
        TABS_NAME_EXPENSES: "Expenses",
        TABS_NAME_MEMBERS: "Members",
        TABS_NAME_SETTINGS: "Settings",
        SETTINGS_LANGUAGE: "Change language",
        SETTINGS_EDIT_PROFILE: "Edit Profile",
        SETTINGS_QUIT_HOUSE: "Quit House",
        REGISTER_FORGOTPASSWORD: "Forgot password",
        PERSONALPROFILE: "Personal Profile",
        FORM_CREATED: "Created",
        FORM_UPDATED: "Updated",
    });
    $translateProvider.translations('es', {
        SIGNIN: "Ingresar",
        REGISTER: "Registrar",
        LOGOUT: "Desconectar",
        FORGOT_PASSWORD: "Perdió contraseña",
        RECOVER_PASSWORD: "Recobrar contraseña",
        REGISTER_DONTHAVEACCOUNT: "No tengo cuenta",
        REGISTER_ALREADYHAVEACCOUNT: "Tengo cuenta",
        FORM_EMAIL: "Correo",
        FORM_PASSWORD: "Contraseña",
        FORM_FIRSTNAME: "Nombre",
        FORM_LASTNAME: "Apellido",
        TABS_NAME_DASHBOARD: "Dashboard",
        TABS_NAME_EXPENSES: "Egresos",
        TABS_NAME_MEMBERS: "Miembros",
        TABS_NAME_SETTINGS: "Configuración",
        SETTINGS_LANGUAGE: "Cambiar lenguaje",
        SETTINGS_EDIT_PROFILE: "Modificar perfil",
        SETTINGS_QUIT_HOUSE: "Abandonar Casa",
        REGISTER_FORGOTPASSWORD: "Perdió contraseña",
        PERSONALPROFILE: "Perfil del Usuario",
        FORM_CREATED: "Creado",
        FORM_UPDATED: "Modificado"

    });
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");

    $stateProvider

      // INTRO
      .state('intro', {
          url: "/",
          templateUrl: "templates/intro.html",
          controller: 'IntroController'
      })

      // LOGIN
      .state('login', {
          url: "/login",
          templateUrl: "templates/login.html",
          controller: 'LoginController',
          resolve: {
              "currentAuth": ["Auth",
                  function (Auth) {
                      return Auth.$waitForAuth();
                  }]
          }
      })
    
      // REGISTER
      .state('register', {
          url: "/register",
          templateUrl: "templates/register.html",
          controller: 'RegisterController'
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

    // DASHBOARD
    .state('app.dashboard', {
        url: "/dashboard",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard.html",
                controller: 'DashboardController'
            }
        }
    })
    .state('app.itemdetailsview', {
        url: "/shirtsize",
        views: {
            'menuContent': {
                templateUrl: "templates/itemdetails.html",
                controller: "ItemDetailsCtrl"
            }
        }
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

    // TRANSACTIONS
    .state('app.transactionsByDay', {
        url: "/accounts/:accountId/:accountName",
        cache: true,
        views: {
            'menuContent': {
                templateUrl: "templates/transactionsDayDivider.html",
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

    // ACCOUNT TYPES
    .state('app.accounttypes', {
        url: "/accounttypes",
        views: {
            'menuContent': {
                templateUrl: "templates/accounttypes.html",
                controller: 'AccountTypesController'
            }
        }
    })
    .state('app.accountpreferences', {
        url: "/accountpreferences",
        views: {
            'menuContent': {
                templateUrl: "templates/settings-accountpreferences.html",
                controller: 'AccountPreferencesController'
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

    // PERSONAL PROFILE
    .state('app.personalprofile', {
        url: "/personalprofile",
        views: {
            'menuContent': {
                templateUrl: "templates/personalprofile.html",
                controller: 'PersonalProfileController'
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
