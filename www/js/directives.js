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
    // http://onehungrymind.com/angularjs-dynamic-templates/
    //
    .directive('contentItem', function ($compile) {
        var transactionTemplate = '<div class="entry-photo"><h2>&nbsp;</h2><div class="entry-img"><span><a href="{{rootDirectory}}{{content.data}}"><img ng-src="{{rootDirectory}}{{content.data}}" alt="entry photo"></a></span></div><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.description}}</div></div></div>';
        var dividerTemplate = '<div class="item item-divider SectionDivider" ion-affix data-affix-within-parent-with-class="ml_list" ng-class="{SectionDividerActive: group.isToday == true}">{{ group.label }}</div>';

        var getTemplate = function(contentType) {
            var template = '';

            switch(contentType) {
                case 'istransaction':
                    template = imageTemplate;
                    break;
                case 'isdivider':
                    template = videoTemplate;
                    break;
            }
            return template;
        }

        var linker = function(scope, element, attrs) {
            scope.rootDirectory = 'images/';

            element.html(getTemplate(scope.content.content_type)).show();

            $compile(element.contents())(scope);
        }

        return {
            restrict: "E",
            link: linker,
            scope: {
                content:'='
            }
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
            attr.$set('itemHeight', 'transaction.isDivider ? 24 : ' + height);

            element.children().attr('ng-hide', 'transaction.isDivider');
            element.prepend(
                '<div class="item item-divider SectionDivider ng-hide" ng-show="transaction.isDivider" ng-bind="transaction.divider"></div>'
            );
        }
    })

    //
    // http://forum.ionicframework.com/t/auto-focus-textbox-while-template-loads/6851/19
    //
    .directive('focusMe', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                $timeout(function () {
                    element[0].focus();
                }, 250);
            }
        };
    })

;