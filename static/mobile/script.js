
    var win         = $( this );
    var play        = $( '.weevideo-controls-play', win );
    var rewind      = $( '.weevideo-controls-rewind', win );
    var forward     = $( '.weevideo-controls-forward', win );
    var title       = $( '.weevideo-title', win );
    var backBar     = $( '.weevideo-info-backprogress', win );
    var progressBar = $( '.weevideo-info-progress', win );
    var pearlTime   = $( '.weevideo-info-seeker', win );
    var bufferBar   = $( '.weevideo-info-buffer', win );
    var currentTime = $( '.currentTime', win );
    var totalTime   = $( '.totalTime', win );
    var infoWidth   = backBar.width();
    var volumeWidth = $( '.weevideo-volume-max', win ).width();
    var volumeBar   = $( '.weevideo-volume-current', win );
    var pearlVolume = $( '.weevideo-volume-seeker', win );
    var time        = 0;
    var nowTime     = 0;
    var totalHour   = 0;
    var totalMin    = 0;
    var cmdTime     = 0;
    var nextUpdate  = 0;
    var volume      = 1;
    var seeking     = false;
    var holding     = false;

    var toTimeString = function( value ){
                        
        var hour = parseInt( value / 3600, 10 );
        var tmp  = value % 3600;
        var min  = parseInt( tmp / 60, 10 );
        var sec  = parseInt( tmp % 60, 10 );
        
        if( totalHour > 9 && hour < 10){ hour = '0' + hour; }
        if( ( totalHour > 0 || totalMin > 10 ) && min < 10 ){ min  = '0' + min; }
        if( sec < 10 ){ sec  = '0'+sec; }
                    
        if( totalHour ){
            return hour + ':' + min + ':' + sec;
        }else if( totalMin ){
            return min + ':' + sec;
        }else{
            return '0:' + sec;
        }

    };

    var updateProgressBar = function( value, playing ){

        clearInterval( nextUpdate );

        currentTime.text( toTimeString( value ) );

        if( playing ){

            nextUpdate = setTimeout( function(){

                nowTime = value + 1;

                currentTime.text( toTimeString( value + 1 ) );

            }, 1000 );

            progressBar
                .clearQueue()
                .stop()
                .animate( { width : ( ( value + 2 ) / time ) * 100 + '%' }, 2000, 'linear' );

            pearlTime
                .clearQueue()
                .stop()
                .animate( { x : ( ( value + 2 ) / time ) * infoWidth + 'px' }, 2000, 'linear' );

            win.addClass('play');

        }else{

            progressBar
                .clearQueue()
                .stop()
                .animate( { width : ( value / time ) * 100 + '%' }, 200 );

            pearlTime
                .clearQueue()
                .stop()
                .animate( { x : ( value / time ) * infoWidth + 'px' }, 200 );

        }

    };

    var updateBuffer = function( value ){
        
        bufferBar
            .clearQueue()
            .stop()
            .animate( { width : value * 100 + '%' }, 200 );

    };

    var startHolding = function( type ){

        clearInterval( holding );
        
        type = type === 'forward';

        if( type ){
            forward.trigger('tap');
        }else{
            rewind.trigger('tap');
        }

        holding = setInterval( function(){

            if( type ){
                forward.trigger('tap');
            }else{
                rewind.trigger('tap');
            }

        }, 500 );

    };

    var updateProgressBarInstant = function( x ){

        pearlTime.css( 'x', x * infoWidth );
        progressBar.css( 'width', x * infoWidth );
        currentTime.text( toTimeString( x * time ) );

    };

    play
    .on( 'tap', function(){

        if( win.hasClass('play') ){

            win.removeClass('play');
            remote.send( Date.now(), 'pause' );

        }else{

            win.addClass('play');
            remote.send( Date.now(), 'play' );

        }
        
    });

    rewind
    .on( 'tap', function(){

        nowTime = nowTime - 10;

        if( nowTime < 0 ){
            nowTime = 0;
        }

        updateProgressBarInstant( nowTime / time );
        remote.send( Date.now(), 'currentTime', nowTime );

    })

    .on( 'hold', function(){
        startHolding('rewind');
    });

    forward
    .on( 'tap', function(){

        nowTime = nowTime + 10;

        if( nowTime > time ){
            nowTime = time;
        }

        updateProgressBarInstant( nowTime / time );
        remote.send( Date.now(), 'currentTime', nowTime );

    })

    .on( 'hold', function(){
        startHolding('forward');
    });

    rewind.add( forward )
    .on( 'touchend', function(){

        clearInterval( holding );
        
        holding = false;

    });

    win
    .on( 'wz-dragend', '.weevideo-info-backprogress', function(){
        
        if( seeking ){

            seeking = false;
            remote.send( Date.now(), 'currentTime', time * ( progressBar.width() / infoWidth ) );
            remote.send( Date.now(), 'play' );

        }

    })

    .on( 'wz-dragmove', '.weevideo-info-backprogress', function( e, x, y ){

        if( !seeking ){

            seeking = true;
            remote.send( Date.now(), 'pause' );

        }

        updateProgressBarInstant( x );
        remote.send( Date.now(), 'currentTime', x * time );
        
    })

    .on( 'wz-dragmove', '.weevideo-volume-max', function( e, x, y ){

        volumeBar.width( x * 100 + '%' );
        remote.send( Date.now(), 'volume', x );

    })

    .on( 'app-param', function( e, params ){

        wz.fs( params.data.id , function( error, structure ){

            time      = structure.metadata.media.duration.seconds;
            totalHour = parseInt( time / 3600, 10 );
            totalMin  = parseInt( ( time % 3600 ) / 60, 10 );

            title.text( structure.name );
            currentTime.text( toTimeString( 0 ) );
            totalTime.text( toTimeString( time ) );

        });

    });

    pearlVolume.css( 'x', volumeWidth + 'px' );
