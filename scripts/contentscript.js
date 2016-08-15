'use strict';
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    chrome.storage.local.get(function(data){
        var blockKeywords = data.keywords;

        if(blockKeywords.length == 0)
            return;

        var searchTerm = $('[name="search_query"]')[0].value.toLowerCase();
        var videoTitle = $("#eow-title").text().toLowerCase();
        var descriptionText =$("#eow-description").text().toLowerCase();
        var title = document.title;

        var beginRe = "(?:-|\\s|\\W|^)";
        var endRe = "(?:-|\\s|\\W|$)";
        var keywordRe = "(?:" + blockKeywords.join("|") + ")";
        var blockRe = new RegExp(beginRe + keywordRe + endRe, "i");

        //Check if the remove from results option is checked
        if(data.removeFromResults){
            var videoLinks = document.getElementsByTagName('a');
            videoLinks = [].slice.call(videoLinks).filter(isYoutubeLink);

            if(location.pathname == '/'){
                videoLinks.forEach(function(videoLink, index, array){
                    if(blockRe.test(videoLink.title))
                        removeNodes(videoLink, 'yt-shelf-grid-item');
                });
                return;
            }

            if(location.pathname == '/results'){
                videoLinks.forEach(function(videoLink, index, array){
                    if(blockRe.test(videoLink.title)){
                        removeNodes(videoLink, 'yt-lockup yt-lockup-tile yt-lockup-video clearfix yt-uix-tile')
                    }
                });
                return;
            }
        }

        if(searchTerm.length != 0 || videoTitle.length != 0 || title.length != 0){
            var matchText = [searchTerm, videoTitle, title, data.checkDescription ? descriptionText : ""].join(" ");
            var searchMatchedKeyword = blockRe.test(matchText);

            if(searchMatchedKeyword)
                loadPopup(data.popOver.text, data.popOver.image);
        }
    })
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document.getElementById('content'), {
    subtree: true,
    attributes: true,
    elements: true,
    childList: true
});

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
    if(vid) vid.pause();
}

function isYoutubeLink(value){
    if(value.href && value.title != "" && typeof value.href != 'undefined')
        return value.href.indexOf('watch?') != -1;
    else
        return false;
}

function removeNodes(videoLink, classNames){
    var parNode = videoLink.parentNode;
    while(parNode.className && parNode.className != classNames){
        parNode = parNode.parentNode;
    }
    if(parNode.parentNode)
        parNode.parentNode.removeChild(parNode);
}