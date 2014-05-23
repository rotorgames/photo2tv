App = angular.module('App', ['ionic','wAjax'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $stateProvider
	.state('index', {
	  url: "/index",
	  templateUrl: "views/index.html",
	  controller: 'IndexCtrl'
	})
	.state('pay', {
	  url: "/pay",
	  templateUrl: "views/pay.html",
	  controller: 'PayCtrl'
	})
  
	$urlRouterProvider.otherwise("/index");

})

.run(function($rootScope){
	$rootScope.paramData = {
		pay: null,
		view: null
		};
})

.controller('IndexCtrl', function($scope, $state, $http, $rootScope, $ionicLoading, $ionicActionSheet) {
	$scope.getPicture = function(){
		function openExplorer(source){
			navigator.camera.getPicture(success,null,{
				quality: 50, 
				sourceType : source, //Camera.PictureSourceType
				destinationType: Camera.DestinationType.DATA_URL,
				encodingType: Camera.EncodingType.JPEG,
				targetWidth: 1024
			})
			function success (uri){
				$rootScope.sendingPicture = false;
				$rootScope.picture = uri;
				$scope.picture = uri;
				$scope.$digest();
			}
		}
		$ionicActionSheet.show({
		   buttons: [
			 { text: 'Галерея' },
			 { text: 'Камера' },
		   ],
		   titleText: 'Выбирите источник',
		   cancelText: 'Отмена',
		   buttonClicked: function(index) {
			 openExplorer(index);
			 return true;
		   }
		 });
	}
	
	$scope.sendPhoto = function(){
		$rootScope.namePicture = device.uuid+'-'+new Date().getTime()+'.jpg';
		var httpData = {
			name: $rootScope.namePicture,
			photo: $rootScope.picture
			}
			
		if(!$rootScope.sendingPicture){
			var httpConfig = {
				responseType:'document'
				}
			$ionicLoading.show({
			  template: 'Отправка'
			});
			$http.post('http://p2tv.ru/save64.php', httpData, httpConfig)
			.success(function(response){
				$rootScope.sendingPicture = true;
				$rootScope.xml = response;
				$ionicLoading.hide();
				$state.go('pay');
			})
		}else{
			$state.go('pay');
		}
	}
})

.controller('PayCtrl', function($scope, $state, $rootScope, $ionicLoading, $ionicPopup, $http) {
	var xml = $rootScope.xml;
	var xmlPays = xml.getElementsByTagName('pay');
	var xmlViews = xml.getElementsByTagName('screen');
	var pays = [];
	var views = [];
	for(var i = 0; i < xmlPays.length; i++){
		var xmlPay = xmlPays[i];
		var pay = {
			'number': xmlPay.getElementsByTagName('number')[0].textContent,
			'price': xmlPay.getElementsByTagName('price')[0].textContent,
			'text': xmlPay.getElementsByTagName('text')[0].textContent,
			'sms': xmlPay.getElementsByTagName('sms')[0].textContent
			};
		pays.push(pay);
	}
	for(var i = 0; i < xmlViews.length; i++){
		var xmlView = xmlViews[i];
		var view = {
			'address': xmlView.getElementsByTagName('address')[0].textContent,
			'code': xmlView.getElementsByTagName('code')[0].textContent,
			}
		views.push(view);
	}
	$scope.pays = pays;
	$scope.views = views;
	sc = $scope;
	$scope.sendSms = function(){
		$ionicLoading.show({
			  template: 'Оплата'
			});
		
		var payIndex = $scope.paramData.pay;
		var viewIndex = $scope.paramData.view;
		var pay = $scope.pays[payIndex];
		var view = $scope.views[viewIndex];
		var number = pay.number;
		var text = pay.sms+' '+view.code;
		
		sms.send(number,text,"", success, error);
		
		function success(e){
			if(e == 'OK'){
				getPayStatus();
			}
		}
		function error(e){
			console.log(e);
			alert('Message Send Error');			
		}
		
		function allReset(){
			$rootScope.picture = false;
			$rootScope.sendingPicture = false;
			$state.go('index');
		}
		function getPayStatus(){
			var httpData = {
					responseType: 'document'
					}
			$http.get('http://p2tv.ru/pay.php?code='+$rootScope.namePicture, httpData)
			.success(function(response){
				var code = parseInt(response.getElementsByTagName('response')[0].textContent);
				console.log(code);
				if(code == 200){
					$ionicLoading.hide();
					$ionicPopup.alert({
					   title: 'Состояние',
					   template: '<div style="text-align:center">Оплачено</div>'
					 })
					.then(function(res) {
						allReset();		 
					});
				}else
				if(code == 402){
					setTimeout(function(){
						getPayStatus();
					}, 1000);
				}else
				if(code == 500){
					$ionicLoading.hide();
					$ionicPopup.alert({
					   title: 'Ошибка',
					   template: response.getElementsByTagName('error')[0].textContent
					 })
				}
			})
		}
	}
})