'use strict';

angular.module('myApp.calc', ['ngRoute', 'ngAnimate', 'ui.bootstrap'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/calc', {
    templateUrl: 'home/calc.html'
  });
}])

.factory('messages', function(){
  var messages = {};
  messages.title = "Invalid parameters"; //default
  messages.list = [];
  messages.add = function(message){
    messages.list.push(message);
  }
  messages.clear = function(){
    messages.title = "Invalid parameters";
    messages.list = [];
  }
  return messages;
})

.controller('ModalCtrl', function($scope, $uibModal, messages){

  $scope.animationsEnabled = true;

  $scope.$on('eventFired',function(size){
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
     $scope.selected = selectedItem;
   }, function () {
      console.log("modal is dismissed");
   });
  })

 $scope.toggleAnimation = function () {
   $scope.animationsEnabled = !$scope.animationsEnabled;
 };
})

.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items, messages) {
  $scope.modalTitle = messages.title;//default message, will be failure if there are problems in the submission
  $scope.items = messages.list;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

.service('CalcService', function($http, messages){
  var badEntries = [];
  var bCost;
  var bCount;
  var pCost;
  var pWeight;
  var pWeightUsed;
  var prCost;
  var prCount;
  this.toFixed = function(value, precision){
    var precision = precision || 0,
    neg = value < 0,
    power = Math.pow(10, precision),
    value = Math.round(value * power),
    integral = String((neg ? Math.ceil : Math.floor)(value / power)),
    fraction = String((neg ? -value : value) % power),
    padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
    return precision ? integral + '.' +  padding + fraction : integral;
  }

  this.getParams = function($scope){
     bCost = $scope.bulletCost;
     bCount = $scope.bulletCount;
     pCost = $scope.powderCost;
     pWeight = $scope.powderWeight;
     pWeightUsed = $scope.powderWeightUsed;
     prCost = $scope.primerCost;
     prCount = $scope.primerCount;
   }

   this.doCalc = function(){
     messages.clear();
     var bullet_cost_per_round = bCost/bCount;
     var pounds_per_round = pWeightUsed/7000;
	   var cost_per_pound = pCost/pWeight;
	   var powder_cost_per_round = pounds_per_round * cost_per_pound;
     var primer_cost_per_round = prCost/prCount;
     var brass_cost_per_round = 0;
     var chopped_cost = this.toFixed((powder_cost_per_round + primer_cost_per_round + bullet_cost_per_round+brass_cost_per_round),2);
	   var chopped_box = this.toFixed((chopped_cost * 50),2);
     var badData = this.returnBadData();
     if(messages.list.length == 0){
       if(!isFinite(chopped_cost)){ //check for NaN and infinity
         messages.add("The answer is not a finite number");
       }
       else{
         messages.title = "Success";
         messages.add("the cost per round is $"+chopped_cost);
         messages.add("the cost per box is $"+chopped_cost*50);
       }
     }
     return true;
   }

   this.returnBadData = function(){
     if(isNaN(bCount)){
       messages.add("Bullet count");
     }
     if(isNaN(bCost)){
       messages.add("Bullet cost");
     }
     if(isNaN(pCost)){
       messages.add("Powder cost");
     }
     if(isNaN(pWeight)){
       messages.add("Powder weight");
     }
     if(isNaN(pWeightUsed)){
       messages.add("Powder weight used");
     }
     if(isNaN(prCost)){
       messages.add("Primer cost");
     }
     if(isNaN(prCount)){
       messages.add("Primer count");
     }
     return badEntries;
   }
})

.controller('CalcCtrl',function($rootScope,$scope, $window, messages,CalcService) {
   $scope.calculate = function(){
     CalcService.getParams($scope);
     if(CalcService.doCalc()){
       $rootScope.$broadcast('eventFired', {});
     }
   }

})
