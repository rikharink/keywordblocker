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
    $scope.loadLocalStorage = function(){
        chrome.storage.local.get(function(data){
            $scope.localStorage = data;
            if(data.keywords){
                $scope.keywords = data.keywords;
            }
            else{
                $scope.keywords = [];
            }
            if(data.wildcardKeywords){
                $scope.wildcardKeywords = data.wildcardKeywords;
            }
            else{
                $scope.wildcardKeywords = [];
            }
            if(data.channels){
                $scope.channels = data.channels;
            }
            else{
                $scope.channels = [];
            }
            if(data.wildcardChannels){
                $scope.wildcardChannels = data.wildcardChannels;
            }
            else{
                $scope.wildcardChannels = [];
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
    };
    $scope.loadLocalStorage();
    $scope.passwordSaved = false;
    $scope.popOverSaved = false;
    $scope.fileContent = undefined;

    $scope.$watch('fileContent', function(){
        if(!$scope.fileContent)
            return;
        $scope.importSettings(JSON.parse($scope.fileContent));
    });

    $scope.remove = function(keywordIndex){
        $scope.keywords.splice(keywordIndex, 1);
        $scope.saveLocalStorage();
    };

    $scope.removeChannel = function(index){
        $scope.channels.splice(index, 1);
        $scope.saveLocalStorage();
    };

    $scope.removeWildcardChannel = function(index){
        $scope.wildcardChannels.splice(index, 1);
        $scope.saveLocalStorage();
    };

    $scope.removeWildcardKeyword = function(index){
        $scope.wildcardKeywords.splice(index, 1);
        $scope.saveLocalStorage();
    }

    $scope.addKeyword = function(){
        if(!$scope.hasKeyword()){
            $scope.keywords.push($scope.newKeyword);
            $scope.saveLocalStorage();
            $scope.newKeyword = "";
        }
    };

    $scope.addWildcardKeyword = function(){
        if(!$scope.hasWildcardKeyword()){
            $scope.wildcardKeywords.push($scope.newWildcardKeyword);
            $scope.saveLocalStorage();
            $scope.newWildcardKeyword = "";
        }
    }

    $scope.hasKeyword = function(){
        if ($scope.keywords){
            return $scope.keywords.indexOf($scope.newKeyword) > -1;
        }
        else{
            return false;
        }
    };

    $scope.hasWildcardKeyword = function(){
        if ($scope.keywords){
            return $scope.wildcardKeywords.indexOf($scope.newWildcardKeyword) > -1;
        }
        else{
            return false;
        }
    };


    $scope.addChannel = function(){
        if(!$scope.hasChannel()){
            $scope.channels.push($scope.newChannel);
            $scope.saveLocalStorage();
            $scope.newChannel = "";
        }
    };

    $scope.hasChannel = function(){
        if($scope.channels){
            return $scope.channels.indexOf($scope.newChannel) > -1;
        }
        else{
            return false;
        }
    };

    $scope.addWildcardChannel = function(){
        if(!$scope.hasWildcardChannel()){
            $scope.wildcardChannels.push($scope.newWildcardChannel);
            $scope.saveLocalStorage();
            $scope.newWildcardChannel = "";
        }
    };

    $scope.hasWildcardChannel = function(){
        if($scope.channels){
            return $scope.wildcardChannels.indexOf($scope.newWildcardChannel) > -1;
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
            'wildcardKeywords':$scope.wildcardKeywords,
            'channels':$scope.channels,
            'wildcardChannels':$scope.wildcardChannels,
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

    $scope.importSettings = function(settings){
        console.log(settings);
        chrome.storage.local.set(settings);
        $scope.loadLocalStorage();
    }

    $scope.exportSettings = function(){
        chrome.storage.local.get(function(data){
            var data = JSON.stringify(data);
            var vLink = document.createElement('a'),
            vBlob = new Blob([data], {type: "octet/stream"}),
            vName = 'keywordblocker_settings.json',
            vUrl = window.URL.createObjectURL(vBlob);
            vLink.setAttribute('href', vUrl);
            vLink.setAttribute('download', vName );
            vLink.click();
        });
    }
});