'use strict';

describe('ion-autocomplete single select', function () {

    var templateUrl = 'test/templates/test-template.html';

    var scope, document, compile, q, templateCache;

    // load the directive's module
    beforeEach(module('ionic', 'ion-autocomplete', templateUrl));

    beforeEach(inject(function ($rootScope, $document, $compile, $q, $templateCache) {
        scope = $rootScope.$new();
        document = $document;
        compile = $compile;
        q = $q;
        templateCache = $templateCache;
    }));

    afterEach(function () {
        // remove the autocomplete container from the dom after each test to have an empty body on each test start
        getSearchContainerElement().remove();
        angular.element(document[0].querySelector('div.backdrop')).remove();
        angular.element(document[0].querySelector('div.test-template-div')).remove();
    });

    it('must not initialize anything if the ng-model is not set on element directive', function () {
        compileElement('<ion-autocomplete />');

        // expect that no element is added to the body
        expect(getSearchContainerElement().length).toBe(0);
        expect(getSearchInputElement().length).toBe(0);
        expect(getCancelButtonElement().length).toBe(0);
    });

    it('must not initialize anything if the ng-model is not set on attribute directive', function () {
        compileElement('<input ion-autocomplete type="text" class="ion-autocomplete" />');

        // expect that no element is added to the body
        expect(getSearchContainerElement().length).toBe(0);
        expect(getSearchInputElement().length).toBe(0);
        expect(getCancelButtonElement().length).toBe(0);
    });

    it('must have the default values set on element directive', function () {
        var element = compileElement('<ion-autocomplete ng-model="model"/>');

        // expect the default values of the input field
        expect(element[0].type).toBe('text');
        expect(element[0].readOnly).toBe(true);
        expect(element.hasClass('ion-autocomplete')).toBe(true);
        expect(element[0].placeholder).toBe('');

        // expect the default values of the search input field
        var searchInputElement = getSearchInputElement();
        expect(searchInputElement[0].type).toBe('search');
        expect(searchInputElement.hasClass('ion-autocomplete-search')).toBe(true);
        expect(searchInputElement[0].placeholder).toBe('Click to enter a value...');

        // expect the default values of the cancel button
        var cancelButtonElement = getCancelButtonElement();
        expect(cancelButtonElement.hasClass('button')).toBe(true);
        expect(cancelButtonElement.hasClass('button-clear')).toBe(true);
        expect(cancelButtonElement[0].innerText).toBe('Cancel');
    });

    it('must have the default values set on attribute directive', function () {
        var element = compileElement('<input ion-autocomplete ng-model="model" type="text" readonly="readonly" class="ion-autocomplete" autocomplete="off" />');

        // expect the default values of the input field
        expect(element[0].type).toBe('text');
        expect(element[0].readOnly).toBe(true);
        expect(element.hasClass('ion-autocomplete')).toBe(true);
        expect(element[0].placeholder).toBe('');

        // expect the default values of the search input field
        var searchInputElement = getSearchInputElement();
        expect(searchInputElement[0].type).toBe('search');
        expect(searchInputElement.hasClass('ion-autocomplete-search')).toBe(true);
        expect(searchInputElement[0].placeholder).toBe('Click to enter a value...');

        // expect the placeholder icon element to no be platform dependent
        var placeholderIcon = getPlaceholderIconElement();
        expect(placeholderIcon.hasClass('ion-search')).toBe(true);

        // expect the default values of the cancel button
        var cancelButtonElement = getCancelButtonElement();
        expect(cancelButtonElement.hasClass('button')).toBe(true);
        expect(cancelButtonElement.hasClass('button-clear')).toBe(true);
        expect(cancelButtonElement[0].innerText).toBe('Cancel');
    });

    it('must show no value in the input field if the model is not defined', function () {
        var element = compileElement('<ion-autocomplete ng-model="model"/>');

        // expect the value of the input field to be empty
        expect(element[0].value).toBe('');
    });

    it('must show the value in the input field if the model is already defined', function () {
        scope.model = "123";
        var element = compileElement('<ion-autocomplete ng-model="model"/>');

        // expect the value of the input field to be already set
        expect(element[0].value).toBe('123');
    });

    it('must show the itemViewValueKey of the value in the input field if the model is already defined', function () {
        scope.model = {key: {value: "value1"}};
        var element = compileElement('<ion-autocomplete ng-model="model" item-view-value-key="key.value" />');

        // expect the value of the input field to be the evaluated itemViewValueKey expression on the model
        expect(element[0].value).toBe('value1');
    });

    it('must not show any value if the model is cleared', function () {
        scope.model = {key: {value: "value1"}};
        var element = compileElement('<ion-autocomplete ng-model="model" item-view-value-key="key.value" />');

        // expect the value of the input field to be the evaluated itemViewValueKey expression on the model
        expect(element[0].value).toBe('value1');

        // clear the model
        scope.model = undefined;
        scope.$digest();

        // expect the value of the input field to be cleared
        expect(element[0].value).toBe('');
    });

    it('must set the placeholder on the input field and on the search input field', function () {
        var placeholderValue = "placeholder value";
        var element = compileElement('<ion-autocomplete ng-model="model" placeholder="' + placeholderValue + '"/>');

        expect(element[0].placeholder).toBe(placeholderValue);
        expect(getSearchInputElement()[0].placeholder).toBe(placeholderValue);
    });

    it('must set the cancel label on the button', function () {
        var cancelLabelValue = "Cancel Button";
        compileElement('<ion-autocomplete ng-model="model" cancel-label="' + cancelLabelValue + '"/>');

        expect(getCancelButtonElement()[0].innerText).toBe(cancelLabelValue);
    });

    it('must get the proper item value', function () {
        var element = compileElement('<ion-autocomplete ng-model="model"/>');

        var itemValue = element.isolateScope().getItemValue("no-object");
        expect(itemValue).toBe("no-object");

        itemValue = element.isolateScope().getItemValue({key: "value"}, "key");
        expect(itemValue).toBe("value");

        itemValue = element.isolateScope().getItemValue({key: "value"});
        expect(itemValue).toEqual({key: "value"});
    });

    it('must get the proper item value with expressions', function () {
        var element = compileElement('<ion-autocomplete ng-model="model"/>');

        var itemValue = element.isolateScope().getItemValue({key: {value: "value1"}}, "key.value");
        expect(itemValue).toBe("value1");
    });

    it('must not call the items method if the passed query is undefined', function () {
        scope.itemsMethod = jasmine.createSpy("itemsMethod");
        var element = compileElement('<ion-autocomplete ng-model="model" items-method="itemsMethod(query)"/>');

        element.isolateScope().$digest();

        expect(scope.itemsMethod.calls.count()).toBe(0);
        expect(element.isolateScope().items.length).toBe(0);
    });

    it('must not call the items method if the passed query is empty', function () {
        scope.itemsMethod = jasmine.createSpy("itemsMethod");
        var element = compileElement('<ion-autocomplete ng-model="model" items-method="itemsMethod(query)"/>');

        element.isolateScope().searchQuery = "";
        element.isolateScope().$digest();

        expect(scope.itemsMethod.calls.count()).toBe(0);
        expect(element.isolateScope().items.length).toBe(0);
    });

    it('must call the items method if the passed query is valid', function () {
        scope.itemsMethod = function (query) {
            return [query, 'item2'];
        };
        spyOn(scope, 'itemsMethod').and.callThrough();
        var element = compileElement('<ion-autocomplete ng-model="model" items-method="itemsMethod(query)"/>');

        element.isolateScope().searchQuery = "asd";
        element.isolateScope().$digest();

        expect(scope.itemsMethod.calls.count()).toBe(1);
        expect(scope.itemsMethod).toHaveBeenCalledWith("asd");
        expect(element.isolateScope().items.length).toBe(2);
        expect(element.isolateScope().items).toEqual(['asd', 'item2']);
    });

    it('must call the items method if the passed query is valid and the componentId is set', function () {
        scope.itemsMethod = function (query, componentId) {
            return [query, componentId, 'item2'];
        };
        spyOn(scope, 'itemsMethod').and.callThrough();
        var element = compileElement('<ion-autocomplete ng-model="model" items-method="itemsMethod(query, componentId)" component-id="compId"/>');

        element.isolateScope().searchQuery = "asd";
        element.isolateScope().$digest();

        expect(scope.itemsMethod.calls.count()).toBe(1);
        expect(scope.itemsMethod).toHaveBeenCalledWith("asd", "compId");
        expect(element.isolateScope().items.length).toBe(3);
        expect(element.isolateScope().items).toEqual(['asd', 'compId', 'item2']);
    });

    it('must call the items method promise if the passed query is valid', function () {
        var deferred = q.defer();

        scope.itemsMethod = function (query) {
            return deferred.promise;
        };
        spyOn(scope, 'itemsMethod').and.callThrough();
        var element = compileElement('<ion-autocomplete ng-model="model" items-method="itemsMethod(query)"/>');

        element.isolateScope().searchQuery = "asd";
        element.isolateScope().$digest();

        expect(scope.itemsMethod.calls.count()).toBe(1);
        expect(scope.itemsMethod).toHaveBeenCalledWith("asd");
        expect(element.isolateScope().items.length).toBe(0);

        // resolve the promise
        deferred.resolve(['asd', 'item2']);
        element.isolateScope().$digest();

        expect(element.isolateScope().items.length).toBe(2);
        expect(element.isolateScope().items).toEqual(['asd', 'item2']);
    });

    it('must forward the items method promise error', function () {
        var deferred = q.defer();
        var errorFunction = jasmine.createSpy("errorFunction");

        // set the error function
        deferred.promise.then(function () {
        }, errorFunction);

        scope.itemsMethod = function (query) {
            return deferred.promise;
        };
        spyOn(scope, 'itemsMethod').and.callThrough();
        var element = compileElement('<ion-autocomplete ng-model="model" items-method="itemsMethod(query)"/>');

        element.isolateScope().searchQuery = "asd";
        element.isolateScope().$digest();

        expect(scope.itemsMethod.calls.count()).toBe(1);
        expect(scope.itemsMethod).toHaveBeenCalledWith("asd");
        expect(element.isolateScope().items.length).toBe(0);

        // resolve the promise
        deferred.reject('error');
        element.isolateScope().$digest();

        expect(errorFunction.calls.count()).toBe(1);
    });

    it('must show the search container when the input field is clicked', function () {
        var element = compileElement('<ion-autocomplete ng-model="model"/>');

        // expect that the search container has no display css attribute set
        expect(getSearchContainerElement().css('display')).toBe('');

        // click on the element
        element.triggerHandler('click');
        element.isolateScope().$digest();

        // expect that the search container has block set as display css attribute
        expect(getSearchContainerElement().css('display')).toBe('block');
    });

    it('must hide the search container when the cancel field is clicked', function () {
        var element = compileElement('<ion-autocomplete ng-model="model"/>');

        // expect that the search container has no display css attribute set
        expect(getSearchContainerElement().css('display')).toBe('');

        // click on the element
        element.triggerHandler('click');
        element.isolateScope().$digest();

        // expect that the search container has block set as display css attribute
        expect(getSearchContainerElement().css('display')).toBe('block');

        // click on the cancel button
        var cancelButtonElement = getCancelButtonElement();
        cancelButtonElement.triggerHandler('click');
        element.isolateScope().$digest();

        // expect that the search container has block set as display css attribute
        expect(getSearchContainerElement().css('display')).toBe('none');
    });

    it('must be able to set a templateUrl', function () {
        var template = templateCache.get(templateUrl);
        templateCache.put(templateUrl, template);

        var placeholder = "placeholder text"
        var element = compileElement('<ion-autocomplete ng-model="model" template-url="' + templateUrl + '" placeholder="' + placeholder + '"/>');

        // click on the element
        element.triggerHandler('click');
        element.isolateScope().$digest();

        // check that the new test template is shown
        expect(angular.element(document[0].querySelector('div#test-template-div')).css('display')).toBe('block');
        expect(angular.element(document[0].querySelector('div#test-template-div'))[0].innerText).toBe(placeholder);
    });

    /**
     * Compiles the given element and executes a digest cycle on the scope.
     *
     * @param element the element to compile
     * @returns {*} the compiled element
     */
    function compileElement(element) {
        var compiledElement = compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    /**
     * Gets the angular element for the autocomplete search container div
     * @returns {*} the search container element
     */
    function getSearchContainerElement() {
        return angular.element(document[0].querySelector('div.ion-autocomplete-container'))
    }

    /**
     * Gets the angular element for the autocomplete placer holder icon
     * @returns {*} the search placeholder icon element
     */
    function getPlaceholderIconElement() {
        return angular.element(document[0].querySelector('i.placeholder-icon'))
    }

    /**
     * Gets the angular element for the autocomplete search input field
     * @returns {*} the search input element
     */
    function getSearchInputElement() {
        return angular.element(document[0].querySelector('input.ion-autocomplete-search'))
    }

    /**
     * Gets the angular element for the autocomplete cancel button
     * @returns {*} the cancel button
     */
    function getCancelButtonElement() {
        return angular.element(document[0].querySelector('button'))
    }

});
