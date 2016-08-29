'use strict';
var storeOrders = angular.module('storeOrders', []);
storeOrders.controller('OrderData', ['$scope', '$location', '$route', 'DataStore', 'Categories',
  'Menus', 'Tables',
  function($scope, $location, $route, DataStore, Categories, Menus, Tables) {
    //variable that tells whether it is in menu categories or menu items
    var menu = true;
    var tableChecks = DataStore.get();
    $scope.deleteStatus = true;
    $scope.menu = menu;
    //set table number
    $scope.tableNumber = tableChecks.tableId;
    //set default guest number
    $scope.checkNumber = tableChecks.checkNumber;
    //show amount of checks
    $scope.count = tableChecks.count;
    //if table has a check
    if (tableChecks.count > 0) {
      //initially show guest 1
      $scope.items = tableChecks.order;
      //otherwise
    } else {
      //create an empty check
      Tables.create({
          tableId: $scope.tableNumber,
          checkNumber: $scope.checkNumber,
          order: []
        })
        .then((res) => {
          //store the new check as the current check
          DataStore.set(res);
          //set choices in scope
          $scope.items = res.data;
          //force update to occur in view
          $scope.$apply();
        });
    }
    //get the categories
    Categories.find()
      .then(function(res) {
        //set choices in scope
        $scope.choices = res.data;
        //force update to occur in view
        $scope.$apply();
      });
    //set the selected item for later use
    $scope.select = function(item) {
      $scope.selected = item;
      $scope.deleteStatus = false;
    };
    //sets the highlight on the item
    $scope.isActive = function(item) {
      return $scope.selected === item;
    };
    //deal with click events on the menu
    $scope.menuItems = function(item) {
      //only run if looking at categories, not specific menu items
      if (menu) {
        menu = false;
        //hide categories button, show  menu button
        $scope.menu = menu;
        //create query for specific categories
        var postData = {
          query: {
            categories: item.currentTarget.innerHTML
          }
        };
        //send request for menu items matching category
        Menus.find(postData)
          .then((res) => {
            //set choices in scope
            $scope.choices = res.data;
            //force update to occur in view
            $scope.$apply();
          });
      } else {
        //hide table button, show categories button
        $scope.menu = menu;
        menu = true;
        //get the menu item based on button clicked
        Menus.get(item.currentTarget.getAttribute('data-id'))
          .then((res) => {
            //push the data into the documents array
            postData = {
              $push: {
                order: {
                  dish: res.name,
                  notes: '',
                  cost: res.price
                }
              }
            };
            //update the tables check
            Tables.update(DataStore.get()._id, postData)
              .then((res) => {
                var data = res;
                data.count = tableChecks.count;
                //add results to store in service
                DataStore.set(data);
                //set choices in scope
                $scope.items = data.order;
                //set table number
                $scope.tableNumber = data.tableId;
                //set default guest number
                $scope.checkNumber = data.checkNumber;
                //force update to occur in view
                $scope.$apply();

              });
          });
      }
    };
    //function that returns to showing the tables
    $scope.selectTable = function() {
      //call /orders to have routeprovider load new page
      $location.path('/tables');
      $route.reload();
    };
    //function that returns to showing the categories
    $scope.categorySelect = function() {
      //call /orders to have routeprovider load new page
      $location.path('/orders');
      $route.reload();
    };
    $scope.nextTable = function(item) {
      if (tableChecks.count > 1) {
        tableChecks = DataStore.get();
        var min = 1, max = tableChecks.count;
        var currentCheck = tableChecks.checkNumber;
        //if left arrow is clicked
        var temp = item.currentTarget.getAttribute('data-id');
        if(item.currentTarget.getAttribute('data-id') === 'left') {
          if (currentCheck - 1 < min){
            currentCheck = max;
          } else {
            currentCheck--;
          }
        //otherwise right arrow is clicked
        } else {
          if (currentCheck + 1 > max){
            currentCheck = min;
          } else {
            currentCheck++;
          }
        }
        var postData = {
          query: {
            tableId: parseInt(tableChecks.tableId),
            checkNumber: currentCheck
          }
        };
        //get tables next check
        Tables.find(postData)
        //then with the result
        .then(function(res) {
          var data = res.data[0];
          data.count = tableChecks.count;
          //add results to store in service
          DataStore.set(data);
          //set choices in scope
          $scope.items = data.order;
          //set table number
          $scope.tableNumber = data.tableId;
          //set default guest number
          $scope.checkNumber = data.checkNumber;
          //force update to occur in view
          $scope.$apply();
        });
      }
    };
    //function to delete item from a check
    $scope.deleteItem = function() {
      //disable the button
      $scope.deleteStatus = false;
      var postData = {
        $pull: {
          order: {
            _id: $scope.selected._id
          }
        }
      };
      //update the tables check
      Tables.update(DataStore.get()._id, postData)
        .then((res) => {
          var data = res;
          data.count = tableChecks.count;
          //add results to store in service
          DataStore.set(data);
          //set choices in scope
          $scope.items = data.order;
          //set table number
          $scope.tableNumber = data.tableId;
          //set default guest number
          $scope.checkNumber = data.checkNumber;
          //force update to occur in view
          $scope.$apply();
        });
    };
    $scope.addCheck = function() {
      tableChecks.count++;
      //create an empty check
      Tables.create({
          tableId: $scope.tableNumber,
          checkNumber: tableChecks.count,
          order: []
        })
        .then((res) => {
          var data = res;
          data.count = tableChecks.count;
          //show amount of checks
          $scope.count = tableChecks.count;
          //add results to store in service
          DataStore.set(data);
          //set choices in scope
          $scope.items = data.order;
          //set table number
          $scope.tableNumber = data.tableId;
          //set default guest number
          $scope.checkNumber = data.checkNumber;
          //force update to occur in view
          $scope.$apply();
        });
    };
  }]);
