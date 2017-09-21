var myUserID  = api.system.user().id;

api.channel.on( 'userAdded' , function( channel , userAdded ){

  //api.channel( channel.id , function( e , channel ){

      if (api.app.getViews().length != 0) {
        api.app.getViews( 'main' ).trigger( 'getChats' , { id: channel.id } );
      }

  //});

});

api.channel.on( 'userRemoved' , function( channel , userRemoved ){



});

api.channel.on( 'message' , function( info , o ){

  // The app is oppened, so don't show the banner
  if (api.app.getViews().length != 0) {
    return;
  }

  // I am the sender , so don't show the banner
  if (info.sender == myUserID) {
    return;
  }

  // If recieved is a message increment Badge, and show the banner
  if ( o.action === 'inviteToCollab' ) {

    console.log( arguments );
    //api.app.openApp( 376 , { 'command' : 'openFile' , data : o.videoId, 'collab' : true, 'channelId' : info.id } , function( o ){});

    api.user( info.sender, function( error, user ){

      if( error ){
        return;
      }

      api.banner()
        .setTitle( user.fullName )
        .setText( 'Te ha invitado a ver un video' )
        .setIcon( user.avatar.tiny )
        .on( 'click', function(){

          //TODO funcion para sacar el id de mi app?
          api.app.openApp( 376 , { 'command' : 'openFile' , data : o.videoId, 'collab' : true, 'channelId' : info.id } , function( o ){});

        })
        .render();

    });

  }

});