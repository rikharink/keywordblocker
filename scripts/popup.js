'use strict';
var app = angular.module('popup', []);
app.controller("PopupController", function($scope){
	$scope.openOptions = function(){
		chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function(tab) {
		});
	}
})
