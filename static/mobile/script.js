
	var win   = $( this );
	var play  = $( '.weevideo-controls-play', win );
    var title = $( '.weevideo-title', win );

    if( params.command === 'openFile' ){

		wz.structure( params.data.id , function( error, structure ){

            title.text( structure.name );

        });

	}

	play.on( 'tap', function(){
		remote.send('beep');
	});
