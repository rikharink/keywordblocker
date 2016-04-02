'use strict';
var app = angular.module('youtubeBlocker', []);

app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });

app.controller('OptionsController', function($scope){

	chrome.storage.local.get(function(data){
		console.log(data.removeFromResultsss);
		$scope.localStorage = data;
		if(data.keywords){
			$scope.keywords = data.keywords;
		}
		else{
			$scope.keywords = [];
		}
		if(data.password){
			$scope.optionsPassword = data.password;
		}
		else{ 
			$scope.optionsPassword = "";
		}

		$scope.newOptionsPassword = $scope.optionsPassword;
		if(data.popOver){
			$scope.popOverText = data.popOver.text;
			$scope.popOverImage = data.popOver.image;
		}
		else{
			$scope.popOverText = 'Blocked';
			$scope.popOverImage = 'http://us.cdn1.123rf.com/168nwm/arcady31/arcady311010/arcady31101000044/8101111-stop-bord.jpg'
		}

		if(typeof data.removeFromResults != 'undefined'){
			$scope.removeFromResults = data.removeFromResults;
		}
		else{
			$scope.removeFromResults = true;
		}
		$scope.$apply();
	});

	$scope.passwordSaved = false;
	$scope.popOverSaved = false;

	$scope.remove = function(keywordIndex){
	    $scope.keywords.splice(keywordIndex, 1);
	    $scope.saveLocalStorage();
	};

	$scope.addKeyword = function(){
		if(!$scope.hasKeyword()){
	    	$scope.keywords.push($scope.newKeyword);
	    	$scope.saveLocalStorage();
	    	$scope.newKeyword = "";
	    }
	    else{
	    	console.log("Keyword already exists");
	    }
	};

	$scope.hasKeyword = function(){
		if ($scope.keywords){
	    	return $scope.keywords.indexOf($scope.newKeyword) > -1;
	    }
	    else{
	    	return false;
	    }
	};

	$scope.checkPassword = function(){
		return $scope.password === $scope.optionsPassword || !$scope.optionsPassword;
	};

	$scope.savePassword = function(){
		$scope.optionsPassword = $scope.newOptionsPassword;
		$scope.password = $scope.newOptionsPassword;
		$scope.passwordSaved = true;
		$scope.saveLocalStorage();
	};

	$scope.savePopOver = function(){
		$scope.popOverSaved = true;
		$scope.saveLocalStorage();
	}

	$scope.saveLocalStorage = function(){
		chrome.storage.local.set({
			'keywords':$scope.keywords, 
			'password':$scope.optionsPassword,
			'removeFromResults':$scope.removeFromResults, 
			'popOver':{
				'image':$scope.popOverImage, 
				'text':$scope.popOverText
				}
			}, 
			function(){
				console.log("Saved data");
			}
		);
	}
});