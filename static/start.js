
var win            = $( this );
var volumePosition = 0;

wql.getConfig( function( error, result ){

    if( result.length ){

        if( result[0].mute ){

            win.addClass( 'muted' );

        }

        volumePosition = result[0].volume * $( '.weevideo-volume-max', win ).width();

        $( '.weevideo-volume-current', win ).css( 'width', volumePosition );
        $( '.weevideo-volume-seeker', win ).css({ x : volumePosition });

    }else{

        wql.insertConfig();

        volumePosition = $( '.weevideo-volume-max', win ).width();
        
        $( '.weevideo-volume-current', win ).css( 'width', volumePosition );
        $( '.weevideo-volume-seeker', win ).css({ x : volumePosition });

    }

    start();

});
