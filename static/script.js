
wz.app.addScript( 4, 'common', function( win, params ){
    
    var video 					= $('video',win);
    var weevideoTop 			= $('.weevideo-top',win);
    var weevideoBottom 			= $('.weevideo-bottom-shadow',win);
    var weevideoCurrentTime 	= $('.currentTime',win);
    var weevideoTotalTime 		= $('.totalTime',win);
    var weevideoProgress		= $('.weevideo-info-progress',win);
    var weevideoBackprogress 	= $('.weevideo-info-backprogress',win);
    var weevideoBufferprogress 	= $('.weevideo-info-buffer',win);
    var weevideoSeeker 			= $('.weevideo-info-seeker',win);
    var weevideoTitle 			= $('.weevideo-title-text',win);
	var weevideoVolume 			= $('.weevideo-volume-current',win);
	var weevideoVolumeSeeker 	= $('.weevideo-volume-seeker',win);
	var weevideoMaxVolume 		= $('.weevideo-volume-max',win);
    
    if( params && params.length ){
        
        wz.structure( params[0], function( error, structure ){
            
            video.append( $('<source></source>').attr('type','video/webm').attr('src', structure.formats.webm.url) );
            video.append( $('<source></source>').attr('type','video/mp4').attr('src', structure.formats.mp4.url) );
            weevideoTitle.text(structure.name).add( weevideoTitle.prev() ).transition({opacity:1},250);
            
        });
        
    }
    
	video.on('durationchange', function(){
		
		var time 	= this.duration;
		var hour 	= parseInt(time/3600);
		var rem     = (time%3600);
		var min     = parseInt(rem/60);
		var sec     = parseInt(rem%60);
	
		if(hour > 0 && min < 10){ min  = '0' + min }
		if(sec < 10){ sec  = '0' + sec }
		
		weevideoBackprogress.transition({opacity:1},250);
	
		if(9 < hour){
			weevideoCurrentTime.transition({opacity:1},250).text('00:00:00');
			weevideoTotalTime.transition({opacity:1},250).text(hour+':'+min+':'+sec);
		}else if(0 < hour && hour < 10){
			weevideoCurrentTime.transition({opacity:1},250).text('0:00:00');
			weevideoTotalTime.transition({opacity:1},250).text(hour+':'+min+':'+sec);
		}else if(9 < min){
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
			
			.on('click', '.wz-win-maximize', function(){
				
				if( win.hasClass('maximized') ){
					
					if( video[0].cancelFullScreen ){ video[0].cancelFullScreen(); }
					if( video[0].webkitCancelFullScreen ){ video[0].webkitCancelFullScreen(); }
					if( video[0].mozCancelFullScreen ){ video[0].mozCancelFullScreen(); }       
					
				}else{
					
					if( video[0].requestFullScreen ){ video[0].requestFullScreen(); }
					if( video[0].webkitRequestFullScreen ){ video[0].webkitRequestFullScreen(); }
					if( video[0].mozRequestFullScreen ){ video[0].mozRequestFullScreen(); }
					
				}
				
			})
			
			.on('mouseleave', function(){
		
				if( !weevideoSeeker.hasClass('wz-drag-active') && !weevideoVolumeSeeker.hasClass('wz-drag-active') ){
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
	
				win.addClass('fullscreen');
				
			})
			
			.on('exitfullscreen', function(){
				
				win.removeClass('fullscreen');
				
			})
			
			.on('dblclick', function(){
				
				video[0].play();
		
				if( win.hasClass('fullscreen') ){
									
					wz.tool.exitFullscreen();     
					
				}else{
					
					if( video[0].requestFullScreen ){ video[0].requestFullScreen(); }
					if( video[0].webkitRequestFullScreen ){ video[0].webkitRequestFullScreen(); }
					if( video[0].mozRequestFullScreen ){ video[0].mozRequestFullScreen(); }
					
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
			
				if( win.hasClass('fullscreen') ){
	
					wz.tool.exitFullscreen();
					
				}else{
					
					if( video[0].requestFullScreen ){ video[0].requestFullScreen(); }
					if( video[0].webkitRequestFullScreen ){ video[0].webkitRequestFullScreen(); }
					if( video[0].mozRequestFullScreen ){ video[0].mozRequestFullScreen(); }
					
				}
				
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
				var totalHour = parseInt(time/3600);
				var rem       = (time%3600);
				var totalMin  = parseInt(rem/60);
							
				var time    = this.currentTime;
				var hour    = parseInt(time/3600);
				var rem     = (time%3600);
				var min     = parseInt(rem/60);
				var sec     = parseInt(rem%60);
				
				if(totalHour > 9 && hour < 10){ hour = '0' + hour}    
				if(totalHour > 0 || (totalMin > 10 && min < 10)){ min  = '0' + min }
				if(sec < 10){ sec  = '0'+sec }
							
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
							
				try{
					var buffer  = this.buffered.end(0);
				}catch(e){}
				
				var width = (weevideoBackprogress.width()*(buffer/this.duration));
				
				if(width > 0){
					weevideoBufferprogress.transition({width:width},100);
				}
						
			})
			
			.on('ended', function(){
				
				if( !weevideoSeeker.hasClass('wz-drag-active') ){
					
					var time = this.duration;
					var hour = parseInt(time/3600);
					weevideoProgress.width(0);
					weevideoSeeker.css({x:0});
					
					if(parseInt(hour)){
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
