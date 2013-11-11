
    var win         = $( this );
    var play        = $( '.weevideo-controls-play', win );
    var rewind      = $( '.weevideo-controls-rewind', win );
    var forward     = $( '.weevideo-controls-forward', win );
    var title       = $( '.weevideo-title', win );
    var progressBar = $( '.weevideo-info-progress', win );
    var pearlTime   = $( '.weevideo-info-seeker', win );
    var bufferBar   = $( '.weevideo-info-buffer', win );
    var currentTime = $( '.currentTime', win );
    var totalTime   = $( '.totalTime', win );
    var infoWidth   = $( '.weevideo-info-backprogress', win ).width();
    var time        = 0;
    var totalHour   = 0;
    var totalMin    = 0;
    var cmdTime     = 0;
    var nextUpdate  = 0;

    var toTimeString = function( value ){
                        
        var hour = parseInt( value / 3600, 10 );
        var tmp  = value % 3600;
        var min  = parseInt( tmp / 60, 10 );
        var sec  = parseInt( tmp % 60, 10 );
        
        if( totalHour > 9 && hour < 10){ hour = '0' + hour; }
        if( totalHour > 0 || (totalMin > 10 && min < 10)){ min  = '0' + min; }
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
                currentTime.text( toTimeString( value + 1 ) );
            }, 1000 );

            progressBar
                .clearQueue()
                .stop()
                .animate( { width : ( ( value + 2 ) / time ) * 100 + '%' }, 2000 );

            pearlTime
                .clearQueue()
                .stop()
                .animate( { x : ( ( value + 2 ) / time ) * infoWidth + 'px' }, 2000 );

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
    .on( 'hold', function(){
        console.log('rewind');
    });

    forward
    .on( 'hold', function(){
        console.log('forward');
    });

    win
    .on( 'tvMessage', function( e, info, data ){
        
        var newTime = data[ 0 ][ 0 ];
        var cmd     = data[ 0 ][ 1 ];
        var value   = data[ 0 ][ 2 ];
        var playing = data[ 0 ][ 3 ];

        if( newTime < cmdTime ){
            return false;
        }

        cmdTime = newTime;

        if( cmd === 'timeupdate' ){
            updateProgressBar( value, playing );
        }else if( cmd === 'durationchange' ){

            time = value;

            totalTime.text( toTimeString( time ) );

        }else if( cmd === 'progress' ){
            updateBuffer( value );
        }/*else{
            video[ 0 ].pause();
        }*/

    })
    .on( 'wz-dragmove', function( e, x, y ){
        console.log( arguments );
    });

    if( params.command === 'openFile' ){

        wz.structure( params.data.id , function( error, structure ){

            time      = structure.metadata.media.duration.seconds;
            totalHour = parseInt( time / 3600, 10 );
            totalMin  = parseInt( ( time % 3600 ) / 60, 10 );

            title.text( structure.name );
            currentTime.text( toTimeString( 0 ) );
            totalTime.text( toTimeString( time ) );

        });

    }

