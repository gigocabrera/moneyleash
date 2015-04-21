var app = angular.module('moneyleash.services', []);

app.service('UserService', function () {
    var myEmail = '';
    this.setEmail = function (email) {
        myEmail = email;
    }
    this.getEmail = function () {
        return myEmail;
    }
    var myUserId = '';
    this.setUserId = function (id) {
        myUserId = id;
    }
    this.getUserId = function () {
        return myUserId;
    }
});