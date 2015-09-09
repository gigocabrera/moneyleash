angular.module('ion-sticky', ['ionic'])
    .directive('ionSticky', ['$ionicPosition', '$compile', '$timeout', function ($ionicPosition, $compile, $timeout) {
        return {
            restrict: 'A',
            require: '^$ionicScroll',
            link: function ($scope, $element, $attr, $ionicScroll) {
                var scroll = angular.element($ionicScroll.element);
                var clone;
                // creates the sticky clone and adds it to DOM
                var createStickyClone = function ($element) {
                    clone = $element.clone().css({
                        position: 'absolute',
                        top: $ionicPosition.position(scroll).top + "px",
                        left: 0,
                        right: 0
                    });
                    clone[0].className += " assertive";

                    clone.removeAttr('ng-repeat-start');
                    clone.removeAttr('ng-if');

                    scroll.parent().append(clone);

                    // compile the clone so that anything in it is in Angular lifecycle.
                    $compile(clone)($scope);
                };

                var removeStickyClone = function () {
                    if (clone)
                        clone.remove();
                    clone = null;
                };

                $scope.$on("$destroy", function () {
                    // remove the clone, unbind the scroll listener
                    removeStickyClone();
                    angular.element($ionicScroll.element).off('scroll');
                });

                var lastActive;
                var updateSticky = ionic.throttle(function () {
                    var active = null;
                    var dividers = [];
                    var tmp = $element[0].getElementsByClassName("item-divider");
                    for (var i = 0; i < tmp.length; ++i) dividers.push(angular.element(tmp[i]));
                    if (dividers.length == 0) return;
                    if (!clone) createStickyClone(angular.element(dividers[0][0]))
                    dividers.sort(function (a, b) { return $ionicPosition.offset(a).top - $ionicPosition.offset(b).top; });
                    var sctop = $ionicPosition.offset(scroll).top;
                    if ($ionicPosition.offset(dividers[0]).top - sctop - dividers[0].prop('offsetHeight') > 0) {
                        var letter = dividers[0][0].innerHTML.trim();
                        var i = $scope.letters.indexOf(letter);
                        if (i == 0) return;
                        active = $scope.letters[i - 1];
                    } else for (var i = 0; i < dividers.length; ++i) { // can be changed to binary search
                        if ($ionicPosition.offset(dividers[i]).top - sctop - dividers[i].prop('offsetHeight') < 0) { // this equals to jquery outerHeight
                            if (i === dividers.length - 1 || $ionicPosition.offset(dividers[i + 1]).top - sctop -
                                 (dividers[i].prop('offsetHeight') + dividers[i + 1].prop('offsetHeight')) > 0) {
                                active = dividers[i][0].innerHTML.trim();
                                break;
                            }
                        }
                    }
                    if (lastActive != active) {
                        if (active) clone[0].innerHTML = active;

                        if (lastActive) {
                            var e = scroll.parent()[0].getElementsByClassName(lastActive);
                            if (e && e[0]) e[0].className = e[0].className.replace(/assertive/g, '');
                        }
                        if (active) {
                            var e = scroll.parent()[0].getElementsByClassName(active);
                            if (e && e[0]) e[0].className += " assertive";
                        }
                        lastActive = active;
                    }
                }, 200);
                scroll.on('scroll', function (event) {
                    updateSticky();
                });
            }
        }
    }]);
