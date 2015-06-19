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
                        val = '';
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

    .directive('showHideInput', function(){
	    return {
		    scope: {

		    },
		    link: function(scope, element, attrs) {
			    // listen to event
			    scope.$on("toggle-type", function(event, show){
				    var password_input = element[0];
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

;