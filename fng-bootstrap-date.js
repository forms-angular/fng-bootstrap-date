(function () {
  'use strict';

  var uiBootstrapDateModule = angular.module('fng.uiBootstrapDate', ['ui.bootstrap']);

  uiBootstrapDateModule.controller('FngUIBootstrapDateCtrl', ['$scope', function ($scope) {
    $scope.popup = {
      opened: false
    };

    $scope.open = function() {
      $scope.popup.opened = true;
    }
  }])
    .directive('fngUiBootstrapDatePicker', ['$compile', '$filter', 'pluginHelper', 'formMarkupHelper', 'cssFrameworkService',
      function ($compile, $filter, pluginHelper, formMarkupHelper, cssFrameworkService) {
        return {
          restrict: 'E',
          replace: true,
          priority: 1,
          controller: 'FngUIBootstrapDateCtrl',
          link: function (scope, element, attrs) {
              var template;
              var processedAttr = pluginHelper.extractFromAttr(attrs, 'fngUiBootstrapDatePicker');
              template = pluginHelper.buildInputMarkup(scope, attrs.model, processedAttr.info, processedAttr.options, false, false, function (buildingBlocks) {
                return formMarkupHelper.generateSimpleInput(
                    buildingBlocks.common + ' uib-datepicker-popup="' + (processedAttr.directiveOptions.format || 'dd/MM/yy') + '" is-open="popup.opened" ng-click="open()" ' + formMarkupHelper.addTextInputMarkup(buildingBlocks, processedAttr.info, ''),
                    processedAttr.info,
                    processedAttr.options
                  );
              });
              element.replaceWith($compile(template)(scope));
            }
        };
      }]
    )
})();