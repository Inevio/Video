    
    var win     = $( this );
    var video   = $( 'video',win );
    var cmdTime = 0;
    var timeNow = 0;

    var interval = 0;

    var sendTime = function(){
        remote.send( Date.now(), 'timeupdate', video[ 0 ].currentTime, !video[ 0 ].paused );
    };

    var startInterval = function(){

        sendTime();
        clearInterval( interval );

        interval = setInterval( function(){
            sendTime();
        }, 2000 );

    };

    var stopInterval = function(){

        sendTime();
        clearInterval( interval );
    
    };

    video
    .on('durationchange', function(){

        remote.send( Date.now(), 'durationchange', this.duration );

        video
        .on('play',function(){
            startInterval();
        })
        
        .on('pause',function(){
            stopInterval();
        })

        .on('progress',function(){
            
            var buffer = 0;

            try{
                buffer = this.buffered.end(0);
            }catch(e){}
                        
            remote.send( Date.now(), 'progress', buffer / this.duration );
                 
        });

        video[ 0 ].play();

    });

    win
    .on( 'remoteMessage', function( e, msg, data ){

        var newTime = data[ 0 ][ 0 ];
        var cmd     = data[ 0 ][ 1 ];

        if( newTime < cmdTime ){
            return false;
        }

        cmdTime = newTime;

        if( cmd === 'play' ){
            video[ 0 ].play();
        }else{
            video[ 0 ].pause();
        }

    });

    if( params.command === 'openFile' ){

        wz.structure( params.data.id , function( error, structure ){

            // To Do -> Error
            
            video.empty();

            video.append( $('<source></source>').attr('type','video/webm').attr('src', structure.formats.webm.url) );
            video.append( $('<source></source>').attr('type','video/mp4').attr('src', structure.formats.mp4.url) );

            video.load();
            
        });

    }
