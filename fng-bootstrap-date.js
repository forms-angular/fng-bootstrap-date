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
        .directive('fngUiBootstrapDatePicker', ['$compile', '$timeout', 'pluginHelper', 'formMarkupHelper', 'cssFrameworkService',
            function ($compile, $timeout, pluginHelper, formMarkupHelper) {
                return {
                    restrict: 'E',
                    replace: true,
                    priority: 1,
                    controller: 'FngUIBootstrapDateCtrl',
                    scope: true, // our own scope, but not isolated - prevents multiple instances on the same page from opening each other
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
                        var overriddenDefaults = {
                            'show-button-bar': false,
                            'show-meridian': false,
                            'date-format': 'dd/MM/yyyy'
                        };
                        overriddenDefaults = Object.assign({}, overriddenDefaults, processedAttr.directiveOptions);
                        var overriddenDateDefaults = {
                            showWeeks: false
                        };
                        var jsonDateOptions = {
                            'showWeeks': false
                        };
                        if (processedAttr.directiveOptions['date-options']) {
                            jsonDateOptions = JSON.parse(processedAttr.directiveOptions['date-options'].replace(/'/g, '"'));
                        }
                        scope.dateOptions = Object.assign(overriddenDateDefaults, jsonDateOptions);
                        ["minDate","maxDate"].forEach(v => {
                            if (scope.dateOptions[v] && typeof scope.dateOptions[v] === "string") {
                                scope.dateOptions[v] = new Date(scope.dateOptions[v]);
                            }
                        })

                        const isArray = processedAttr.info.array;
                        template = pluginHelper.buildInputMarkup(scope, attrs.model, processedAttr.info, processedAttr.options, isArray, isArray, function (buildingBlocks) {
                            var str = buildingBlocks.common.trim();
                            for (var opt in overriddenDefaults) {
                                if (opt !== 'date-options') {
                                    str += ` ${opt}="${overriddenDefaults[opt]}"`;
                                }
                            }
                            if (processedAttr.info.title) {
                                str += ` title="${processedAttr.info.title}"`;
                            }
                            if (processedAttr.info.arialabel) {
                                str += ` aria-label="${processedAttr.info.arialabel}"`;
                            }
                            if (processedAttr.info.required) {
                                str += " required";
                            }
                            const markup = formMarkupHelper.addTextInputMarkup(buildingBlocks, processedAttr.info, '');
                            const disabled = pluginHelper.handleReadOnlyDisabled(processedAttr.info.id, attrs) || " ";
                            const dateFormat = processedAttr.directiveOptions.format || processedAttr.directiveOptions['date-format'] || 'dd/MM/yy';
                            str += ` ${markup}${disabled}datepicker-options="dateOptions" uib-datepicker-popup="${dateFormat}"`;
   
                            if (disabled?.trim().toLowerCase() !== "disabled") {
                                scope.popup = { opened: false };
                                scope.open = function () {
                                    scope.popup.opened = true;
                                }
                                str += ' is-open="popup.opened" ng-click="open()" validdate '; // don't remove the trailing space here
                            }
                            return formMarkupHelper.generateSimpleInput(
                                str,
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
                            // if empty should be considered invalid, the field should be set to required (which will
                            // then be validated elsewhere)
                            return true;
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
