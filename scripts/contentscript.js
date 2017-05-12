'use strict';
window.newYoutube = typeof document.__polymerGestures !== 'undefined';

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

function isYoutubeLink(value){
    if(value.href && value.title != "" && typeof value.href != 'undefined')
        return value.href.indexOf('watch?') != -1;
    else
        return false;
}

function removeNodeByTag(videoLink, tagname){
    var node = videoLink.closest(tagname);
    node.parentNode.removeChild(node);
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
    videoLinks.forEach(function(videoLink, index, array){
        if(window.blockRe.test(videoLink.title)){
            if(document.getElementsByTagName('ytd-grid-video-renderer').length != 0){
                removeNodeByTag(videoLink, 'ytd-grid-video-renderer');
            }
            else{
                removeNodeByClassNames(videolink, 'yt-shelf-grid-item');
            }
        }                    
    });
}

function examineResults(){
    var videoLinks = document.getElementsByTagName('a');
    videoLinks = [].slice.call(videoLinks).filter(isYoutubeLink);
    videoLinks.forEach(function(videoLink, index, array){
        if(blockRe.test(videoLink.title)){
            if(document.getElementsByTagName('ytd-video-renderer').length != 0){
                removeNodeByTag(videoLink, 'ytd-video-renderer');
            } else{ 
                removeNodeByClassNames(videoLink, 'yt-lockup yt-lockup-tile yt-lockup-video clearfix yt-uix-tile');
            }
        }
    });
}

function examineVideo(){
    var videoTitle = "";
    var descriptionText = "";

    if(document.getElementsByTagName("ytd-watch").length != 0){

        videoTitle = document.getElementsByTagName("h1")[0];
        if(videoTitle)
            videoTitle = videoTitle.innerHTML.toLowerCase();
        else
            videoTitle = "";
        descriptionText = document.getElementById("description");
        if(descriptionText)
            descriptionText = descriptionText.innerHTML.toLowerCase();
        else
            descriptionText = "";
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
    if(searchTerm.length != 0 || videoTitle.length != 0 || title.length != 0){
        var matchText = [searchTerm, videoTitle, title, window.kbData.checkDescription ? descriptionText : ""].join(" ");
        var searchMatchedKeyword = blockRe.test(matchText);

        if(searchMatchedKeyword)
            loadPopup(window.kbData.popOver.text, window.kbData.popOver.image);
    }
}

chrome.storage.local.get(function(data){
    window.kbData = data;
    var blockKeywords = data.keywords;
    if(blockKeywords.length == 0)
        return;
    var beginRe = "(?:-|\\s|\\W|^)";
    var endRe = "(?:-|\\s|\\W|$)";
    var keywordRe = "(?:" + blockKeywords.join("|") + ")";
    window.blockRe = new RegExp(beginRe + keywordRe + endRe, "i");
})

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    if(!window.kbData) return;
    var blockKeywords = window.kbData.keywords;
    if(blockKeywords.length == 0)
        return;
    if(window.kbData.removeFromResults){
        if(location.pathname === "/"){
            examineFrontpage();
            return;
        }
        else if(location.pathname === "/results"){
            examineResults();
            return;
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

var ob = new MutationObserver(function (mutations, me) {
  // `mutations` is an array of mutations that occurred
  // `me` is the MutationObserver instance
  var content = document.getElementById('content');
  if (content) {
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