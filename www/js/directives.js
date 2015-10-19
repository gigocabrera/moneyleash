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

    // 
    // http://gonehybrid.com/how-to-group-items-in-ionics-collection-repeat/
    //
    .directive('dividerCollectionRepeat', function ($parse) {
        return {
            priority: 1001,
            compile: compile
        };

        function compile(element, attr) {
            var height = attr.itemHeight || '69';
            attr.$set('itemHeight', 'transaction.isDivider ? 32 : ' + height);

            element.children().attr('ng-hide', 'transaction.isDivider');
            element.prepend(
                '<div class="item item-divider DateDivider" ng-show="transaction.isDivider" ng-bind="transaction.divider"></div>'
            );
        }
    })

    // 
    // http://forum.ionicframework.com/t/focus-method-doesnt-work-on-input-textarea-etc/5606
    //
    .directive('focusMe', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                $timeout(function () {
                    element[0].focus();
                }, 650);
            }
        };
    })

    //
    // https://github.com/mhartington/ion-md-input
    //
    .directive('ionMdInput', function () {
        return {
            restrict: 'E',
            replace: true,
            require: '?ngModel',
            template: '<label class="item item-input item-md-label">' +
              '<input type="text" class="md-input">' +
              '<span class="input-label"></span>' +
              '<div class="highlight"></div>' +
              '</label>',
            compile: function (element, attr) {

                var highlight = element[0].querySelector('.highlight');
                var highlightColor;
                if (!attr.highlightColor) {
                    highlightColor = 'positive';
                } else {
                    highlightColor = attr.highlightColor;
                }
                highlight.className += ' highlight-' + highlightColor;

                var label = element[0].querySelector('.input-label');
                label.innerHTML = attr.placeholder;

                /*Start From here*/
                var input = element.find('input');
                angular.forEach({
                    'name': attr.name,
                    'type': attr.type,
                    'ng-value': attr.ngValue,
                    'ng-model': attr.ngModel,
                    'required': attr.required,
                    'ng-required': attr.ngRequired,
                    'ng-minlength': attr.ngMinlength,
                    'ng-maxlength': attr.ngMaxlength,
                    'ng-pattern': attr.ngPattern,
                    'ng-change': attr.ngChange,
                    'ng-trim': attr.trim,
                    'ng-blur': attr.ngBlur,
                    'ng-focus': attr.ngFocus,
                }, function (value, name) {
                    if (angular.isDefined(value)) {
                        input.attr(name, value);
                    }
                });

                var cleanUp = function () {
                    ionic.off('$destroy', cleanUp, element[0]);
                };
                // add listener
                ionic.on('$destroy', cleanUp, element[0]);

                return function LinkingFunction($scope, $element) {

                    var mdInput = $element[0].querySelector('.md-input');

                    var dirtyClass = 'used';

                    var reg = new RegExp('(\\s|^)' + dirtyClass + '(\\s|$)');

                    //Here is our toggle function
                    var toggleClass = function () {
                        if (this.value === '') {
                            this.className = mdInput.className.replace(reg, ' ');
                        } else {
                            this.classList.add(dirtyClass);
                        }
                    };

                    //Lets check if there is a value on load
                    ionic.DomUtil.ready(function () {
                        if (mdInput.value === '') {
                            mdInput.className = mdInput.className.replace(reg, ' ');
                        } else {
                            mdInput.classList.add(dirtyClass);
                        }
                    });
                    // Here we are saying, on 'blur', call toggleClass, on mdInput
                    ionic.on('blur', toggleClass, mdInput);

                };

            }
        };
    })

    //
    // http://blog.ionic.io/ios-9-potential-breaking-change/
    //
    .directive('ionRadioFix', function () {
        return {
            restrict: 'E',
            replace: true,
            require: '?ngModel',
            transclude: true,
            template:
              '<label class="item item-radio">' +
                '<input type="radio" name="radio-group">' +
                '<div class="radio-content">' +
                  '<div class="item-content disable-pointer-events" ng-transclude></div>' +
                  '<i class="radio-icon disable-pointer-events icon ion-checkmark"></i>' +
                '</div>' +
              '</label>',

            compile: function (element, attr) {
                if (attr.icon) {
                    var iconElm = element.find('i');
                    iconElm.removeClass('ion-checkmark').addClass(attr.icon);
                }

                var input = element.find('input');
                angular.forEach({
                    'name': attr.name,
                    'value': attr.value,
                    'disabled': attr.disabled,
                    'ng-value': attr.ngValue,
                    'ng-model': attr.ngModel,
                    'ng-disabled': attr.ngDisabled,
                    'ng-change': attr.ngChange,
                    'ng-required': attr.ngRequired,
                    'required': attr.required
                }, function (value, name) {
                    if (angular.isDefined(value)) {
                        input.attr(name, value);
                    }
                });

                return function (scope, element, attr) {
                    scope.getValue = function () {
                        return scope.ngValue || attr.value;
                    };
                };
            }
        };
    })

    //
    // https://github.com/rajeshwarpatlolla/my-angularjs-directives#standard-time-meridian
    //
    .directive('standardTimeMeridian', function () {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                etime: '=etime'
            },
            template: "<strong>{{stime}}</strong>",
            link: function (scope, elem, attrs) {

                scope.stime = epochParser(scope.etime, 'time');

                function prependZero(param) {
                    if (String(param).length < 2) {
                        return "0" + String(param);
                    }
                    return param;
                }

                function epochParser(val, opType) {
                    if (val === null) {
                        return "00:00";
                    } else {
                        var meridian = ['AM', 'PM'];

                        if (opType === 'time') {
                            var hours = parseInt(val / 3600);
                            var minutes = (val / 60) % 60;
                            var hoursRes = hours > 12 ? (hours - 12) : hours;

                            var currentMeridian = meridian[parseInt(hours / 12)];

                            return (prependZero(hoursRes) + ":" + prependZero(minutes) + " " + currentMeridian);
                        }
                    }
                }

                scope.$watch('etime', function (newValue, oldValue) {
                    scope.stime = epochParser(scope.etime, 'time');
                });

            }
        };
    })

;