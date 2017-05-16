'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'KB'});


function addChannel(info, tab){
    var selection = info.selectionText;
    chrome.storage.local.get(function(data){
        if(!data.channels) data.channels = [];
        data.channels.push(selection);
        chrome.storage.local.set(data);
    });
}

function addKeyword(info, tab){
    var selection = info.selectionText;
    chrome.storage.local.get(function(data){
        if(!data.keywords) data.keywords = [];
        data.keywords.push(selection);
        chrome.storage.local.set(data);
    });
}

function addWildcardKeyword(info, tab){
    var selection = info.selectionText;
     chrome.storage.local.get(function(data){
        if(!data.wildcardKeywords) data.wildcardKeywords = [];
        data.wildcardKeywords.push(selection);
        chrome.storage.local.set(data);
    });
}

function addWildcardChannel(info, tab){
    var selection = info.selectionText;
    chrome.storage.local.get(function(data){
        if(!data.wildcardChannels) data.wildcardChannels = [];
        data.wildcardChannels.push(selection);
        chrome.storage.local.set(data);
    });
}

var patterns = ["*://www.youtube.com/*"];

chrome.contextMenus.create({
    'title': "Add selection as blocked keyword",
    'documentUrlPatterns':patterns,
    'contexts': ["selection"],
    "onclick": addKeyword
});

chrome.contextMenus.create({
    'title': "Add selection as blocked wildcard keyword",
    'documentUrlPatterns':patterns,
    'contexts': ["selection"],
    "onclick": addWildcardKeyword
});

chrome.contextMenus.create({
    'title': "Add selection as blocked channel",
    'documentUrlPatterns':patterns,
    'contexts': ["selection"],
    "onclick": addChannel
});

chrome.contextMenus.create({
    'title': "Add selection as blocked channel keyword",
    'documentUrlPatterns':patterns,
    'contexts': ["selection"],
    "onclick": addWildcardChannel
});

