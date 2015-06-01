angular.module('moneyleash.directives', [])

    // Force numbers only
    .directive('validNumber', function () {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                if (!ngModelCtrl) {
                    return;
                }
                ngModelCtrl.$parsers.push(function (val) {
                    if (angular.isUndefined(val)) {
                        var val = '';
                    }
                    var clean = val.replace(/[^0-9\.]/g, '');
                    var decimalCheck = clean.split('.');
                    if (!angular.isUndefined(decimalCheck[1])) {
                        decimalCheck[1] = decimalCheck[1].slice(0, 2);
                        clean = decimalCheck[0] + '.' + decimalCheck[1];
                    }
                    if (val !== clean) {
                        ngModelCtrl.$setViewValue(clean);
                        ngModelCtrl.$render();
                    }
                    return clean;
                });
                element.bind('keypress', function (event) {
                    if (event.keyCode === 32) {
                        event.preventDefault();
                    }
                });
            }
        };
    })

    // Dynamically switch an icon
    // http://codepen.io/calendee/pen/wDfBC
    .directive('iconSwitcher', function() {
        return {
            restrict : 'A',
            link : function(scope, elem, attrs) {
                var currentState = true;
                elem.on('click', function() {       
                    if(currentState === true) {
                        angular.element(elem).removeClass(attrs.onIcon);
                        angular.element(elem).addClass(attrs.offIcon);
                    } else {
                        angular.element(elem).removeClass(attrs.offIcon);
                        angular.element(elem).addClass(attrs.onIcon);
                    }
                    currentState = !currentState
                });
            }
        };
    })

    .directive('dividerCollectionRepeat', function($parse) {
        return {
            priority: 1001,
            compile: compile
        };
        function compile(element, attr) {
            var height = attr.itemHeight || '62';
            attr.$set('itemHeight', 'transaction.isDivider ? 35 : ' + height);
            element.children().attr('ng-hide', 'transaction.isDivider');
            element.prepend(
				'<div class="item item-divider SectionDivider ng-hide" ng-show="transaction.isDivider" ng-bind="transaction.divider"></div>'
			);
        }
    })

    .directive('myformat', function(dateFilter) {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(viewValue) {
                    return dateFilter(viewValue, 'MMMM dd, yyyy');
                });
            }
        }
    })

    .directive('myTabs', function() {
	    return {
		    restrict: 'E',
		    transclude: true,
		    scope: {},
		    controller: function($scope) {
			    var tabs = $scope.tabs = [];

			    $scope.select = function(tab) {
				    angular.forEach(tabs, function(tab) {
					    tab.selected = false;
				    });
				    tab.selected = true;
				    $scope.$emit('my-tabs-changed', tab);
			    };

			    this.addTab = function(tab) {
				    if (tabs.length === 0) {
					    $scope.select(tab);
				    }
				    tabs.push(tab);
			    };
		    },
		    templateUrl: 'partials/my-tabs.html'
	    };
    })

    .directive('myTab', function() {
	    return {
		    require: '^myTabs',
		    restrict: 'E',
		    transclude: true,
		    scope: {
			    title: '@'
		    },
		    link: function(scope, element, attrs, tabsCtrl) {
			    tabsCtrl.addTab(scope);
		    },
		    templateUrl: 'partials/my-tab.html'
	    };
    })

    .directive('showHideContainer', function(){
	    return {
		    scope: {

		    },
		    controller: function($scope, $element, $attrs) {
			    $scope.show = false;

			    $scope.toggleType = function($event){
				    $event.stopPropagation();
				    $event.preventDefault();

				    $scope.show = !$scope.show;

				    // Emit event
				    $scope.$broadcast("toggle-type", $scope.show);
			    };
		    },
		    templateUrl: 'partials/show-hide-password.html',
		    restrict: 'A',
		    replace: false,
		    transclude: true
	    };
    })

    .directive('showHideInput', function(){
	    return {
		    scope: {

		    },
		    link: function(scope, element, attrs) {
			    // listen to event
			    scope.$on("toggle-type", function(event, show){
				    var password_input = element[0],
						    input_type = password_input.getAttribute('type');

				    if(!show)
				    {
					    password_input.setAttribute('type', 'password');
				    }

				    if(show)
				    {
					    password_input.setAttribute('type', 'text');
				    }
			    });
		    },
		    require: '^showHideContainer',
		    restrict: 'A',
		    replace: false,
		    transclude: false
	    };
    })


    .directive('biggerText', function($ionicGesture) {
	    return {
		    restrict: 'A',
		    link: function(scope, element, attrs) {
			    $ionicGesture.on('touch', function(event){
				    event.stopPropagation();
				    event.preventDefault();

				    var text_element = document.querySelector(attrs.biggerText),
						    root_element = document.querySelector(".menu-content"),
						    current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
						    current_size = parseFloat(current_size_str),
						    new_size = Math.min((current_size+2), 24),
						    new_size_str = new_size + 'px';

				    root_element.classList.remove("post-size-"+current_size_str);
				    root_element.classList.add("post-size-"+new_size_str);
			    }, element);
		    }
	    };
    })

    .directive('smallerText', function($ionicGesture) {
	    return {
		    restrict: 'A',
		    link: function(scope, element, attrs) {
			    $ionicGesture.on('touch', function(event){
				    event.stopPropagation();
				    event.preventDefault();

				    var text_element = document.querySelector(attrs.smallerText),
				    root_element = document.querySelector(".menu-content"),
				    current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
				    current_size = parseFloat(current_size_str),
				    new_size = Math.max((current_size-2), 12),
				    new_size_str = new_size + 'px';

				    root_element.classList.remove("post-size-"+current_size_str);
				    root_element.classList.add("post-size-"+new_size_str);
			    }, element);
		    }
	    };
    })

    //http://stackoverflow.com/questions/27742394/reusable-modal-in-angular-ionic
    .directive('myNumberPad', ['$ionicModal', function ($ionicModal) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'partials',
            scope: {
                externalScope : "="
            },
            link: function ($scope, $element, $attrs) {

                $ionicModal.fromTemplateUrl('my-numberpad.html', {
                    scope: $scope.externalScope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal
                });
                $scope.externalScope.openModal = function () {
                    $scope.modal.show()
                };
            }
        };
    }])

;