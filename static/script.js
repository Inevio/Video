
// Constant
var VIEW_MARGIN = 50;
var HIDE_DURATION = 1000;
var SHOW_DURATION = 500;

// Local variables
var win      = $( this );
var video    = $('video');
var uiBarTop = $('.wz-ui-header');
var uiTitle  = $('.video-title');
var mobile   = typeof cordova !== 'undefined'

if( mobile ){

  win.addClass('mobile');
  var uiBarBottom       = $('.video-bottom.video-bottom-mobile');
  var uiProgress        = $('.video-bottom-mobile .video-progress');
  var uiProgressBack    = $('.video-bottom-mobile .video-backprogress');
  var uiProgressBuffer  = $('.video-bottom-mobile .video-buffer');
  var uiTime            = $('.video-bottom-mobile .time');
  var uiTimeCurrent     = $('.video-bottom-mobile .currentTime');
  var uiTimeSeeker      = $('.video-bottom-mobile .video-time-seeker');
  var uiTimeTotal       = $('.video-bottom-mobile .totalTime');
  var uiVolume          = $('.video-bottom-mobile .video-volume-current');
  var uiVolumeMax       = $('.video-bottom-mobile .video-volume-max');
  var uiVolumeSeeker    = $('.video-bottom-mobile .video-volume-seeker');

}else{

  var uiBarBottom       = $('.video-bottom.video-bottom-desktop');
  var uiProgress        = $('.video-bottom-desktop .video-progress');
  var uiProgressBack    = $('.video-bottom-desktop .video-backprogress');
  var uiProgressBuffer  = $('.video-bottom-desktop .video-buffer');
  var uiTime            = $('.video-bottom-desktop .time');
  var uiTimeCurrent     = $('.video-bottom-desktop .currentTime');
  var uiTimeSeeker      = $('.video-bottom-desktop .video-time-seeker');
  var uiTimeTotal       = $('.video-bottom-desktop .totalTime');
  var uiVolume          = $('.video-bottom-desktop .video-volume-current');
  var uiVolumeMax       = $('.video-bottom-desktop .video-volume-max');
  var uiVolumeSeeker    = $('.video-bottom-desktop .video-volume-seeker');

}

var isWebKit          = /webkit/i.test( navigator.userAgent );
var prevClientX       = 0;
var prevClientY       = 0;
var hideControlsTimer = 0;
var normalWidth       = 0;
var normalHeight      = 0;

/*
 * Las operaciones de cambio de tiempos por drag son muy exigentes en cuanto a procesador,
 * por lo que las emulamos con un pequeño lag.
 * Las variables que declaramos a continuación están pensadas para ello.
 * Ponemos un timer para de vez en cuando forzar que pueda cachear
 */
var emulatedSeekerTimer = 0;
var emulatedSeekerTime  = 0;

// Start app
uiVolume.width( uiVolumeMax.width() );
uiVolumeSeeker.css( 'x', uiVolumeMax.width() - uiVolumeSeeker.width() );

if( location.hostname.indexOf('file') === 0 ){
  win.addClass('link-mode');
  win.parent().removeClass('wz-draggable');
}

// Functions
var loadItem = function( data ){

  console.log( data )

  if( params.dropbox ){

    api.integration.dropbox( params.dropbox, function( err, account ){

      account.get( data.id, function( err, fsnode ){

        if( fsnode.mime !== 'video/mp4' ){

          var dialog = api.dialog()
          dialog.setTitle(lang.invalidFormat)
          dialog.setText(lang.invalidDescription)
          dialog.setButton(0,wzLang.core.dialogAccept)
          return dialog.render(function(){
            api.app.removeView( win )
          })

        }

        video.empty();
        video.append( $('<source></source>').attr('type','video/mp4').attr('src', 'https://download.horbito.com/dropbox/' + fsnode.account + '/' + encodeURIComponent( fsnode.id )) )
        video.load();

      })

    })

  }else if( params.gdrive ){

    api.integration.gdrive( params.gdrive, function( err, account ){

      account.get( data.id, function( err, fsnode ){

        if( fsnode.mimeType !== 'video/mp4' ){

          var dialog = api.dialog()
          dialog.setTitle(lang.invalidFormat)
          dialog.setText(lang.invalidDescription)
          dialog.setButton(0,wzLang.core.dialogAccept)
          return dialog.render(function(){
            api.app.removeView( win )
          })

        }

        video.empty();
        video.append( $('<source></source>').attr('type','video/mp4').attr('src', 'https://download.horbito.com/gdrive/' + fsnode.account + '/' + encodeURIComponent( fsnode.id )) )
        video.load();

      })

    })

  }else if( params.onedrive ){

    api.integration.onedrive( params.onedrive, function( err, account ){

      account.get( data.id, function( err, fsnode ){

        if( fsnode.mime !== 'video/mp4' ){

          var dialog = api.dialog()
          dialog.setTitle(lang.invalidFormat)
          dialog.setText(lang.invalidDescription)
          dialog.setButton(0,wzLang.core.dialogAccept)
          return dialog.render(function(){
            api.app.removeView( win )
          })

        }

        video.empty();
        video.append( $('<source></source>').attr('type','video/mp4').attr('src', 'https://download.horbito.com/onedrive/' + fsnode.account + '/' + encodeURIComponent( fsnode.id )) )
        video.load();

      })

    })

  }else{

    api.fs( data.id, function( error, structure ){

      structure.getFormats( function( error, formats ){

        if( formats['video/mp4'] ){
          video.empty();
          video.append( $('<source></source>').attr('type','video/mp4').attr('src', formats['video/mp4'].url) )
        }else{

          var dialog = api.dialog()
          dialog.setTitle(lang.conversionPending)
          dialog.setText(lang.conversionDescription)
          dialog.setButton(0,wzLang.core.dialogAccept)
          return dialog.render(function(){
            api.app.removeView( win )
          })

        }

        /*if( win.hasClass('link-mode') ){
          console.log(structure)
          video.attr('poster', structure.icons[512])
        }*/
        
        video.load();


        if( formats.original.metadata.media.video.resolutionSquare ){
          resizeVideo( formats.original.metadata.media.video.resolutionSquare.w, formats.original.metadata.media.video.resolutionSquare.h, true );
        }else{
          resizeVideo( formats.original.metadata.media.video.resolution.w, formats.original.metadata.media.video.resolution.h, true );
        }

        uiTitle.text( structure.name );

      });

    });

  }

};

var toggleFullscreen = function(){

  video[ 0 ].play();

  if( win.hasClass( 'fullscreen' ) ){

    console.log('llego1');
    api.tool.exitFullscreen();
    win.removeClass('fullscreen');
    if( mobile ){
      showControls();
      screen.lockOrientation('portrait');
    }

  }else{

    if( win[ 0 ].requestFullScreen ){
      win[ 0 ].requestFullScreen();
    }else if( win[ 0 ].webkitRequestFullScreen ){

      console.log('llego2');
      win[ 0 ].webkitRequestFullScreen();
      win.addClass('fullscreen');
      if( mobile ){
        hideControls();
        screen.lockOrientation('landscape');
      }

    }else if( win[ 0 ].mozRequestFullScreen ){
      win[ 0 ].mozRequestFullScreen();
    }else if( video[ 0 ].webkitEnterFullscreen ){

      win.addClass('fullscreen');
      video[ 0 ].webkitEnterFullscreen();
      if( mobile ){
        hideControls();
        screen.lockOrientation('landscape');
      }

    }else{
      alert( lang.fullscreenSupport );
    }

    normalWidth  = win.width();
    normalHeight = win.height();

  }

};

var resizeVideo = function( width, height, limit ){

  width  = width.replace(/\s/g, '');
  width  = parseInt( width, 10 );
  height = height.replace(/\s/g, '');
  height = parseInt( height, 10 );

  if( limit ){

    if( mobile ){

      var widthRatio  = width / ( win.width() );
      var heightRatio = height / ( win.height() );

      if( widthRatio > 1 || heightRatio > 1 ){

        if( widthRatio > heightRatio ){

          width  = win.width();
          height = height / widthRatio;

        }else{

          width  = width / heightRatio;
          height = win.height();

        }

      }

    }else{

      var widthRatio  = width / ( api.tool.desktopWidth() - ( VIEW_MARGIN * 2 ) );
      var heightRatio = height / ( api.tool.desktopHeight() - ( VIEW_MARGIN * 2 ) );

      if( widthRatio > 1 || heightRatio > 1 ){

        if( widthRatio > heightRatio ){

          width  = api.tool.desktopWidth() - ( VIEW_MARGIN * 2 );
          height = height / widthRatio;

        }else{

          width  = width / heightRatio;
          height = api.tool.desktopHeight() - ( VIEW_MARGIN * 2 );

        }

      }

      api.fit( win, width - win.width(), height - win.height() );
      win.deskitemX( parseInt( ( api.tool.desktopWidth() - win.width() ) / 2, 10 ) );
      win.deskitemY( parseInt( ( api.tool.desktopHeight() - win.height() ) / 2, 10 ) );

    }

  }

  updateBars();

};

var updateBars = function(){

  var backWidth = uiProgressBack.width();

  uiProgress.width( backWidth * ( video[ 0 ].currentTime / video[ 0 ].duration ) );
  uiTimeSeeker.css( 'x', ( backWidth - uiTimeSeeker.width() ) * ( video[ 0 ].currentTime / video[ 0 ].duration ) );
  updateProgressBar( true );

};

var updateProgressBar = function( noAnimate ){

  var buffer = 0;

  try{
    buffer = video[ 0 ].buffered.end( 0 );
  }catch(e){}

  var width = ( uiProgressBack.width() * ( buffer / video[ 0 ].duration ) );
  //console.log(width, uiProgressBack.width(), ( buffer / video[ 0 ].duration ));

  if( width > 0 ){

    if( noAnimate ){
      uiProgressBuffer.stop().clearQueue().width( width );
    }else{
      uiProgressBuffer.stop().clearQueue().transition( { width : width }, 100 );
    }

  }

};

var hideControls = function(){

  if( win.hasClass( 'hidden-controls') ){
      return;
  }

  uiBarTop.stop().clearQueue();
  uiBarBottom.stop().clearQueue();
  win.addClass( 'hidden-controls' );

  uiBarTop.transition( { opacity : 0 }, 500 );
  uiBarBottom.transition( { opacity : 0 }, 500 );

};

var showControls = function(){

  if( !win.hasClass( 'hidden-controls') ){
    return;
  }

  uiBarTop.stop().clearQueue();
  uiBarBottom.stop().clearQueue();
  win.removeClass( 'hidden-controls' );

  uiBarTop.transition( { opacity : 1 }, 500 );
  uiBarBottom.transition( { opacity : 1 }, 500 );

};

// Events
win.on( 'app-param', function( e, params ){

  if( params && params.command === 'openFile' ){
    loadItem( params );
  }

})

.on( !mobile ? 'click' : 'tap', 'video', function(){

  if( !mobile ){

    if( win.hasClass('playing') ){
      video[ 0 ].pause();
    }else{
      video[ 0 ].play();
    }

  }else{

    if( win.hasClass( 'hidden-controls' ) ){
      showControls();
    }else{
      hideControls();
    }

  }

})

.on( 'click', '.ui-fullscreen', function(){
  toggleFullscreen();
});

video.on( 'error' ,function(){
  console.log(arguments);
});

video.on( 'durationchange', function(){

  var time = this.duration;
  var hour = parseInt( time / 3600, 10 );
  var rem  = time % 3600;
  var min  = parseInt( rem / 60, 10 );
  var sec  = parseInt( rem % 60, 10 );

  if( hour > 0 && min < 10 ){ min  = '0' + min; }
  if( sec < 10 ){ sec = '0' + sec; }

  if( 9 < hour ){

    uiTimeCurrent.text('00:00:00');
    uiTimeTotal.text(hour+':'+min+':'+sec);

  }else if( 0 < hour && hour < 10 ){

    uiTimeCurrent.text('0:00:00');
    uiTimeTotal.text(hour+':'+min+':'+sec);

  }else if( 9 < min ){

    uiTimeCurrent.text('00:00');
    uiTimeTotal.text(min+':'+sec);

  }else{

    uiTimeCurrent.text('0:00');
    uiTimeTotal.text(min+':'+sec);

  }

  uiVolumeSeeker.addClass('wz-dragger-x');
  uiTimeSeeker.addClass('wz-dragger-x');

  video[ 0 ].play();
  //Hide spinner
  $( '.spinner' ).removeClass( 'active' );

  if( mobile ){

    var uiProgressBackWidth = 2 * parseInt( uiTime.css('margin-left') ) + 2 * ( parseInt( uiTimeCurrent.outerWidth(true) ) + 1 );
    uiProgressBack.css('width', 'calc(100% - ' + uiProgressBackWidth +'px)');

  }

  win.on( !mobile ? 'mousedown' : 'touchstart', '.play', function(){

    if( win.hasClass('playing') ){
      video[ 0 ].pause();
    }else{
      video[ 0 ].play();
    }

  })

  .on( !mobile ? 'mousedown' : 'touchstart', '.volume-icon', function(){

    if( win.hasClass('muted') ){
      video[ 0 ].muted = false;
    }else{
      video[ 0 ].muted = true;
    }

  })

  .on( 'wz-dragmove', '.video-volume-seeker', function( e, posX, posY ){

    if( win.hasClass('muted') ){
      video[ 0 ].muted = false;
    }

    uiVolume.css( 'width', posX * uiVolumeMax.width() );

    video[ 0 ].volume = 1 * posX;

  })

  .on( 'wz-dragmove', '.video-time-seeker', function( e, posX, posY ){

    // Usar el de Music
    video[ 0 ].pause();

    if( !emulatedSeekerTimer ){

      emulatedSeekerTimer = setInterval( function(){
        video[ 0 ].currentTime = emulatedSeekerTime;
      }, 100 );

    }

    uiProgress.css( 'width', posX * uiProgressBack.width() );

    /*
     * Como cambiar el currentTime de un elemento es un proceso costoso
     * para el procesador, emulamos ese proceso
     */
    emulatedSeekerTime = video[ 0 ].duration * posX;

    var time      = video[ 0 ].duration;
    var totalHour = parseInt( time / 3600, 10 );
    var rem       = time % 3600;
    var totalMin  = parseInt( rem / 60, 10 );
    time          = emulatedSeekerTime;
    var hour      = parseInt( time / 3600, 10 );
    rem           = ( time % 3600 );
    var min       = parseInt( rem / 60, 10 );
    var sec       = parseInt( rem % 60, 10 );

    if( totalHour > 9 && hour < 10 ){ hour = '0' + hour; }
    if( ( totalHour > 0 && min < 10 ) || ( totalMin > 10 && min < 10 ) ){
      min = '0' + min;
    }
    if( sec < 10 ){ sec  = '0' + sec; }

    if( totalHour ){
      uiTimeCurrent.text( hour + ':' + min + ':' + sec );
    }else if( totalMin ){
      uiTimeCurrent.text( min + ':' + sec );
    }else{
      uiTimeCurrent.text( '0:' + sec );
    }

  })

  .on( 'click', '.wz-view-minimize', function(){

    if( win.hasClass('fullscreen') ){
      toggleFullscreen();
    }

  })

  .on( 'mouseleave', function(){

    if(
      !uiTimeSeeker.hasClass('wz-drag-active') &&
      !uiVolumeSeeker.hasClass('wz-drag-active') &&
      !win.hasClass('maximized')
    ){
      hideControls();
    }

  })

  .on( 'mouseenter', function(){

    if( mobile ){
      return
    }

    if(
      !uiTimeSeeker.hasClass('wz-drag-active') &&
      !uiVolumeSeeker.hasClass('wz-drag-active') &&
      !win.hasClass('maximized')
    ){
      showControls();
    }

  })

  .on( 'wz-dragend', '.video-time-seeker', function(){

    clearInterval( emulatedSeekerTimer );
    emulatedSeekerTimer    = 0;
    video[ 0 ].currentTime = emulatedSeekerTime;
    video[ 0 ].play();

  })

  .on( !mobile ? 'mousedown' : 'touchstart', '.rewind', function(){
    video[ 0 ].currentTime -= 10;
  })

  .on( !mobile ? 'mousedown' : 'touchstart', '.forward', function(){
    video[ 0 ].currentTime += 10;
  })

  .on( 'enterfullscreen', function(){

    win.addClass('fullscreen');
    console.log('entro fullscreen');
    if( !mobile ){
      api.fit( win, screen.width - normalWidth, screen.height - normalHeight );
      updateBars();
    }

  })

  .on( 'exitfullscreen', function(){

    console.log('salgo fullscreen');
    win.removeClass('fullscreen');
    if( !mobile ){
      api.fit( win, normalWidth - win.width(), normalHeight - win.height() );
      updateBars();
    }

  })

  .on( 'dblclick ', 'video', toggleFullscreen )

  .on( 'mousemove', function( e ){

    if( mobile ){
      return
    }

    if( e.clientX !== prevClientX || e.clientY !== prevClientY ){

      prevClientX = e.clientX;
      prevClientY = e.clientY;

      clearTimeout( hideControlsTimer );

      if( win.hasClass( 'hidden-controls' ) ){
        showControls();
      }

      if( ( win.hasClass('maximized') || win.hasClass('fullscreen') ) && win.hasClass( 'playing' ) ){

        hideControlsTimer = setTimeout( function(){
            hideControls();
        }, 3000 );

      }

    }

  })

  .on( 'ui-view-resize ui-view-resize-end ui-view-maximize ui-view-unmaximize', updateBars )

  .on( 'ui-view-maximize', function(){
    win.addClass( 'maximized' );
  })

  .on( 'ui-view-unmaximize', function(){
    win.removeClass( 'maximized' );
  })

  .key( 'space', function(){

      if( win.hasClass('playing') ){
          video[ 0 ].pause();
      }else{
          video[ 0 ].play();
      }

  })

  .key( 'enter', function(){
    toggleFullscreen();
  })

  .key(
      'right',
      function(){ video[ 0 ].currentTime += 10; },
      function(){ video[ 0 ].currentTime += 10; }
  )

  .key(
      'left',
      function(){ video[ 0 ].currentTime -= 10; },
      function(){ video[ 0 ].currentTime -= 10; }
  )

  .key(
      'up',
      function(){

          if( video[ 0 ].volume + 0.1 < 1){
              video[ 0 ].volume += 0.1;
          }else{
              video[ 0 ].volume = 1;
          }

      },
      function(){

          if( video[ 0 ].volume + 0.1 < 1){
              video[ 0 ].volume += 0.1;
          }else{
              video[ 0 ].volume = 1;
          }

      }
  )

  .key(
      'down',
      function(){

          if( video[ 0 ].volume - 0.1 > 0){
              video[ 0 ].volume -= 0.1;
          }else{
              video[ 0 ].volume = 0;
          }

      },
      function(){

          if( video[ 0 ].volume - 0.1 > 0){
              video[ 0 ].volume -= 0.1;
          }else{
              video[ 0 ].volume = 0;
          }

      }
  )

  .key(
      'backspace',
      function(){ video[ 0 ].currentTime = 0; }
  );

  video
  .on( 'play', function(){
    win.addClass('playing');
  })

  .on( 'pause', function(){
    win.removeClass('playing');
  })

  .on( 'timeupdate', function( e ){

    var time      = this.duration;
    var totalHour = parseInt( time / 3600, 10 );
    var rem       = time % 3600;
    var totalMin  = parseInt( rem / 60, 10 );
    time          = this.currentTime;
    var hour      = parseInt( time / 3600, 10 );
    rem           = time % 3600;
    var min       = parseInt( rem / 60, 10 );
    var sec       = parseInt( rem % 60, 10 );

    if( totalHour > 9 && hour < 10){ hour = '0' + hour; }
    if( ( totalHour > 0 && min < 10 ) || ( totalMin > 10 && min < 10 ) ){
     min = '0' + min;
    }
    if( sec < 10 ){ sec  = '0'+sec; }

    if(totalHour){
      uiTimeCurrent.text(hour+':'+min+':'+sec);
    }else if(totalMin){
      uiTimeCurrent.text(min+':'+sec);
    }else{
      uiTimeCurrent.text('0:'+sec);
    }

    var backWidth = uiProgressBack.width();

    uiProgress.width( backWidth * ( this.currentTime / this.duration ) );

    if( !uiTimeSeeker.hasClass('wz-drag-active') ){
      uiTimeSeeker.css( 'x', ( backWidth - uiTimeSeeker.width() ) * ( this.currentTime / this.duration ) );
    }

  })

  .on( 'progress', updateProgressBar )

  .on('ended', function(){

      //showControls();

    if( !uiTimeSeeker.hasClass('wz-drag-active') ){

      var time = this.duration;
      var hour = parseInt( time / 3600, 10 );

      uiProgress.width( 0 );
      uiTimeSeeker.css( { x : 0 } );

      if( parseInt( hour, 10 ) ){
          uiTimeCurrent.text('00:00:00');
      }else{
          uiTimeCurrent.text('00:00');
      }

      this.currentTime = 0;
      this.pause();

    }

  })

  .on( 'volumechange', function(){

    if( this.muted ){
      win.addClass('muted');
    }else{
      win.removeClass('muted');
    }

    if( !uiVolumeSeeker.hasClass('wz-drag-active') ){

      uiVolume.css( 'width', this.volume * uiVolumeMax.width() );
      uiVolumeSeeker.css( 'x', Math.floor( this.volume * ( uiVolumeMax.width() - uiVolumeSeeker.width() ) ) );

    }

  });

  if( mobile ){

    video
    .on( 'webkitbeginfullscreen', function(){})

    .on( 'webkitendfullscreen', function(){
      screen.lockOrientation('portrait')
    })

  }

});
