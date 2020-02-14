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
                        scope.dateOptions = Object.assign({}, overRiddenDateDefaults, jsonDateOptions);

                        template = pluginHelper.buildInputMarkup(scope, attrs.model, processedAttr.info, processedAttr.options, false, false, function (buildingBlocks) {
                            let str = '';
                            for (var opt in overRiddenDefaults) {
                                if (opt !== 'date-options') {
                                    str += ' ' + opt + '="' + overRiddenDefaults[opt] + '"';
                                }
                            }

                            return formMarkupHelper.generateSimpleInput(
                                buildingBlocks.common + str + ' datepicker-options="dateOptions" uib-datepicker-popup="' + (processedAttr.directiveOptions.format || processedAttr.directiveOptions['date-format'] || 'dd/MM/yy') + '" is-open="popup.opened" ng-click="open()" ' + formMarkupHelper.addTextInputMarkup(buildingBlocks, processedAttr.info, ''),
                                processedAttr.info,
                                processedAttr.options
                            );
                        });
                        const html = $compile(template)(scope);
                        if (element[0].parentElement) {
                            element.replaceWith(html);
                        } else {

                            function afterTimeout() {
                                $timeout(() => {
                                    if (element[0].parentElement) {
                                        element.replaceWith(html);
                                    } else {
                                        afterTimeout();
                                    }
                                });
                            }
                            afterTimeout();
                        }
                    }
                };
            }]
        )
})();
