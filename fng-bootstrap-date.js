(function () {
    'use strict';

    var uiBootstrapDateModule = angular.module('fng.uiBootstrapDate', ['ui.bootstrap']);

    uiBootstrapDateModule.controller('FngUIBootstrapDateCtrl', ['$scope', function ($scope) {
        $scope.popup = {
            opened: false
        };

        $scope.open = function () {
            $scope.popup.opened = true;
        }
    }])
        .directive('fngUiBootstrapDatePicker', ['$compile', '$filter', '$timeout', 'pluginHelper', 'formMarkupHelper', 'cssFrameworkService',
            function ($compile, $filter, $timeout, pluginHelper, formMarkupHelper) {
                return {
                    restrict: 'E',
                    replace: true,
                    priority: 1,
                    controller: 'FngUIBootstrapDateCtrl',
                    link: function (scope, element, attrs) {
                        function afterTimeout() {
                            $timeout(function() {
                                if (element[0].parentElement) {
                                    element.replaceWith(html);
                                } else {
                                    afterTimeout();
                                }
                            });
                        }

                        var template;
                        var processedAttr = pluginHelper.extractFromAttr(attrs, 'fngUiBootstrapDatePicker');
                        var overRiddenDefaults = {
                            'show-button-bar': false,
                            'show-meridian': false,
                            'date-format': 'dd/MM/yyyy'
                        };
                        overRiddenDefaults = Object.assign({}, overRiddenDefaults, processedAttr.directiveOptions);
                        var overRiddenDateDefaults = {
                            showWeeks: false
                        };
                        var jsonDateOptions = {
                            'showWeeks': false
                        };
                        if (processedAttr.directiveOptions['date-options']) {
                            jsonDateOptions = JSON.parse(processedAttr.directiveOptions['date-options'].replace(/'/g, '"'));
                        }
                        scope.dateOptions = Object.assign(overRiddenDateDefaults, jsonDateOptions);
                        ["minDate","maxDate"].forEach(v => {
                            if (scope.dateOptions[v] && typeof scope.dateOptions[v] === "string") {
                                scope.dateOptions[v] = new Date(scope.dateOptions[v]);
                            }
                        })

                        const isArray = processedAttr.info.array;
                        template = pluginHelper.buildInputMarkup(scope, attrs.model, processedAttr.info, processedAttr.options, isArray, isArray, function (buildingBlocks) {
                            var str = '';
                            for (var opt in overRiddenDefaults) {
                                if (opt !== 'date-options') {
                                    str += ' ' + opt + '="' + overRiddenDefaults[opt] + '"';
                                }
                            }
                            if (processedAttr.info.title) {
                                str += ' title="' + processedAttr.info.title + '"';
                            }
                            if (processedAttr.info.arialabel) {
                                str += ' aria-label="' + processedAttr.info.arialabel + '"';
                            }
                            const prefix = "uibDatePopup";
                            const random = Math.floor(Math.random() * 10000);
                            scope[prefix + random] = {
                                opened: {}
                            };
                            scope["open" + random] = function ($index) {
                                const all = Object.keys(scope).filter((k) => k.startsWith(prefix));
                                for (const key of all) {
                                    scope[key].opened = {};
                                }
                                scope[prefix + random].opened[$index || 0] = true;
                            }
                            return formMarkupHelper.generateSimpleInput(
                                buildingBlocks.common + str + ' validdate datepicker-options="dateOptions" uib-datepicker-popup="' + (processedAttr.directiveOptions.format || processedAttr.directiveOptions['date-format'] || 'dd/MM/yy') + '" is-open="' + prefix + random + '.opened[$index || 0]" ng-click="open' + random + '($index)" ' + formMarkupHelper.addTextInputMarkup(buildingBlocks, processedAttr.info, ''),
                                processedAttr.info,
                                processedAttr.options
                            );
                        });
                        var html = $compile(template)(scope);
                        if (element[0].parentElement) {
                            element.replaceWith(html);
                        } else {
                            afterTimeout();
                        }
                    }
                };
            }]
        )
        .directive('validdate', [function() {
            return {
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    var minDate;
                    var maxDate;
                    if (scope.dateOptions.minDate) {
                        minDate = new Date(scope.dateOptions.minDate).valueOf();
                    }
                    if (scope.dateOptions.maxDate) {
                        maxDate = new Date(scope.dateOptions.maxDate).valueOf();
                    }
                    if (minDate || maxDate) {
                        if (attrs.format !== 'dd/MM/yyyy') {
                            throw new Error('Unsupported date format in validdate: ' + attrs.format)
                        }
                    }

                    ctrl.$validators.validdate = function(modelValue, viewValue) {
                        if (ctrl.$isEmpty(modelValue)) {
                            // consider empty models to be invalid
                            return false;
                        }
                        var retVal = true;
                        if (minDate || maxDate) {
                            var dateVal = modelValue.valueOf();
                            if (minDate && dateVal < minDate) {
                                retVal = false;
                            }
                            if (maxDate && dateVal > maxDate) {
                                retVal = false;
                            }
                        }
                        return retVal;
                    };
                }
            }
        }])
})();
