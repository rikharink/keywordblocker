'use strict';

//content script
// var clickedEl = null;

// document.addEventListener("mousedown", function(event){
//     //right click
//     if(event.button == 2) { 
//         clickedEl = event.target;
//     }
// }, true);

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if(request == "blockChannel") {
//         console.log("BLOCK CHANNEL");
//         console.log(clickedEl);
//         var cont = clickedEl.closest("div");
//         var channel = cont.getElementsByClassName("yt-formatted-string")[0].innerHTML;
//         console.log(channel);
//         console.log("...");
//     }
// });


function loadPopup(text, image){
    var modalCode = '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
    '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-body">' +
    '<img src="' + image + '"> <br/><br/>' +
    '<p>' + text + '</p>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button type="button" class="btn btn-default" data-dismiss="modal">X</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
    $('#body-container').hide()
    $('body').append(modalCode);
    $('#myModal').modal("show");
    $('#myModal').on('hidden.bs.modal', function(){
        document.location = "https://www.youtube.com";
    });
    var vid = document.getElementsByTagName('video')[0];
    
    if(vid) {
        vid.pause();
        vid.style.visibility = "hidden";
    }
}

function getChannels(){
    if(window.isNewYoutube)
        return Array.from(document.querySelectorAll("a.yt-formatted-string")).filter(x => (x.href.includes("channel") || x.href.includes("user")) && x.innerHTML != "Library");
    else
        return Array.from(document.querySelectorAll("a.g-hovercard.yt-uix-sessionlink.spf-link")).filter(x => (x.href.includes("channel") || x.href.includes("user")) && x.innerHTML != "Library");
}

function isYoutubeLink(value){
    if(value.href && value.title != "" && typeof value.href != 'undefined')
        return value.href.indexOf('watch?') != -1;
    else
        return false;
}

function removeNodeByTag(videoLink, tagname){
    var node = videoLink.closest(tagname);
    if(node && node.parentNode){
        node.parentNode.removeChild(node);
    }
}

function removeNodeByClassNames(videoLink, classNames){
    var parNode = videoLink.parentNode;
    while(parNode.className && parNode.className != classNames){
        parNode = parNode.parentNode;
    }
    if(parNode.parentNode)
        parNode.parentNode.removeChild(parNode);
}

function examineFrontpage(){
    var videoLinks = document.getElementsByTagName('a');
    videoLinks = [].slice.call(videoLinks).filter(isYoutubeLink);
    var hasKeywords = window.kbData.keywords.length != 0;
    var hasWildcardKeywords = window.kbData.wildcardKeywords.length != 0;
    videoLinks.forEach(function(videoLink, index, array){
        if((hasKeywords && window.blockRe.test(videoLink.title)) || (hasWildcardKeywords && window.wildcardKeywordRe.test(videoLink.title)))
        {
            if(window.isNewYoutube){
                removeNodeByTag(videoLink, 'ytd-grid-video-renderer');
            }
            else{
                removeNodeByClassNames(videoLink, 'yt-shelf-grid-item');
            }
        }                    
    });
}

function examineResults(){
    var videoLinks = document.getElementsByTagName('a');
    
    videoLinks = [].slice.call(videoLinks).filter(isYoutubeLink);
    var hasKeywords = window.kbData.keywords.length != 0;
    var hasWildcardKeywords = window.kbData.wildcardKeywords.length != 0;
    videoLinks.forEach(function(videoLink, index, array){
        if((hasKeywords && window.blockRe.test(videoLink.title)) || hasWildcardKeywords && window.wildcardKeywordRe.test(videoLink.title)){
            if(window.isNewYoutube){
                removeNodeByTag(videoLink, 'ytd-video-renderer');
            } else{ 
                removeNodeByClassNames(videoLink, 'yt-lockup yt-lockup-tile yt-lockup-video clearfix yt-uix-tile');
            }
        }
    });

    var playlistLinks = [];
    if(window.isNewYoutube){
        playlistLinks = document.getElementsByClassName('ytd-playlist-renderer');
        playlistLinks = [].slice.call(playlistLinks);
    }

    playlistLinks.forEach(function(playlist, index, arr){
        if((hasKeywords && window.blockRe.test(playlist.innerHTML)) || (hasWildcardKeywords && window.wildcardKeywordRe.test(playlist.innerHTML))){
            if(window.isNewYoutube){
                removeNodeByTag(playlist, "ytd-playlist-renderer");
            }
        }
    });
}

function examineVideo(){
    var videoTitle = "";
    var descriptionText = "";
    var channelname = "";

    var hasKeywords = window.kbData.keywords.length != 0;
    var hasChannels = window.kbData.channels.length != 0;
    var hasWildcardKeywords = window.kbData.wildcardKeywords.length != 0;
    var hasWildcardChannels = window.kbData.wildcardChannels.length != 0;

    if(window.isNewYoutube){
        videoTitle = document.getElementsByTagName("h1")[0];
        if(videoTitle)
            videoTitle = videoTitle.innerHTML.toLowerCase();
        descriptionText = document.getElementById("description");
        if(descriptionText)
            descriptionText = descriptionText.innerHTML.toLowerCase();
        channelname = document.getElementById("owner-name")
        if(channelname)
            channelname = channelname.getElementsByTagName("a")[0]
            if(channelname)
                channelname = channelname.text.toLowerCase();
    } 
    else {
        videoTitle = document.getElementById("eow-title");
        if(videoTitle)
            videoTitle = videoTitle.innerHTML.toLowerCase();
        else
            videoTitle = "";
        descriptionText = document.getElementById("eow-description");
        if(descriptionText)
            descriptionText = descriptionText.innerHTML.toLowerCase();
        else
            descriptionText = "";
    }
    var title = document.title;
    var searchTerm = document.getElementsByName("search_query");
    if(searchTerm[0])
        searchTerm = searchTerm[0].value.toLowerCase();
    else
        searchTerm = "";
    if((searchTerm && searchTerm.length != 0) || (videoTitle && videoTitle.length != 0) || (title && title.length != 0) || (channelname && channelname.length != 0)){
        var matchText = [searchTerm, videoTitle, title, window.kbData.checkDescription ? descriptionText : ""].join(" ");
        var searchMatchedKeyword = (hasKeywords && window.blockRe.test(matchText)) || (hasWildcardKeywords && window.wildcardKeywordRe.test(matchText));
        var searchMatchedChannel = (hasWildcardChannels && window.wildcardChannelRe.test(channelname)) || (hasChannels && window.channelRe.test(channelname));
        if(searchMatchedKeyword || searchMatchedChannel)
            loadPopup(window.kbData.popOver.text, window.kbData.popOver.image);
    }
}

function examineTrending(){
    var hasKeywords = window.kbData.keywords.length != 0;
    var hasWildcardKeywords = window.kbData.wildcardKeywords.length != 0;

    var videoLinks = document.getElementsByTagName('a');
    videoLinks = [].slice.call(videoLinks).filter(isYoutubeLink);
    videoLinks.forEach(function(videoLink, index, array){
        if((hasKeywords && window.blockRe.test(videoLink.title)) || (hasWildcardKeywords && window.wildcardKeywordRe.test(videoLink.title))){
            if(window.isNewYoutube){
                removeNodeByTag(videoLink, 'ytd-video-renderer');
            } else{ 
                removeNodeByClassNames(videoLink, 'expanded-shelf-content-item-wrapper');
            }
        }
    });
}

function examineSubscriptions(){
    var hasKeywords = window.kbData.keywords.length != 0;
    var hasWildcardKeywords = window.kbData.wildcardKeywords.length != 0;

    var videoLinks = document.getElementsByTagName('a');
    videoLinks = [].slice.call(videoLinks).filter(isYoutubeLink);
    videoLinks.forEach(function(videoLink, index, array){
        if((hasKeywords && window.blockRe.test(videoLink.title)) || (hasWildcardKeywords && window.wildcardKeywordRe.test(videoLink.title))){
            if(window.isNewYoutube){
                removeNodeByTag(videoLink, 'ytd-grid-video-renderer');
            }
            else{
                removeNodeByClassNames(videoLink, 'yt-shelf-grid-item');
            }
        }                    
    });
}

function examineChannels(){
    var channels = getChannels();
    var blockedChannels = window.kbData.channels;
    var blockedWildcardChannels = window.kbData.wildcardChannels;

    var hasChannels = blockedChannels.length != 0;
    var hasWildcardChannels = blockedWildcardChannels.length != 0;

    channels.forEach(function(channel, index, array){
        var channelname = channel.innerHTML;
        if((hasChannels && window.channelRe.test(channelname)) || (hasWildcardChannels && window.wildcardChannelRe.test(channelname))){
            removeVideo(channel);
        }
    });
}

function removeVideo(video){
    if(!video) return;
    if(window.kbData.removeFromResults){
        if(location.pathname === "/"){
            if(window.isNewYoutube){
                removeNodeByTag(video, "ytd-grid-video-renderer");
            }
            else{
                removeNodeByClassNames(video, "yt-shelf-grid-item yt-uix-shelfslider-item");
            }
        }
        else if(location.pathname === "/results"){
            if(window.isNewYoutube){
                removeNodeByTag(video, "ytd-video-renderer");
                removeNodeByTag(video, "ytd-playlist-renderer");
            }
            else{
                removeNodeByClassNames(video, "yt-lockup yt-lockup-tile yt-lockup-video clearfix");
            }
        }
        else if(location.pathname === "/feed/trending")
        {
            if(window.isNewYoutube){
                removeNodeByTag(video, "ytd-video-renderer");
            } 
            else{
                removeNodeByClassNames(video, "expanded-shelf-content-item-wrapper");
            }
        }
        else if(location.pathname === "/feed/subscriptions"){
            if(window.isNewYoutube){
                removeNodeByTag(video, "ytd-grid-video-renderer");
            } else{
                removeNodeByClassNames(video, "yt-shelf-grid-item");
            }
        }
    }
    if(location.pathname === "/watch"){
        if(window.isNewYoutube){
            removeNodeByTag(video, "ytd-grid-video-renderer");
        }
        else{
            removeNodeByClassNames(video, "video-list-item related-list-item related-list-item-compact-video");
        }
    }
}

chrome.storage.local.get(function(data){
    window.kbData = data;
    if(!data.keywords){
        data.keywords = [];
    }
    if(!data.channels){
        data.channels = [];
    }
    if(!data.wildcardChannels){
        data.wildcardChannels = [];
    }

    if(!data.wildcardKeywords){
        data.widcardKeywords = [];
    }

    var blockKeywords = data.keywords;
    var beginRe = "(?:-|\\s|\\W|^)";
    var endRe = "(?:-|\\s|\\W|$)";
    var keywordRe = "(?:" + blockKeywords.join("|") + ")";
    
    window.blockRe = new RegExp(beginRe + keywordRe + endRe, "i");

    var channels = data.channels.map(channel => "^" + channel + "$");
    var wildcardChannels = data.wildcardChannels.map(wildcardChannel => "(.)*" + wildcardChannel + "(.)*");
    var cRe = "(?:" + channels.join("|") + ")";
    var wcRe = "(?:" + wildcardChannels.join("|") + ")";
    var wildcardKeywords = data.wildcardKeywords.map(wk => "(.)*" + wk + "(.)*");
    var wkRe = "(?:" + wildcardKeywords.join("|") + ")";
    window.channelRe = new RegExp(cRe, "i");
    window.wildcardChannelRe = new RegExp(wcRe, "i");
    window.wildcardKeywordRe = new RegExp(wkRe, "i");

    startObserving();
})

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    if(!window.kbData) 
        return;
    
    if(window.kbData.channels.length != 0 || window.kbData.wildcardChannels.length != 0){
        examineChannels();
    }
    
    if(window.kbData.removeFromResults){
        if(location.pathname === "/"){
            examineFrontpage();
        }
        else if(location.pathname === "/results"){
            examineResults();
        }
        else if(location.pathname === "/feed/trending")
        {
            examineTrending();
        }
        else if(location.pathname === "/feed/subscriptions"){
            examineSubscriptions();
        }
    }

    if(location.pathname === "/watch"){
        examineVideo();
    }
});



function observe(observable){
    observer.observe(observable, {
        subtree: true,
        attributes: true,
        elements: true,
        childList: true
    });
}


function startObserving(){
    var ob = new MutationObserver(function (mutations, me) {
    // `mutations` is an array of mutations that occurred
    // `me` is the MutationObserver instance
    var content = document.getElementById('content');
    if (content) {
        window.isNewYoutube = document.getElementsByTagName("ytd-app").length != 0;
        observe(content);
        me.disconnect(); // stop observing
        return;
    }
    });

    // start observing
    ob.observe(document, {
    childList: true,
    subtree: true
    });
}