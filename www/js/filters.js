
    moneyleashapp.filter('reverselist', function () {
        function toArray(list) {
            var k, out = [];
            if (list) {
                if (angular.isArray(list)) {
                    out = list;
                }
                else if (typeof (list) === 'object') {
                    for (k in list) {
                        if (list.hasOwnProperty(k)) {
                            out.push(list[k]);
                        }
                    }
                }
            }
            return out;
        }
        return function (items) {
            return toArray(items).slice().reverse();
        };
    })

    moneyleashapp.filter('filtered', function (type) {
        return function (list) {
            var filtered = {};
            angular.forEach(list, function (transaction, id) {
                if (type === 'active') {
                    if (!transaction.iscleared) {
                        filtered[id] = transaction;
                    }
                } else if (type === 'cleared') {
                    if (transaction.iscleared) {
                        filtered[id] = transaction;
                    }
                } else {
                    filtered[id] = transaction;
                }
            });
            return filtered;
        };
    })

    // How To Group Items In Ionic's Collection-Repeat
    // http://gonehybrid.com/how-to-group-items-in-ionics-collection-repeat/
    .filter('groupByMonthYear', function ($parse) {
        var dividers = {};
        var transaction = '';
        return function (input) {
            if (!input || !input.length) return;
            var output = [],
				previousDate,
				currentDate;
            for (var i = 0, ii = input.length; i < ii && (transaction = input[i]) ; i++) {
                currentDate = moment(transaction.date);
                if (!previousDate ||
					currentDate.month() != previousDate.month() || currentDate.year() != previousDate.year()) {
                    var dividerId = currentDate.format('MMYYYY');
                    if (!dividers[dividerId]) {
                        dividers[dividerId] = {
                            isDivider: true,
                            divider: currentDate.format('MMMM YYYY')
                        };
                    }
                    output.push(dividers[dividerId]);
                }
                output.push(transaction);
                previousDate = currentDate;
            }
            return output;
        };
    })