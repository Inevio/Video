
wz.app.addScript( 4, 'common', function( win, app, lang, params ){
    
    var video                   = $('video',win);
    var weevideoTop             = $('.weevideo-top',win);
    var weevideoBottom          = $('.weevideo-bottom-shadow',win);
    var weevideoCurrentTime     = $('.currentTime',win);
    var weevideoTotalTime       = $('.totalTime',win);
    var weevideoProgress        = $('.weevideo-info-progress',win);
    var weevideoBackprogress    = $('.weevideo-info-backprogress',win);
    var weevideoBufferprogress  = $('.weevideo-info-buffer',win);
    var weevideoSeeker          = $('.weevideo-info-seeker',win);
    var weevideoTitle           = $('.weevideo-title-text',win);
    var weevideoVolume          = $('.weevideo-volume-current',win);
    var weevideoVolumeSeeker    = $('.weevideo-volume-seeker',win);
    var weevideoMaxVolume       = $('.weevideo-volume-max',win);
    var weevideoPositionX       = 0;
    var weevideoPositionY       = 0;
    var oldWidth                = 0;
    var oldHeight               = 0;
    var hideControls            = 0;
    
    win.on( 'app-param', function( e, params ){

        if( params && params.length ){
        
            wz.structure( params[0], function( error, structure ){
                
                video.empty();
                video.append( $('<source></source>').attr('type','video/webm').attr('src', structure.formats.webm.url) );
                video.append( $('<source></source>').attr('type','video/mp4').attr('src', structure.formats.mp4.url) );
                weevideoTitle.text(structure.name).add( weevideoTitle.prev() ).transition({opacity:1},250);
                video.load();
                
            });
            
        }
        
    });

    var goFullscreen = function(){

        video[0].play();
        
        if( win.hasClass( 'fullscreen' ) ){
                            
            wz.tool.exitFullscreen();
            
        }else{

            weevideoPositionX = win.css( 'x' );
            weevideoPositionY = win.css( 'y' );
            oldWidth          = win.width();
            oldHeight         = win.height();
            
            if( win[0].requestFullScreen ){ win[0].requestFullScreen(); }
            if( win[0].webkitRequestFullScreen ){ win[0].webkitRequestFullScreen(); }
            if( win[0].mozRequestFullScreen ){ win[0].mozRequestFullScreen(); }
            
        }

    };
    
    video.on('durationchange', function(){
        
        var time    = this.duration;
        var hour    = parseInt( time / 3600, 10 );
        var rem     = time % 3600;
        var min     = parseInt( rem / 60, 10 );
        var sec     = parseInt( rem % 60, 10 );
    
        if( hour > 0 && min < 10 ){ min  = '0' + min; }
        if( sec < 10 ){ sec = '0' + sec; }
        
        weevideoBackprogress.transition({opacity:1},250);
    
        if( 9 < hour ){
            weevideoCurrentTime.transition({opacity:1},250).text('00:00:00');
            weevideoTotalTime.transition({opacity:1},250).text(hour+':'+min+':'+sec);
        }else if( 0 < hour && hour < 10 ){
            weevideoCurrentTime.transition({opacity:1},250).text('0:00:00');
            weevideoTotalTime.transition({opacity:1},250).text(hour+':'+min+':'+sec);
        }else if( 9 < min ){
            weevideoCurrentTime.transition({opacity:1},250).text('00:00');
            weevideoTotalTime.transition({opacity:1},250).text(min+':'+sec);
        }else{
            weevideoCurrentTime.transition({opacity:1},250).text('0:00');
            weevideoTotalTime.transition({opacity:1},250).text(min+':'+sec);
        }
        
        var volumePosition = this.volume*weevideoMaxVolume.width();
        weevideoVolume.css('width',volumePosition);
        weevideoVolumeSeeker.css({x:volumePosition});
        weevideoVolumeSeeker.addClass('wz-dragger-x');
        weevideoSeeker.addClass('wz-dragger-x');
        
        video[0].play();
        
        $( win )
        
            .on('wz-dragmove', '.weevideo-volume-seeker', function(e,posX,posY){
                
                if( win.hasClass('muted') ){
                    video[0].muted = false;
                }
                
                weevideoVolume.css('width',posX * weevideoMaxVolume.width());
                
                video[0].volume = 1*posX;
                
            })
            
            .on('wz-dragmove', '.weevideo-info-seeker', function(e,posX,posY){
                
                video[0].pause();
                
                weevideoProgress.css('width',posX * weevideoBackprogress.width());
                
                video[0].currentTime = video[0].duration*posX;
                
            })
                    
            .on('click', '.weevideo-controls-play, video, .weevideo-top-shadow, .weevideo-bottom-shadow', function(){

                    if( win.hasClass('play') ){
                        video[0].pause();
                    }else{
                        video[0].play();
                    }

            })
            
            .on('click', '.weevideo-volume-icon', function(){
                
                if( win.hasClass('muted') ){
                    video[0].muted = false;
                }else{
                    video[0].muted = true;
                }
                
            })
            
            .on('click', '.wz-win-fullscreen', function(){

                goFullscreen();
                
            })
            
            .on('mouseleave', function(){
        
                if( !weevideoSeeker.hasClass('wz-drag-active') && !weevideoVolumeSeeker.hasClass('wz-drag-active') && !win.hasClass( 'fullscreen' ) ){
                    weevideoTop.stop(true).transition({top:-172},1000);
                    weevideoBottom.stop(true).transition({bottom:-138},1000);
                }
                
            })
    
            .on('mouseenter', function(){
    
                weevideoTop.stop(true).transition({top:0},500);
                weevideoBottom.stop(true).transition({bottom:0},500);
                
            })
            
            .on('wz-dragend', function(){
                
                if( !$('.wz-win:hover').is( win ) ){
                    win.mouseleave();
                }
                
            })
            
            .on('wz-dragend', '.weevideo-info-seeker', function(){
                
                video[0].play();
                
            })
            
            .on('click', '.weevideo-controls-rewind', function(){
                
                video[0].currentTime -= 10;
                
            })
            
            .on('click', '.weevideo-controls-forward', function(){
                
                video[0].currentTime += 10;
                
            })
            
            .on('enterfullscreen', function(){
    
                win.addClass('fullscreen wz-drag-ignore').css({ 'border-radius' : 0 , x : 0 , y : 0 });
                $( '.weevideo-controls', win ).css( 'margin-left', ( win.width() - 155 - 138 - $( '.weevideo-controls', win ).width() ) / 2 - 10 + 'px' );
                wz.fit( win, win.width() / oldWidth, win.height() / oldHeight );
                $( '.wz-win-menu', win ).css( 'border-radius', 0 );
                oldWidth = win.width();
                oldHeight = win.height();
                
            })
            
            .on('exitfullscreen', function(){
                
                win.removeClass('fullscreen wz-drag-ignore').css({ 'border-radius' : '7px' , x : weevideoPositionX , y : weevideoPositionY });
                $( '.weevideo-controls', win ).css( 'margin-left', '50px' );
                wz.fit( win, win.width() / oldWidth, win.height() / oldHeight );
                $( '.wz-win-menu', win ).css( 'border-radius', '7px 7px 0 0' );
                
            })

            .on('dblclick', 'video, .weevideo-top-shadow, .weevideo-bottom-shadow', function(){
                
                goFullscreen();
    
            })

            .on( 'mousemove', function(){

                clearTimeout( hideControls );

                if( win.hasClass( 'hidden-controls' ) ){

                    weevideoTop.stop( true ).transition({ top : 0 }, 500 );
                    weevideoBottom.stop( true ).transition({ bottom : 0 }, 500 );
                    win.removeClass( 'hidden-controls' );
                    win.css( 'cursor', 'default' );

                }

                if( win.hasClass( 'fullscreen' ) && win.hasClass( 'play' ) ){

                    hideControls = setTimeout( function(){

                        weevideoTop.stop( true ).transition({ top : -172 }, 1000 );
                        weevideoBottom.stop( true ).transition({ bottom : -138 }, 1000 );
                        win.addClass( 'hidden-controls' );
                        win.css( 'cursor', 'none' );

                    }, 3000 );

                }

            })
            
            .key('space', function(){
            
                if( win.hasClass('play') ){
                    video[0].pause();
                }else{
                    video[0].play();
                }
                
            })
            
            .key('enter', function(){
            
                goFullscreen();
                
            })
            
            .key(
                'right',
                function(){ video[0].currentTime += 10; },
                function(){ video[0].currentTime += 10; }
            )
            
            .key(
                'left',
                function(){ video[0].currentTime -= 10; },
                function(){ video[0].currentTime -= 10; }
            )
            
            .key(
                'up',
                function(){
                    if((video[0].volume + 0.1) < 1){
                        video[0].volume += 0.1;
                    }else{
                        video[0].volume = 1;
                    }
                },
                function(){
                    if((video[0].volume + 0.1) < 1){
                        video[0].volume += 0.1;
                    }else{
                        video[0].volume = 1;
                    }
                }
            )
            
            .key(
                'down',
                function(){
                    if((video[0].volume - 0.1) > 0){
                        video[0].volume -= 0.1;
                    }else{
                        video[0].volume = 0;
                    }
                },
                function(){
                    if((video[0].volume - 0.1) > 0){
                        video[0].volume -= 0.1;
                    }else{
                        video[0].volume = 0;
                    }
                }
            )
            
            .key(
                'backspace',
                function(){ video[0].currentTime = 0; }
            );
        
        video
        
            .on('play',function(){
                win.addClass('play');
            })
            
            .on('pause',function(){
                win.removeClass('play');
            })
            
            .on('volumechange', function(){
                
                if( this.muted ){
                    win.addClass('muted');
                }else{
                    win.removeClass('muted');
                }
                
                
                var volumePosition = this.volume*weevideoMaxVolume.width();
                weevideoVolume.css('width',volumePosition);
                weevideoVolumeSeeker.css({x:volumePosition});
                
            })
            
            .on('timeupdate', function(e){
                            
                var time      = this.duration;
                var totalHour = parseInt( time / 3600, 10 );
                var rem       = time % 3600;
                var totalMin  = parseInt( rem / 60, 10 );
                            
                time        = this.currentTime;
                var hour    = parseInt( time / 3600, 10 );
                rem         = time % 3600;
                var min     = parseInt( rem / 60, 10 );
                var sec     = parseInt( rem % 60, 10 );
                
                if( totalHour > 9 && hour < 10){ hour = '0' + hour; }
                if( totalHour > 0 || (totalMin > 10 && min < 10)){ min  = '0' + min; }
                if( sec < 10 ){ sec  = '0'+sec; }
                            
                if(totalHour){
                    weevideoCurrentTime.text(hour+':'+min+':'+sec);
                }else if(totalMin){
                    weevideoCurrentTime.text(min+':'+sec);
                }else{
                    weevideoCurrentTime.text('0:'+sec);
                }
                
                var pos = weevideoBackprogress.width()*(this.currentTime/this.duration);
    
                weevideoProgress.width(pos);
                
                if( !weevideoSeeker.hasClass('wz-drag-active') ){
                    weevideoSeeker.css({x:pos});
                }
                
            })
            
            .on('progress',function(){
                
                var buffer = 0;

                try{
                    buffer = this.buffered.end(0);
                }catch(e){}
                
                var width = ( weevideoBackprogress.width() * ( buffer / this.duration ) );
                
                if( width > 0 ){
                    weevideoBufferprogress.transition( { width : width },100);
                }
                        
            })
            
            .on('ended', function(){

                weevideoTop.stop( true ).transition({ top : 0 }, 500 );
                weevideoBottom.stop( true ).transition({ bottom : 0 }, 500 );
                win.css( 'cursor', 'default' );
                
                if( !weevideoSeeker.hasClass('wz-drag-active') ){
                    
                    var time = this.duration;
                    var hour = parseInt( time / 3600, 10 );
                    weevideoProgress.width(0);
                    weevideoSeeker.css({x:0});
                    
                    if( parseInt( hour, 10 ) ){
                        weevideoCurrentTime.text('00:00:00');
                    }else{
                        weevideoCurrentTime.text('00:00');
                    }
                    
                    this.currentTime = 0;
                    this.pause();
                    
                }
                            
            });
        
    });
         
});
