'use strict';
var app = angular.module('popup', []);
app.controller("PopupController", function($scope){
	$scope.openOptions = function(){
		console.log("test popup");
		chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function(tab) {
			console.log("Options Open");
		});
	}
})
