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
        .directive('fngUiBootstrapDatePicker', ['$compile', '$timeout', 'PluginHelperService', 'FormMarkupHelperService', 'RecordHandlerService',
            function ($compile, $timeout, PluginHelperService, FormMarkupHelperService, RecordHandlerService) {
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
                        var processedAttrs = PluginHelperService.extractFromAttr(attrs, 'fngUiBootstrapDatePicker', scope);
                        var overriddenDefaults = {
                            'show-button-bar': false,
                            'show-meridian': false,
                            'date-format': 'dd/MM/yyyy'
                        };
                        overriddenDefaults = Object.assign({}, overriddenDefaults, processedAttrs.directiveOptions);
                        var overriddenDateDefaults = {
                            showWeeks: false
                        };
                        var jsonDateOptions = {
                            'showWeeks': false
                        };
                        if (processedAttrs.directiveOptions['date-options']) {
                            jsonDateOptions = JSON.parse(processedAttrs.directiveOptions['date-options'].replace(/'/g, '"'));
                        }
                        scope.dateOptions = Object.assign(overriddenDateDefaults, jsonDateOptions);
                        ["minDate","maxDate"].forEach(v => {
                            if (scope.dateOptions[v] && typeof scope.dateOptions[v] === "string") {
                                // allow minDate and maxDate to be derived from another (assumed to be date-typed) field, but with
                                // the limitation that the value of that field must be available now and must not change
                                // (i.e., this is effectively a one-time binding)
                                // one possible use case would be to use the value of a hidden "when created" field as a minimum
                                // or maximum value for another (not hidden) date field
                                if (scope.dateOptions[v].startsWith("record.") || scope.dateOptions[v].startsWith("subDoc.")) {
                                    scope.dateOptions[v] = RecordHandlerService.getData(scope, scope.dateOptions[v]);
                                } else {
                                    scope.dateOptions[v] = new Date(scope.dateOptions[v]);
                                }                                
                            }
                        })

                        const isArray = processedAttrs.info.array;
                        template = PluginHelperService.buildInputMarkup(
                            scope,
                            attrs,
                            {
                                processedAttrs,
                                addButtons: isArray,
                                needsX: isArray,
                            },
                            function (buildingBlocks) {
                                var str = buildingBlocks.common.trim();
                                for (var opt in overriddenDefaults) {
                                    if (opt !== 'date-options') {
                                        str += ` ${opt}="${overriddenDefaults[opt]}"`;
                                    }
                                }
                                if (processedAttrs.info.title) {
                                    str += ` title="${processedAttrs.info.title}"`;
                                }
                                if (processedAttrs.info.arialabel) {
                                    str += ` aria-label="${processedAttrs.info.arialabel}"`;
                                }
                                if (processedAttrs.info.required) {
                                    str += " required";
                                }
                                const markup = FormMarkupHelperService.addTextInputMarkup(buildingBlocks, processedAttrs.info, '');
                                const disabled = PluginHelperService.genDisabledStr(scope, processedAttrs, "");
                                const dateFormat = processedAttrs.directiveOptions.format || processedAttrs.directiveOptions['date-format'] || 'dd/MM/yy';
                                str += ` ${markup}${disabled}datepicker-options="dateOptions" uib-datepicker-popup="${dateFormat}"`;
    
                                if (disabled && disabled.trim().toLowerCase() !== "disabled") {
                                    scope.popup = { opened: false };
                                    scope.open = function () {
                                        scope.popup.opened = true;
                                    }
                                    str += ' is-open="popup.opened" ng-click="open()" ng-change="setDirty()" validdate '; // don't remove the trailing space here
                                }
                                return FormMarkupHelperService.generateSimpleInput(
                                    str,
                                    processedAttrs.info,
                                    processedAttrs.options
                                );
                            }
                        );
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
                        let dateFormat = attrs.format || attrs.dateFormat;
                        if (dateFormat !== 'dd/MM/yyyy') {
                            throw new Error('Unsupported date format in validdate: ' + dateFormat)
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
