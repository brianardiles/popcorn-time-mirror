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
<div class="vjs-control-window item-next " style="display: none !important">
    <div class="item-poster">
        <h1><%= i18n.__("Playing Next").toUpperCase() %> IN: <span id="playnextcountdown">60</span></h1>
        <div class="media-poster"> </div>
    </div>
    <div class="item-summary">
        <h1 class="media-title"></h1>
        <h2 class="media-subtitle-1"></h2>
        <h3 class="media-subtitle-2"></h3>
        <p class="media-subtitle-3"></p>
    </div>
</div>
<% if(type==='trailer' ){ var videosrc=src; var videotype='video/youtube' ; }else{ if(App.Streamer.src){ var videosrc=App.Streamer.src; }else{ var videosrc=App.PreloadStreamer.src; } var videotype='video/mp4' ; } if(typeof subtitles !=="undefined" ){ var subArray=[ ]; for (var langcode in subtitles) { subArray.push({ "language": langcode, "languageName": (App.Localization.langcodes[langcode] !==undefined ? App.Localization.langcodes[langcode].nativeName : langcode), "sub": subtitles[langcode] }); } subArray.sort(function (sub1, sub2) { return sub1.language> sub2.language; }); var subtracks = ""; var defaultSub = "none"; if (typeof defaultSubtitle != "undefined") { defaultSub = defaultSubtitle; } for(var index in subArray ) { var imDefault = ""; if(defaultSub == subArray[index].language) imDefault = "default"; subtracks += '<track kind="subtitles" src="' + subArray[index].sub + '" srclang="'+ subArray[index].language +'" label="' + subArray[index].languageName + '" charset="utf-8" '+ imDefault +' />'; } } %>
    <video id="video_player" width="100%" height="100%" class="video-js vjs-popcorn-skin" controls preload="none">
        <source src="<%= videosrc %>" type="<%= videotype %>" />
        <%=subtracks%>
    </video>

