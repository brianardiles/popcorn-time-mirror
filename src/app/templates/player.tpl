<div class="player-header-background vjs-control-bar">
    <i class="state-info-player fa fa-play"></i>
    <i class="state-info-player fa fa-pause"></i>
    <div class="player-title"></div>
    <div class="details-player">
        <span class="quality-info-player"></span>
        <span class="fa fa-times close-info-player"></span>
        <div class="download-info-player">
            <i class="fa fa-eye eye-info-player"></i>
            <div class="details-info-player">
                <div class="arrow-up"></div>
                <span class="speed-info-player"><%= i18n.__("Download") %>:&nbsp;</span><span class="download_speed_player value"><%= Common.fileSize(0) %>/s</span>
                <br>
                <span class="speed-info-player"><%= i18n.__("Upload") %>:&nbsp;</span><span class="upload_speed_player value"><%= Common.fileSize(0) %>/s</span>
                <br>
                <span class="speed-info-player"><%= i18n.__("Active Peers") %>:&nbsp;</span><span class="active_peers_player value">0</span>
                <br>
                <span class="speed-info-player"><%= i18n.__("Downloaded") %>:&nbsp;</span><span class="downloaded_player value">0</span>
            </div>
        </div>
    </div>
</div>
<div class="trailer_mouse_catch"></div>
<div class="vjs-control-window item-next" >
    <div class="item-poster">
        <h1><%= i18n.__("Playing Next").toUpperCase() %></h1>
        <div class="media-poster">
        <div class="overlay">
        <span id="playnextcountdown">60</span>
       <div class="circular-bar">
  <input type="text" class="dial" data-width="85" data-height="85" data-linecap=round value="0">
  <div class="circular-bar-content">
  </div>
</div>
      
         </div>
         </div>
    </div>
    <div class="item-summary">
        <h1 class="media-title"></h1>
        <h2 class="media-subtitle-1"></h2>
        <h3 class="media-subtitle-2"></h3>
    <div class="auto-next-btn playnownextNOT"><%= i18n.__("No thank you") %></div>
            <div class="auto-next-btn playnownext"><%= i18n.__("Play Now") %></div>
    </div>
</div>
<div id="player" class="player"></div>

    
    <video controls id="loading_player" width="20%" height="20%" style="display:none" preload="none"></video>
