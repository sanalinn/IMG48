// ==UserScript==
// @name        IMG48
// @author      hyww13
// @namespace   http://paruru.csie.org/IMG48.html
// @downloadURL http://paruru.csie.org/IMG48.user.js
// @version     1.1.0
// @description IMG48
// @match       7gogo.jp/*
// @match       twitter.com/*
// @match       plus.google.com/*
// @match       ngt48.com/photolog*
// @match       www2.ske48.co.jp/*
// @match       www.ske48.co.jp/blog*
// @match       spn.ske48.co.jp/report*
// @match       sp.ske48.co.jp/*
// @match       ameblo.jp/*
// @match       www.instagram.com/*
// @match       www.weibo.com/*
// @match       vine.co/*
// @match       www.youtube.com/embed/*plus.google.com*
// @connect     imgur.com
// @connect     7gogo.jp
// @connect     stat.7gogo.jp
// @connect     moviestat.7gogo.jp
// @connect     twimg.com
// @connect     twitter.com
// @connect     googleusercontent.com
// @connect     googlevideo.com
// @connect     ameba.jp
// @connect     cdninstagram.com
// @connect     fbcdn.net
// @connect     ngt48.com
// @connect     ske48.co.jp
// @connect     sinaimg.cn
// @connect     vine.co
// @require     http://code.jquery.com/jquery-2.1.4.min.js
// @require     https://github.com/eligrey/FileSaver.js/raw/master/FileSaver.min.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @copyright   2017, hyww13
// ==/UserScript==


(function() {
  'use strict';
  var twitter_video_cache={};
  // http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
  function Uint8ToString(u8a){
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
    }
    return c.join("");
  }
  function onProgress(win){
    return function(prog){
      return;
      if(!prog.lengthComputable)return;
      if(prog.total < 10*1024*1024)return; // < 10MB
      if(!win){
        win = window.open('', '_blank');
        win.document.body.innerHTML='<style>.s {position: absolute; width: 75px; height: 60px; text-align: center; font-size: 10px; margin: auto; left: 0; top: 0; right: 0; bottom: 0;} .s > div { background-color: #fb4c42; height: 100%; width: 9px; display: inline-block; -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out; animation: sk-stretchdelay 1.2s infinite ease-in-out; } .s .rect2 { -webkit-animation-delay: -1.1s; animation-delay: -1.1s; } .s .rect3 { -webkit-animation-delay: -1.0s; animation-delay: -1.0s; } .s .rect4 { -webkit-animation-delay: -0.9s; animation-delay: -0.9s; } .s .rect5 { -webkit-animation-delay: -0.8s; animation-delay: -0.8s; } @-webkit-keyframes sk-stretchdelay { 0%, 40%, 100% { -webkit-transform: scaleY(0.4) } 20% { -webkit-transform: scaleY(1.0) } } @keyframes sk-stretchdelay { 0%, 40%, 100% { transform: scaleY(0.4); -webkit-transform: scaleY(0.4); } 20% { transform: scaleY(1.0); -webkit-transform: scaleY(1.0); } }</style><div class="s"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div><h3 class="prog">0%</h3></div>';
        $(window).on('beforeunload', function(){
          $(window).trigger('unload');
          return 'Abort downloading?';
        });
      }
      var per = (prog.loaded/prog.total*100).toString().replace(/(\d+\.\d{0,2})\d*/, "$1%");
      //console.log(per);
      win.document.querySelector('.prog').innerHTML = prog.total+'   '+per;
      win.document.title = per;
    };
  }
  function onLoad(win, filename, type){
    return function(response){
      if(response.status==403){
        alert("Failed. 403 forbidden.");
        console.log("Failed. 403 forbidden.");
        return;
      }
      var data = new Uint8Array(response.responseText.length);
      var j = 0;
      while(j < data.length){
        data[j] = response.responseText.charCodeAt(j);
        j++;
      }
      //url = 'data:'+type+';base64,'+btoa(Uint8ToString(data));
      //$('<a download="'+filename+'" href="+'+url+'">')[0].click();
      //console.log('Download using data URI\n'+url)
      console.log('Downlaod using Blob');
      var blob = new Blob([data], {'type': type});
      saveAs(blob, filename);
      if(win){
        $(window).off('beforeunload');
        win.close();
      }
    };
  }
  var $imgContextmenu = $('<div id="imgContextmenu"><div class="options">Open</div><div class="options">Save</div><div class="options IMG48img">Save As</div><div class="options">Imgur</div></div>').appendTo('body').hide();
  $(window).on('click', function(e){
    console.log(e);
    $imgContextmenu.hide();
    if(e.target.matches('.options')){
      var url = $imgContextmenu.attr('data-url').replace(/^(https?:\/\/pbs.twimg.com\/media\/.+)(\.[a-zA-Z]+)(:.+)?/, "$1$2:orig#$2");  //twitter
      url = url.replace(/^(https?:\/\/pbs\.twimg\.com\/profile_images\/\d+\/.+)_(.+)\.(.+)/, "$1.$3");  //twitter avatar
      url = url.replace(/^(https?:\/\/lh\d+.googleusercontent.com\/.+\/)(.+)(\/.+)/,"$1s0$3").replace(/^(https?:\/\/lh\d+.googleusercontent.com\/.+)=(s0|w\d+|h\d+|p|k|rw|no|fh|d)(-s0|-w\d+|-h\d+|-p|-k|-rw|-no|-fh|-d)*/,"$1=s0");  //g+
      url = url.replace(/^(https?:\/\/stat\.ameba\.jp\/.+\/)(.+)_(.+)/, "$1o$3").replace(/^(https?:\/\/stat(\.profile)?\.ameba\.jp\/.+)\?cpd=\d+$/, "$1");  //ameblo
      url = url.replace(/^(https?:\/\/.+\.(cdninstagram\.com|fbcdn\.net)\/.+?\/)(s\d+x\d+\/|sh[0-9.]+\/|e\d+\/|c[0-9.]+\/)*([^?]+)(\?.*)?/, "$1$4");  //igs
      url = url.replace(/^(https?:\/\/stat\.7gogo\.jp\/appimg_images\/.+\/)t06000800p(\..+)/, "$1o14401920p$2").replace(/^(https?:\/\/stat\.7gogo\.jp\/appimg_images\/.+\/)t08000600p(\..+)/, "$1o19201440p$2");  //755
      url = url.replace(/^(https?:\/\/.[a-z0-9]+\.sinaimg\.cn\/).+(\/.[a-z0-9]+)/,"$1large$2");
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

          var headers = {};
          if(url.match(/https?:\/\/img\.ngt48\.com\/artist_photo_stream\/.+/))headers = {"Referer": "https://ngt48.com/photolog/"};
          var win = null;

          if(!type || type=="video/mp4"){
            GM_xmlhttpRequest({
              method: "HEAD",
              url: url,
              onload: function(response) {
                console.log(response);
                var length = null;
                if(!type && response.responseHeaders.match(/[\s\S]*content-type:\s+(.+)[\s\S]*/)){
                  type = response.responseHeaders.replace(/[\s\S]*content-type:\s+(.+)[\s\S]*/,"$1");
                  console.log('Get type '+type+' from header.');
                }
                if(type=="video/mp4" && response.responseHeaders.match(/[\s\S]*content-length:\s+(.+)[\s\S]*/)){
                  length = response.responseHeaders.replace(/[\s\S]*content-length:\s+(.+)[\s\S]*/,"$1");
                  console.log('Get length '+length+' from header.');
                }
                if(!type || (length && length > 5*1024*1024)){// 5MB
                  console.log('Direct download');
                  $('<a download="'+filename+'" href="'+url+'">')[0].click();
                }
                else{
                  GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    overrideMimeType: "text/plain; charset=x-user-defined",
                    headers: headers,
                    onload: onLoad(win, filename, type),
                    onprogress: onProgress(win)
                  });
                }
              }
            });
          }
          else{
            GM_xmlhttpRequest({
              method: "GET",
              url: url,
              overrideMimeType: "text/plain; charset=x-user-defined",
              headers: headers,
              onload: onLoad(win, filename, type),
              onprogress: onProgress(win)
            });
          }
          break;
        case 'Imgur':
          if(url.match(/.+\.(mp4)$/i)){
            window.open('http://imgur.com/vidgif/video?url='+encodeURIComponent(url), '_blank');
            break;
          }
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
    console.log(e.target);
    $imgContextmenu.removeAttr('data-url');
    $imgContextmenu.find('*').show();
    var url;
    if(e.target.matches('img.imgeventnone')){ //ngt
      console.log('ngt single');
      url = $(e.target).prev('img.imgprotect').attr('src');
      $imgContextmenu.find('div:contains(Imgur)').hide();
    }
    else if(e.target.matches('span.image_bg')){ //ngt list
      console.log('ngt list');
      url = $(e.target).css('background-image').replace(/^url\("(.+)"\)$/, "$1");
      $imgContextmenu.find('div:contains(Imgur)').hide();
    }
    else if(e.target.matches('span.guard')){  //ske list spn
      console.log('ske list');
      url = $(e.target).parents('.blog_img').find('img.cont_img').attr('src').replace(/(.+\/)(blog_thumbnail)(\/.+)/, "$1blog2$3");
    }
    else if(e.target.matches('img[src$="spacer.gif"]')){  //ske single pc
      console.log('ske single');
      url = $(e.target).parent('p').css('background-image').replace(/^url\("(.+\/)(blog)(\/.+)"\)$/, "$1blog2$3");  
    }
    else if(e.target.matches('img')){
      console.log('img');
      url = e.target.src;
    }
    else if(e.target.matches('div#nextNavi')){  //ameblo single
      console.log('ameblo single');
      url = $('#imgBox img').attr('src');
    }
    else if(e.target.matches('li.WB_pic')){ //weibo list
      console.log('weibo');
      url = $(e.target).children('img')[0].src;
    }
    else if(e.target.matches('div.Owner__headerImage')){  //755 header
      console.log('755 header');
      url = $(e.target).attr('style').replace(/.+url\("?([^"]+)"?\)(.+)?/, "$1");
    }
    /* 755 doesn't block downloading video
    else if($(e.target).is('video[src^="https://moviestat.7gogo.jp/output/"]')){  //755 video
      console.log('755 video');
      url = e.target.src;
      $imgContextmenu.find('.IMG48img').hide();
    }
    */
    /* removed because cannot get URL of full-sized photo
    else if($(e.target).is('div.ImageMovie[style*="stat.7gogo.jp/appimg_images"]')){  //755 grid
      console.log('755 grid');
      url = $(e.target).attr('style').replace(/.+url\("?([^"]+)"?\)(.+)?/, "$1");
    }
    */
    else if(e.target.matches('div.GalleryNav')){  //twitter
      console.log('twitter');
      url = $(e.target).prevAll('.Gallery-media').find('img').attr('src');
    }
    else if(e.target.matches('div.stream div.media-overlay')){  //twitter stream
      console.log('twitter stream');
      url = $(e.target).prevAll('img').attr('src');
    }
    else if(e.target.matches('div.ProfileCanopy-header')){  //twitter user header
      console.log('twitter user header');
      url = $(e.target).find('.ProfileCanopy-headerBg img').attr('src')+"#.jpg";
    }
    else if(e.target.matches('video[src^="https://v.cdn.vine.co/"]')){  //vine embedded in twitter
      console.log('twitter vine');
      url = e.target.src.replace(/\?.+$/,'');
    }
    else if(e.target.matches('.PlayableMedia-player *') || e.target.matches('.PlayableMedia-player')) { //twitter video and GIF
      console.log('twitter video');
      var id = $(e.target).parents('.tweet').data('tweet-id');
      console.log(id);
      if(twitter_video_cache[id]){
        $imgContextmenu.show().css({top:e.clientY+'px', left:e.clientX+'px'});
        $imgContextmenu.attr('data-url', url);
        console.log(url);
      }
      else{
        GM_xmlhttpRequest({
          method: 'GET',
          url: 'https://api.twitter.com/1.1/statuses/show.json?tweet_mode=extended&id='+id,
          headers: {
            "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAAF5bgwAAAAAAEeFg9GAGinIya%2Fyqmd5adupB1MI%3DydwpCYe0CKMJiBhFQO0xucMMt31dy9lDIGOEbG4JlXQt3Iqb7c"
          },
          onload: function(res){
            console.log(JSON.parse(res.responseText));
            var video = JSON.parse(res.responseText).extended_entities.media[0];
            var url = "";
            var bitrate = -1;
            var info = "Video info:";
            for(var i in video.video_info.variants){
              info+= "\n"+video.video_info.variants[i].content_type+" "+video.video_info.variants[i].url;
              if(video.video_info.variants[i].content_type != "video/mp4")continue;
              info+= " bitrate: "+video.video_info.variants[i].bitrate;
              if(video.video_info.variants[i].bitrate > bitrate){
                bitrate = video.video_info.variants[i].bitrate;
                url = video.video_info.variants[i].url;
              }
            }
            console.log(info);
            if(url==""){
              alert('Cannot find mp4 url');
              return;
            }
            twitter_video_cache[id] = url;
            $imgContextmenu.show().css({top:e.clientY+'px', left:e.clientX+'px'});
            $imgContextmenu.attr('data-url', url);
          }
        });
      }
      return false;
    }
    else if(e.target.matches('video[poster^="https://v.cdn.vine.co/"]')){ //vine (may be embedded in twitter)
      console.log('vine');
      url = $(e.target).attr('poster').replace(/.+(thumbs|videos)\/([^\/]+)\.(webm|mp4)?\.jpg.*/, "https://mtc.cdn.vine.co/r/videos_h264dash/$2.mp4");
      url = url.replace(/.+(thumbs|videos)\/(\d+\/)+(.+)\.(webm|mp4)?\.jpg.*/, "https://mtc.cdn.vine.co/v/videos/$3.mp4");  // some URLs are in old? format
      $imgContextmenu.find('.IMG48img').hide();
    }
    else if($(e.target).parents('a[href^="/p/"]').length>0){  //ig list
      console.log('ig list');
      url = $(e.target).parents('a').find('img').attr('src');
    }
    else if($(e.target).prev().is('div:has([src*="cdninstagram.com"], [src*="fbcdn.net"])')){ //ig single photo/video
      console.log('ig single');
      url = $(e.target).prev('div').find('video').attr('src')||$(e.target).prev('div').find('img[src*="cdninstagram.com"], img[src*="fbcdn.net"]').attr('src');
      if($(e.target).prev('div').find('video').length>0)$('#imgContextmenu .IMG48img').hide();
    }
    else if(e.target.matches('video')&&document.location.href.match(/.+www\.youtube\.com\/embed\/.+plus\.google\.com.+/)){  //plus video
      console.log('plus video');
      url = $(e.target).attr('src')+"#.mp4";
      $imgContextmenu.find('.IMG48img').hide();
    }
    else return true;
    console.log(url);
    $imgContextmenu.show().css({top:e.clientY+'px', left:e.clientX+'px'});
    $imgContextmenu.attr('data-url', url);
    return false;
  });
  GM_addStyle([
    '*{pointer-events: auto!important; }',
    '#imgContextmenu{z-index: 9999; position: fixed; background-color: white; width: 120px;}',
    '.options{text-align: left; color: black; font-family: sans-serif; font-size: 15px; cursor: default; padding: 3px;}',
    '.options:hover{background-color: #2196F3;}'
  ].join(''));
})();
