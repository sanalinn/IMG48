// ==UserScript==
// @name        IMG48
// @author      hyww13
// @namespace   http://paruru.csie.org/IMG48.html
// @downloadURL http://paruru.csie.org/IMG48.user.js
// @version     0.4
// @description IMG48
// @match       7gogo.jp/*
// @match       twitter.com/*
// @match       plus.google.com/*
// @match       ngt48.com/photolog*
// @match       ameblo.jp/*
// @match       www.instagram.com/*
// @match       logirl.favclip.com/*
// @connect     imgur.com
// @connect     7gogo.jp
// @connect     twimg.com
// @connect     googleusercontent.com
// @connect     ameba.jp
// @connect     cdninstagram.com
// @connect     ngt48.com
// @connect     favclip.com
// @require     http://code.jquery.com/jquery-2.1.4.min.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @copyright   2016, hyww13
// ==/UserScript==


(function() {
    'use strict';
	// http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
	function Uint8ToString(u8a){
		var CHUNK_SZ = 0x8000;
		var c = [];
		for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
			c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
		}
		return c.join("");
	}
	var $imgContextmenu = $('<div id="imgContextmenu"><div class="options">Open</div><div class="options">Save</div><div class="options">Save As</div><div class="options IMG48img">Imgur</div></div>').appendTo('body').hide();
	$(window).on('click', function(e){
		console.log(e);
		$('#imgContextmenu').hide();
		$('.PlayableMedia-player iframe').each(function(){$(this)[0].contentWindow.document.querySelector('#imgContextmenu').style.display='none';});
		if(e.target.matches('.options')){
			var url = $(e.target.parentNode).attr('data-url').replace(/(https?:\/\/pbs.twimg.com\/media\/.+)(\.[a-zA-Z]+)(:.+)?/, "$1$2:orig#$2");	//twitter
			url = url.replace(/(https?:\/\/lh\d+.googleusercontent.com\/.+\/)(.+)(\/.+)/,"$1s0$3");	//g+
			url = url.replace(/(https?:\/\/stat.ameba.jp\/.+\/)(.+)_(.+)/, "$1o$3");	//ameblo
			url = url.replace(/(https?:\/\/.+.cdninstagram.com\/.+?\/)((s\d+x\d+\/)?)([^?]+)(\?.*)?/, "$1$4");	//igs
			url = url.replace(/(.+.favclip.com\/.+?)(_(large|medium)|\?size=\d+)+/, "$1");	//logirl
			var filename = null;
			var type = null;
			switch($(e.target).text()){
				case 'Open':
					window.open(url, '_blank');
					break;
				case 'Save As':
					filename = prompt('Filename?', url.replace(/(:orig#.+|\?.+)$/i,'').replace(/^.+\/(.+)/, "$1"));
					if(!filename)break;
				case 'Save':
					if(!filename)filename = url.replace(/(:orig#.+|\?.+)$/i,'').replace(/^.+\/(.+)/, "$1");
					var origname = url.replace(/(:orig#.+|\?.+)$/i,'').replace(/^.+\/(.+)/, "$1");
					if(origname.match(/.+\.(png|bmp|jpeg|gif)$/i)){
						type = 'image/'+origname.replace(/.+\.(png|bmp|jpeg|gif)$/i, "$1").toLowerCase();
					}
					else if(origname.match(/.+\.jpg$/i)){
						type = 'image/jpeg';
					}
					else if(origname.match(/.+\.mp4$/i)){
						type = 'video/mp4';
					}
					console.log(type);
					if(!type){
						GM_xmlhttpRequest({
							method: "HEAD",
							url: url,
							onload: function(response) {
								console.log(response);
								if(response.responseHeaders.match(/[\s\S]*content-type:\s+(.+)[\s\S]*/)){
									type = response.responseHeaders.replace(/[\s\S]*content-type:\s+(.+)[\s\S]*/,"$1");
									console.log('Get type '+type+' from header.');
									GM_xmlhttpRequest({
										method: "GET",
										url: url,
										overrideMimeType: "text/plain; charset=x-user-defined",
										onload: function(response) {
											var data = new Uint8Array(response.responseText.length);
											var j = 0;
											while(j < data.length){
												data[j] = response.responseText.charCodeAt(j);
												j++;
											}
											console.log('Download using data URI');
											$('<a download="'+filename+'" href="data:'+type+';base64,'+btoa(Uint8ToString(data))+'">')[0].click();
										}
									});
								}
								else{
									console.log('Direct download');
									$('<a download="'+filename+'" href="'+url+'">')[0].click();
								}
							}
						});
					}
					else{
						GM_xmlhttpRequest({
							method: "GET",
							url: url,
							overrideMimeType: "text/plain; charset=x-user-defined",
							onload: function(response) {
								var data = new Uint8Array(response.responseText.length);
								var j = 0;
								while(j < data.length){
									data[j] = response.responseText.charCodeAt(j);
									j++;
								}
								console.log('Download using data URI');
								$('<a download="'+filename+'" href="data:'+type+';base64,'+btoa(Uint8ToString(data))+'">')[0].click();
							}
						});
					}
					break;
				case 'Imgur':
					var win = window.open('', '_blank');
					win.document.body.innerHTML='<style>.s {position: absolute; width: 75px; height: 60px; text-align: center; font-size: 10px; margin: auto; left: 0; top: 0; right: 0; bottom: 0;} .s > div { background-color: #fb4c42; height: 100%; width: 9px; display: inline-block; -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out; animation: sk-stretchdelay 1.2s infinite ease-in-out; } .s .rect2 { -webkit-animation-delay: -1.1s; animation-delay: -1.1s; } .s .rect3 { -webkit-animation-delay: -1.0s; animation-delay: -1.0s; } .s .rect4 { -webkit-animation-delay: -0.9s; animation-delay: -0.9s; } .s .rect5 { -webkit-animation-delay: -0.8s; animation-delay: -0.8s; } @-webkit-keyframes sk-stretchdelay { 0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 20% { -webkit-transform: scaleY(1.0) } } @keyframes sk-stretchdelay { 0%, 40%, 100% { transform: scaleY(0.4); -webkit-transform: scaleY(0.4); } 20% { transform: scaleY(1.0); -webkit-transform: scaleY(1.0); } }</style><div class="s"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>';
					$(window).on('beforeunload', function(){
						$(window).trigger('unload');
						if($('img.uploading').length>0)return 'Abort uploading?';
					});
					var $img = $('<img class="uploading" />').appendTo('body').hide();
					GM_xmlhttpRequest({
						method: 'POST',
						url: 'https://api.imgur.com/3/image',
						headers: {
							'Authorization': 'Client-ID f6435bec76f4fb4',
							"Content-Type": "application/x-www-form-urlencoded"
						},
						data: 'image='+encodeURIComponent(url),
						onload: function(res){
							console.log(res);
							var data = JSON.parse(res.responseText).data;
							console.log(data);
							if(data.error){
								win.close();
								$img.remove();
								alert(data.error);
							}
							else{
								GM_xmlhttpRequest({
									method: 'GET',
									url: data.link,
									onload: function(){
										win.document.location.href=data.link;
										$img.remove();
									}
								});
							}
						},
						error: function(res){win.close();$img.remove();console.log(res);alert('Failed:p');}
					});
					//$imgLoading.show();
					break;
			}
			return false;
		}
	});
    $(window).on('contextmenu', function(e){
		console.log(e);
		$('.PlayableMedia-player iframe').each(function(){$(this)[0].contentWindow.document.querySelector('#imgContextmenu').style.display='none';});
		$('.IMG48img').show();
		var url;
		if(e.target.matches('img.imgeventnone')){	//ngt
			url = $(e.target).prev('img.imgprotect').attr('src');
		}
		else if(e.target.matches('span.image_bg')){	//ngt list
			url = $(e.target).css('background-image').replace(/^url\("(.+)"\)$/, "$1");
			console.log(url);
		}
		else if(e.target.matches('img')){
			url = e.target.src;
		}
		else if(e.target.matches('div#nextNavi')){	//ameblo single
			url = $('#imgBox img').attr('src');
		}
		else if(e.target.matches('div.GalleryNav')){	//twitter
			url = $(e.target).prevAll('.Gallery-media').find('img').attr('src');
		}
		else if(e.target.matches('div.ProfileCanopy-header')){	//twitter user header
			url = $(e.target).find('.ProfileCanopy-headerBg img').attr('src');
		}
		else if(e.target.matches('.poster-image-container *')){	//twitter video thumb
			url = $(e.target).parents('.poster-image-container').prevAll('.player-wrapper').find('video').attr('src');
			$('.IMG48img').hide();
		}
		else if(e.target.matches('.poster-image-container')){	//twitter video thumb
			url = $(e.target).prevAll('.player-wrapper').find('video').attr('src');
			$('.IMG48img').hide();
		}
		else if(e.target.matches('.player-controls') || e.target.matches('.gif-play-pause')){	//twitter video and gif
			url = $(e.target).prevAll('.player-wrapper').find('video').attr('src');
			$('.IMG48img').hide();
		}
		else if(e.target.matches('div.article-detail-top-image') || e.target.matches('a.masonry-thumb') || e.target.matches('div.article-item-thumb')){	//logirl header or thumb for link
			url = $(e.target).find('img').attr('src');
		}
		else if($(e.target).parents('a[href^="/p/"]').length>0){	//ig list
			url = $(e.target).parents('a').find('img').attr('src');
		}
		else if($(e.target).attr('data-reactid')&&$(e.target).attr('data-reactid').match(/.+=1cdninstagram=1com.+/)){	//ig single
			url = $(e.target).attr('data-reactid').replace(/=1/g, '.').replace(/=2/g, ':').replace(/^.+http/, 'http');
		}
		else return true;
		console.log(url);
		$('#imgContextmenu').show().css({top:e.clientY+'px', left:e.clientX+'px'});
		$('#imgContextmenu').attr('data-url', url);
		return false;
	});
	GM_addStyle([
		'*{pointer-events: auto!important; }',
		'#imgContextmenu{z-index: 9999; position: fixed; background-color: white; width: 120px;}',
		'.options{text-align: left; color: black; font-family: sans-serif; font-size: 15px; cursor: default; padding: 3px;}',
		'.options:hover{background-color: #2196F3;}'
	].join(''));
})();