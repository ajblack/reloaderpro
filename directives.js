angular.module('myApp.directives', []).
  directive('myFirstDirective', function(injectables) {
    // return the directive link function.
    return function(scope, element, attrs) {
      // do stuff here
    }
  });
