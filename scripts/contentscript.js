'use strict';
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    chrome.storage.local.get(function(data){
    	var blockKeywords = data.keywords;
    	var searchTerm = $('[name="search_query"]')[0].value.toLowerCase();
    	var videoTitle = $("#eow-title").text().toLowerCase();
        var title = document.title;

        //Check if the remove from results option is checked
        if(data.removeFromResults){
            function isYoutubeLink(value){
                if(value.href && value.title != "" && typeof value.href != 'undefined')
                    return value.href.indexOf('watch?') != -1;
                else
                    return false;
            }
            var videoLinks = document.getElementsByTagName('a');
            videoLinks = [].slice.call(videoLinks).filter(isYoutubeLink);

            if(location.pathname == '/'){
                videoLinks.forEach(function(videoLink, index, array){
                    var match = false;
                    blockKeywords.forEach(function(blockword, index, array){
                        if(videoLink.title.toLowerCase().indexOf(blockword.toLowerCase()) != -1){
                            match = true;
                        }
                    })
                    if(match){
                        var parNode = videoLink.parentNode;
                        while(parNode.className && parNode.className != 'yt-shelf-grid-item'){
                            parNode = parNode.parentNode;
                        }
                        if(parNode.parentNode)
                            parNode.parentNode.removeChild(parNode);
                    }
                });
                return;
            }
            if(location.pathname == '/results'){
                videoLinks.forEach(function(videoLink, index, array){
                    var match = false;
                    blockKeywords.forEach(function(blockword, index, array){
                        if(videoLink.title.toLowerCase().indexOf(blockword.toLowerCase()) != -1){
                            match = true;
                        }
                    })
                    if(match){
                        var parNode = videoLink.parentNode;
                        while(parNode.className && parNode.className != 'yt-lockup yt-lockup-tile yt-lockup-video clearfix yt-uix-tile'){
                            parNode = parNode.parentNode;
                        }
                        if(parNode.parentNode)
                            parNode.parentNode.removeChild(parNode);
                    }
                });
                return;
            }
        }

    	if(searchTerm.length != 0 || videoTitle.length != 0 || title.length != 0){
        	$.each(blockKeywords, function(id, keyword){
            	var sti = searchTerm.indexOf(keyword);
            	var vti = videoTitle.indexOf(keyword);
            	var pti = title.indexOf(keyword);
            	if((sti != -1 && (sti == 0 || searchTerm[sti - 1] == ' ')) || (vti != -1 && (vti == 0 || videoTitle[vti - 1] == ' ')) || (pti != -1 && (pti == 0 || title[pti - 1] == ' '))){
                	//load popup
                	loadPopup(data.popOver.text, data.popOver.image);
            	}
        	});
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