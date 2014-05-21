App = angular.module('App', ['ionic'])

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    .state('index', {
      url: "/index",
      templateUrl: "views/index.html",
      controller: 'IndexCtrl'
    })

	//$locationProvider.html5Mode(true).hashPrefix('!');
	$urlRouterProvider.otherwise("/index");

})

.controller('IndexCtrl', function($scope, $state) {
	$scope.picture = "http://angular.ru/img/AngularJS-small.png";
	$scope.getPicture = function(){
		navigator.camera.getPicture(success,function(e){console.log(e)},{quality: 50, destinationType: Camera.DestinationType.DATA_URL })
		function success (uri){
			console.log(uri);
			$scope.picture = "data:image/jpeg;base64,"+uri;
			$scope.$digest();
		}
	}
})