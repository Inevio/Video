    
    var win   = $( this );
    var video = $( 'video',win );
    
    if( params.command === 'openFile' ){

        wz.structure( params.data.id , function( error, structure ){

            // To Do -> Error
            
            video.empty();

            video.append( $('<source></source>').attr('type','video/webm').attr('src', structure.formats.webm.url) );
            video.append( $('<source></source>').attr('type','video/mp4').attr('src', structure.formats.mp4.url) );

            video.load();
            
        });

    }

    video.on('durationchange', function(){
        video[ 0 ].play();
    });

    win.on( 'remoteMessage', function(){

        if( video[ 0 ].paused ){
            video[ 0 ].play();
        }else{
            video[ 0 ].pause();
        }
        
    });