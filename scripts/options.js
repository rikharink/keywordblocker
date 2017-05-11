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

app.directive('fileReader', function() {
  return {
    scope: {
      fileReader:"="
    },
    link: function(scope, element) {
      $(element).on('change', function(changeEvent) {
        var files = changeEvent.target.files;
        if (files.length) {
          var r = new FileReader();
          r.onload = function(e) {
              var contents = e.target.result;
              scope.$apply(function () {
                scope.fileReader = contents;
              });
          };
          r.readAsText(files[0]);
        }
      });
    }
  };
});

app.controller('OptionsController', function($scope){
    chrome.storage.local.get(function(data){
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
            $scope.popOverImage = 'https://i.imgur.com/sLmiP5n.png'
        }

        if(typeof data.removeFromResults != 'undefined'){
            $scope.removeFromResults = data.removeFromResults;
        }
        else{
            $scope.removeFromResults = true;
        }

        if(typeof data.checkDescription != 'undefined'){
            $scope.checkDescription = data.checkDescription;
        }
        else{
            $scope.checkDescription = true;
        }
        $scope.$apply();
    });

    $scope.passwordSaved = false;
    $scope.popOverSaved = false;
    $scope.fileContent = undefined;

    $scope.$watch('fileContent', function(){
        if(!$scope.fileContent)
            return;
        var data = $scope.fileContent.split('\n');
        //remove header
        data.shift();
        data.forEach(function(keyword, index){
            $scope.newKeyword = keyword;
            $scope.addKeyword();
            $scope.newKeyword = "";
        });
    });

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
            'checkDescription':$scope.checkDescription,
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

    $scope.importKeywords = function(contents){

    }

    $scope.exportKeywords = function(){
        var data = $scope.keywords.slice();
        data.unshift("Keyword");
        data[0] = "data:text/csv;charset=utf-8," + data[0];
        var csvContent = data.join('\n');
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "keywordblocker_keywords.csv");
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data file named "keywordblocker_keywords.csv".
    }
});