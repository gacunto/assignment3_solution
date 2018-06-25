(function () {
  'use strict';

  angular.module('NarrowItDownApp', [])
  .controller('NarrowItDownController', NarrowItDownController)
  .service('MenuSearchService', MenuSearchService)
  .constant('DataSourcePath', "https://davids-restaurant.herokuapp.com")
  .directive('foundItems', FoundItemsDirective);

  // Controller
  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController(MenuSearchService) {
    var nidCtrl = this;

    nidCtrl.onClick = function(itemToSearchFor) {
      nidCtrl.nothingFound = false;

      if ((itemToSearchFor === undefined) ||
      (itemToSearchFor !== undefined) && (itemToSearchFor.length === 0)) {
        nidCtrl.nothingFound = true;
        return;
      }

      MenuSearchService.getMatchedMenuItems(itemToSearchFor).then(function (result) {
        nidCtrl.found = result.data.menu_items;
        if (nidCtrl.found.length === 0)
        {
          nidCtrl.nothingFound = true;
        }
      });
    };

    nidCtrl.keyUp = function($event) {
      var keyCode = $event.which || $event.keyCode;
      if (keyCode === 13) {
        nidCtrl.onClick(nidCtrl.itemToSearchFor);
      }
    };

    nidCtrl.removeItem = function (itemIndex) {
      nidCtrl.found.splice(itemIndex, 1);
    };
  }

  // Service
  MenuSearchService.$inject = ['$http', 'DataSourcePath','$filter'];
  function MenuSearchService($http, DataSourcePath, $filter) {
    var service = this;

    service.getMatchedMenuItems = function (itemToSearchFor) {
      var response = $http({
        method: "GET",
        url: (DataSourcePath + "/menu_items.json")
      });

      return response.then(function (result) {
        var menuItems = result.data.menu_items;
        var filteredMenuItems = $filter('filter')(menuItems, {description: itemToSearchFor});
        result.data.menu_items = filteredMenuItems;
        return result;
      })
      .catch(function (error) {
        console.error("Ajax query didn't work!");
      });
    };
  }

  // directive
  function FoundItemsDirective() {
    var ddo = {
      templateUrl: 'foundItems.html',
      restrict: "E",
      // controller: NarrowItDownController,
      // controllerAs: 'nidCtrl',
      // bindToController: true,
      scope: {
        foundItems: '<',
        onRemove: '&'
      }
    };

    return ddo;
  }

})();
