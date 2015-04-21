var moneyleashapp = angular.module('moneyleash.controllers', [])
var fb = new Firebase("https://brilliant-inferno-1044.firebaseio.com/");

// APP
moneyleashapp.controller('AppCtrl', function ($scope) {

})

// WALKTHROUGH
moneyleashapp.controller('WalkthroughCtrl', function ($scope, $state) {
    $scope.goToLogIn = function () {
        $state.go('login');
    };

    $scope.goToSignUp = function () {
        $state.go('signup');
    };
})

moneyleashapp.controller("LoginController", function ($scope, $firebaseAuth, $state) {

    $scope.login = function(username, password) {
        var fbAuth = $firebaseAuth(fb);
        fbAuth.$authWithPassword({
            email: username,
            password: password
        }).then(function(authData) {
            $state.go('app.accounts');
        }).catch(function(error) {
            alert("ERROR: " + error);
        });
    }
 
    $scope.register = function(username, password) {
        var fbAuth = $firebaseAuth(fb);
        fbAuth.$createUser({email: username, password: password}).then(function() {
            return fbAuth.$authWithPassword({
                email: username,
                password: password
            });
        }).then(function(authData) {
            $state.go('app.accounts');
        }).catch(function(error) {
            alert("ERROR " + error);
        });
    }
 
})

moneyleashapp.controller('ForgotPasswordCtrl', function ($scope, $state) {
    $scope.recoverPassword = function () {
        $state.go('app.accounts');
    };

    $scope.goToLogIn = function () {
        $state.go('login');
    };

    $scope.goToSignUp = function () {
        $state.go('signup');
    };

    $scope.user = {};
})

// Account List Controller
moneyleashapp.controller('AccountsController', function ($scope, $state, $firebaseObject, $ionicPopup, $ionicListDelegate) {

    $scope.listCanSwipe = true;

    $scope.closeItem = function ($event) {
        $event.stopPropagation();
        $ionicListDelegate.closeOptionButtons();
    };

    $scope.itemClick = function () {
        console.info('itemClick');
        document.getElementById('click-notify').style.display = 'block';
        setTimeout(function () {
            document.getElementById('click-notify').style.display = 'none';
        }, 500);
    };

    $scope.data = {
        showDelete: false
    };

    $scope.edit = function (item) {
        alert('Edit Item: ' + item.title);
    };

    $scope.delete = function (item) {
        alert('delete Item: ' + item.title);
    };

    $scope.list = function () {
        fbAuth = fb.getAuth();
        if (fbAuth) {
            var syncObject = $firebaseObject(fb.child("users/" + fbAuth.uid));
            syncObject.$bindTo($scope, "data");
        }
    }

    $scope.create = function () {
        $ionicPopup.prompt({
            title: 'Enter a new ACCOUNT item',
            inputType: 'text'
        })
        .then(function (result) {
            if (result !== "") {
                if ($scope.data.hasOwnProperty("accounts") !== true) {
                    $scope.data.accounts = [];
                }
                $scope.data.accounts.push({ title: result });
            } else {
                console.log("Action not completed");
            }
        });
    }

    $scope.addAccount = function() {
        $state.go('app.accountmaintenance');
        //$scope.accounts.push({ title: 'New Account', id: 4 })
    }
})

// Single Account Controller
moneyleashapp.controller('AccountCtrl', function ($scope, $stateParams) {

})

// Recurring List Controller
moneyleashapp.controller('RecurringListCtrl', function ($scope) {
    
    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true

    $scope.recurringlist = [
        { title: 'Recurring1', id: 1 },
        { title: 'Recurring2', id: 2 },
        { title: 'Recurring3', id: 3 },
    ];

    $scope.addRecurringItem = function() {
        $scope.recurringlist.push({title: 'New Recurring', id: 4})
    }
})

// SETTINGS
moneyleashapp.controller('SettingsCtrl', function ($scope, $ionicActionSheet, $state) {
    $scope.airplaneMode = true;
    $scope.wifi = false;
    $scope.bluetooth = true;
    $scope.personalHotspot = true;

    $scope.checkOpt1 = true;
    $scope.checkOpt2 = true;
    $scope.checkOpt3 = false;

    $scope.radioChoice = 'B';

    // Triggered on a the logOut button click
    $scope.showLogOutMenu = function () {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            //Here you can add some more buttons
            // buttons: [
            // { text: '<b>Share</b> This' },
            // { text: 'Move' }
            // ],
            destructiveText: 'Logout',
            titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
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
                $state.go('login');
            }
        });

    };
})

// FORMS
moneyleashapp.controller('FormsCtrl', function ($scope) {

})

// PROFILE
moneyleashapp.controller('ProfileCtrl', function ($scope) {

})

// TINDER CARDS
moneyleashapp.controller('TinderCardsCtrl', function ($scope, $http) {

    $scope.cards = [];


    $scope.addCard = function (img, name) {
        var newCard = { image: img, name: name };
        newCard.id = Math.random();
        $scope.cards.unshift(angular.extend({}, newCard));
    };

    $scope.addCards = function (count) {
        $http.get('http://api.randomuser.me/?results=' + count).then(function (value) {
            angular.forEach(value.data.results, function (v) {
                $scope.addCard(v.user.picture.large, v.user.name.first + " " + v.user.name.last);
            });
        });
    };

    $scope.addFirstCards = function () {
        $scope.addCard("https://dl.dropboxusercontent.com/u/30675090/envato/tinder-cards/left.png", "Nope");
        $scope.addCard("https://dl.dropboxusercontent.com/u/30675090/envato/tinder-cards/right.png", "Yes");
    };

    $scope.addFirstCards();
    $scope.addCards(5);

    $scope.cardDestroyed = function (index) {
        $scope.cards.splice(index, 1);
        $scope.addCards(1);
    };

    $scope.transitionOut = function (card) {
        console.log('card transition out');
    };

    $scope.transitionRight = function (card) {
        console.log('card removed to the right');
        console.log(card);
    };

    $scope.transitionLeft = function (card) {
        console.log('card removed to the left');
        console.log(card);
    };
})


// BOOKMARKS
moneyleashapp.controller('BookMarksCtrl', function ($scope, $rootScope, BookMarkService, $state) {

    $scope.bookmarks = BookMarkService.getBookmarks();

    // When a new post is bookmarked, we should update bookmarks list
    $rootScope.$on("new-bookmark", function (event) {
        $scope.bookmarks = BookMarkService.getBookmarks();
    });

    $scope.goToFeedPost = function (link) {
        window.open(link, '_blank', 'location=yes');
    };
    $scope.goToWordpressPost = function (postId) {
        $state.go('app.post', { postId: postId });
    };
})

// SLIDER
moneyleashapp.controller('SliderCtrl', function ($scope, $http, $ionicSlideBoxDelegate) {

})

// WORDPRESS
moneyleashapp.controller('WordpressCtrl', function ($scope, $http, $ionicLoading, PostService, BookMarkService) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.totalPages = 1;

    $scope.doRefresh = function () {
        $ionicLoading.show({
            template: 'Loading posts...'
        });

        //Always bring me the latest posts => page=1
        PostService.getRecentPosts(1)
		.then(function (data) {

		    $scope.totalPages = data.pages;
		    $scope.posts = PostService.shortenPosts(data.posts);

		    $ionicLoading.hide();
		    $scope.$broadcast('scroll.refreshComplete');
		});
    };

    $scope.loadMoreData = function () {
        $scope.page += 1;

        PostService.getRecentPosts($scope.page)
		.then(function (data) {
		    //We will update this value in every request because new posts can be created
		    $scope.totalPages = data.pages;
		    var new_posts = PostService.shortenPosts(data.posts);
		    $scope.posts = $scope.posts.concat(new_posts);

		    $scope.$broadcast('scroll.infiniteScrollComplete');
		});
    };

    $scope.moreDataCanBeLoaded = function () {
        return $scope.totalPages > $scope.page;
    };

    $scope.bookmarkPost = function (post) {
        $ionicLoading.show({ template: 'Post Saved!', noBackdrop: true, duration: 1000 });
        BookMarkService.bookmarkWordpressPost(post);
    };

    $scope.doRefresh();
})

// WORDPRESS POST
moneyleashapp.controller('WordpressPostCtrl', function ($scope, $http, $stateParams, PostService, $ionicLoading) {

    $ionicLoading.show({
        template: 'Loading post...'
    });

    var postId = $stateParams.postId;
    PostService.getPost(postId)
	.then(function (data) {
	    $scope.post = data.post;
	    $ionicLoading.hide();
	});

    $scope.sharePost = function (link) {
        window.plugins.socialsharing.share('Check this post here: ', null, null, link);
    };
})


moneyleashapp.controller('ImagePickerCtrl', function ($scope, $rootScope, $cordovaCamera) {

    $scope.images = [];

    $scope.selImages = function () {

        window.imagePicker.getPictures(
			function (results) {
			    for (var i = 0; i < results.length; i++) {
			        console.log('Image URI: ' + results[i]);
			        $scope.images.push(results[i]);
			    }
			    if (!$scope.$$phase) {
			        $scope.$apply();
			    }
			}, function (error) {
			    console.log('Error: ' + error);
			}
		);
    };

    $scope.removeImage = function (image) {
        $scope.images = _.without($scope.images, image);
    };

    $scope.shareImage = function (image) {
        window.plugins.socialsharing.share(null, null, image);
    };

    $scope.shareAll = function () {
        window.plugins.socialsharing.share(null, null, $scope.images);
    };
})


// LAYOUTS
moneyleashapp.controller('LayoutsCtrl', function ($scope) {

})