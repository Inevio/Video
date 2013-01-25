$('.wz-app-6')

.on('wz-new-window',function(){
    
    var video            = $('video',this);
    var videoAppArea    = $(this).children('.wz-app-area');
    var videoControls    = videoAppArea.children('.weevideo-controls');
    var videoCurrent    = videoControls.children('.weevideo-current');
    var videoTotal        = videoControls.children('.weevideo-total');
    
    var videoBackprogress    = videoControls.children('.weevideo-backprogress');
    var videoBufferprogress    = videoBackprogress.children('.weevideo-bufferprogress');
    var videoSeeker            = videoBackprogress.children('.weevideo-seeker');
    var videoProgress        = videoBackprogress.children('.weevideo-progress');
        
    video

        .on('volumechange', function(e){
                        
            if(this.muted && videoAppArea.hasClass('muted')){
                this.muted = false;
                return false;
            }
            
            if(this.muted){
                                
                videoAppArea.addClass('muted').removeClass('volume-0 volume-33 volume-66 volume-100');
                
            }else{
                
                if(this.volume == 0){
                    videoAppArea.addClass('volume-0').removeClass('muted volume-33 volume-66 volume-100');
                }else if(this.volume <= 0.33){
                    videoAppArea.addClass('volume-33').removeClass('muted volume-0 volume-66 volume-100');
                }else if(this.volume <= 0.66){
                    videoAppArea.addClass('volume-66').removeClass('muted volume-0 volume-33 volume-100');
                }else{
                    videoAppArea.addClass('volume-100').removeClass('muted volume-0 volume-33 volume-66');
                }
                
            }
            
        })        
        
})

.on('wz-dragend', '.weevideo-seeker', function(){
    
    var parent    = $(this).parents('.wz-app-area');
    var app        = parent.parents('.wz-app');
    
    parent.children('video')[0].play();
        
    if(!app.is(':hover')){
        app.mouseleave();
    }
    
})

.on('wz-dragend', '.weevideo-volume-seeker', function(){
    
    var app        = $(this).parents('.wz-app');
            
    if(!app.is(':hover')){
        app.mouseleave();
    }
    
})

.on('wz-dragend', '.weevideo-volume-seeker', function(){
    
    var panel = $(this).parents('.weevideo-volume-panel');
    
    if(!panel.is(':hover')){
        panel.mouseleave();
    }
    
})

.on('wz-dragmove', '.weevideo-seeker', function(e,drag,pos,per){
    
    var parent        = $(this).parent();
    var video        = parent.parents('.wz-app-area').children('video');
    
    video[0].pause();
    
    var parentWidth = parent.width();
    var seekerWidth = $(this).width();
        
    // Yep, this prevent the show timeupdate lag in the progress bar
    parent.children('.weevideo-progress').width((parentWidth*per.x) + ((1-per.x)*seekerWidth));
    
    var time = per.x*video[0].duration;
    
    video[0].currentTime = time;
    
})

.on('wz-dragmove', '.weevideo-volume-seeker', function(e,drag,pos,per){
    
    var parent        = $(this).parent();
    var video        = parent.parents('.wz-app-area').children('video');
    
    var parentHeight = parent.height();
    var seekerHeight = $(this).height();
    
    var height = (parentHeight*(1-per.y));
    
    parent.children('.weevideo-volume').css('top',parentHeight-height).height(height);
    
    video[0].volume = 1-per.y;
    
});