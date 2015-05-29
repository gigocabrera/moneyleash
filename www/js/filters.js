
moneyleashapp.filter('reverse', function () {
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

moneyleashapp.filter('transactionsFilter', function (type) {
    return function (input) {
        var filtered = {};
        angular.forEach(input, function (transaction, id) {
            if (type === 'active') {
                if (!transaction.iscleared) {
                    filtered[id] = transaction;
                }
            } else if (path === '/cleared') {
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