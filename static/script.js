    
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
    var hidingControls          = 0;
    var prevClientX             = 0;
    var prevClientY             = 0;
    var isWebKit                = /webkit/i.test( navigator.userAgent );
    
    win.on( 'app-param', function( e, params ){

        if( win.hasClass( 'wz-win-minimized' ) ){
            win.removeClass( 'wz-win-minimized' );
        }

        if( params && params.length ){
        
            wz.structure( params[0], function( error, structure ){
                
                video.empty();

                video.append( $('<source></source>').attr('type','video/webm').attr('src', structure.formats.webm.url) );
                video.append( $('<source></source>').attr('type','video/mp4').attr('src', structure.formats.mp4.url) );

                resizeVideo( structure.metadata.media.video.resolution.w, structure.metadata.media.video.resolution.h );

                weevideoTitle.text( structure.name ).add( weevideoTitle.prev() ).transition({ opacity: 1 }, 250 );
                video.load();
                
            });
            
        }
        
    });

    var resizeVideo = function( width, height ){

        if( wz.tool.desktopWidth() * 0.55 / width < wz.tool.desktopHeight() * 0.7 / height ){

            if( width < wz.tool.desktopWidth() * 0.55 ){

                if( width < parseInt( win.css( 'min-width' ), 10 ) ){

                    win.css({

                        width  : parseInt( win.css( 'min-width' ), 10 ),
                        height : parseInt( win.css( 'min-height' ), 10 )

                    });

                }else{

                    win.css({

                        width  : width,
                        height : height

                    });

                }

            }else{

                win.css({

                    width  : wz.tool.desktopWidth() * 0.55,
                    height : height * ( wz.tool.desktopWidth() * 0.55 / width )

                });

            }

        }else{

           if( height < wz.tool.desktopHeight() * 0.7 ){

                if( height < parseInt( win.css( 'min-height' ), 10 ) ){

                    win.css({

                        width  : parseInt( win.css( 'min-width' ), 10 ),
                        height : parseInt( win.css( 'min-height' ), 10 )

                    });

                }else{

                    win.css({

                        width  : width,
                        height : height

                    });

                }

            }else{

                win.css({

                    width  : width * ( wz.tool.desktopHeight() * 0.7 / height ),
                    height : wz.tool.desktopHeight() * 0.7

                });

            } 

        }

        win.deskitemX( parseInt( wz.tool.environmentWidth() / 2 - win.width() / 2 - wz.tool.environmentWidth() + wz.tool.desktopWidth(), 10 ) );
        win.deskitemY( parseInt( wz.tool.environmentHeight() / 2 - win.height() / 2, 10 ) );

    }

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
            else if( win[0].webkitRequestFullScreen ){ win[0].webkitRequestFullScreen(); }
            else if( win[0].mozRequestFullScreen ){ win[0].mozRequestFullScreen(); }
            else{ alert( lang.fullscreenSupport, null, win.data().win ); }
            
        }

    };

    var hideControls = function(){

        weevideoTop.stop().clearQueue();
        weevideoBottom.stop().clearQueue();

        if( isWebKit ){
            weevideoTop.animate( { top : -172 }, 1000 );
            weevideoBottom.animate( { bottom : -138 }, 1000 );
        }else{
            weevideoTop.transition( { top : -172 }, 1000 );
            weevideoBottom.transition( { bottom : -138 }, 1000 );
        }

        win.addClass( 'hidden-controls' );

    };

    var showControls = function(){

        if( !win.hasClass( 'resizing' ) ){

            weevideoTop.stop().clearQueue();
            weevideoBottom.stop().clearQueue();

            if( isWebKit ){
                weevideoTop.animate( { top : 0 }, 500 );
                weevideoBottom.animate( { bottom : 0 }, 500 );
            }else{
                weevideoTop.transition( { top : 0 }, 500 );
                weevideoBottom.transition( { bottom : 0 }, 500 );
            }

            win.removeClass( 'hidden-controls' );
            win.css( 'cursor', 'default' );

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

            if( !weevideoSeeker.hasClass('wz-drag-active') && !weevideoVolumeSeeker.hasClass('wz-drag-active') && !win.hasClass( 'maximized' ) ){

                hideControls();                    

            }
            
        })

        .on('mouseenter', function(){

            if( !weevideoSeeker.hasClass('wz-drag-active') && !weevideoVolumeSeeker.hasClass('wz-drag-active') && !win.hasClass( 'maximized' ) ){

                showControls();

            }
            
        })
        
        .on('wz-dragend', function(){
            
            if( !win.is( ':hover' ) ){
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

            win.css( 'top', 0 );
            win.width( screen.width );
            win.height( screen.height );

            win.addClass('fullscreen maximized wz-drag-ignore').css({ 'border-radius' : 0 , x : 0 , y : 0 });

            $( '.wz-win-menu', win ).css( 'border-radius', 0 );
            
        })
        
        .on('exitfullscreen', function(){

            win.width( oldWidth );
            win.height( oldHeight );
            win.css( 'top', '' );
            
            win.removeClass('fullscreen maximized wz-drag-ignore').css({ 'border-radius' : '3px' , x : weevideoPositionX , y : weevideoPositionY });

            $( '.wz-win-menu', win ).css( 'border-radius', '3px 3px 0 0' );
            
        })

        .on('dblclick', 'video, .weevideo-top-shadow, .weevideo-bottom-shadow', function(){
            
            goFullscreen();

        })

        .on( 'mousemove', function( e ){

            if( e.clientX !== prevClientX || e.clientY !== prevClientY ){

                prevClientX = e.clientX;
                prevClientY = e.clientY;

                clearTimeout( hidingControls );

                if( win.hasClass( 'hidden-controls' ) ){

                    showControls();
                    win.css( 'cursor', 'default' );

                }

                if( win.hasClass( 'maximized' ) && win.hasClass( 'play' ) ){

                    hidingControls = setTimeout( function(){

                        hideControls();
                        win.css( 'cursor', 'none' );

                    }, 3000 );

                }

            }

        })

        .on( 'wz-resize-start', function(){
            win.addClass( 'resizing' );
        })

        .on( 'wz-resize-end', function(){
            win.removeClass( 'resizing' );
        })

        .on( 'wz-maximize', function(){
            win.addClass( 'maximized' );
        })

        .on( 'wz-unmaximize', function(){
            win.removeClass( 'maximized' );
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
                wql.changeMute(1);
            }else{
                win.removeClass('muted');
                wql.changeMute(0);
            }      
            
            var volumePosition = this.volume*weevideoMaxVolume.width();
            weevideoVolume.css('width',volumePosition);
            weevideoVolumeSeeker.css({x:volumePosition});
            wql.changeVolume( this.volume );
            
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

            showControls();
            
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

        wql.getConfig( function( error, result ){

            if( result[0].mute ){
                video[0].muted = true;
            }

            video[0].volume = result[0].volume;

        });
        
    });
