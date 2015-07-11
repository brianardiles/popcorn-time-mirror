<div class="bg-backdrop" data-bgr="<%= images.fanart %>"></div>
        <div class="overlay"></div>
        <div class="summary-wrapper">
            <div class="summary-overlay">
            <paper-icon-button class="back" icon="arrow-back"></paper-icon-button>
                <div class="title"><%= title %></div>
                <i class="zmdi zmdi-bookmark-outline zmdi-hc-lg bookmark-toggle"></i>
                <i class="zmdi zmdi-eye zmdi-hc-lg watched-toggle"></i>
                <i class="zmdi zmdi-arrow-left zmdi-hc-lg season-prev"></i>
                <div class="seasons-wrapper">
                    <ul class="seasons-container owl-carousel">
                        <li data-poster="<%= images.poster %>" data-id="0" class="active"><%= i18n.__( "Show Info") %></li>
                        <% var torrents = {},
                                seasontext;
                        _.each(episodes, function(value, currentEpisode) {
                            if (!torrents[value.season]) torrents[value.season] = {};
                            torrents[value.season][value.episode] = value;
                        });
                        _.each(torrents, function(value, season) {
                        if(season !== '0'){ 
                            seasontext = i18n.__("Season %s", season) ; 
                        } else{
                            seasontext = i18n.__("Special Features") ;
                        }
var seasonID = parseInt(season) +1;
                         %>
                          <li id="seasonTab-<%= seasonID %>" data-poster="<%= images.poster %>" data-id="<%= seasonID %>"> <%= seasontext %></li>
                        <% }); %>
                       
                    </ul>
                </div>
                <i class="zmdi zmdi-arrow-right zmdi-hc-lg season-next"></i>
            </div>
        </div>
        <div class="info-wrapper">
            <paper-shadow z="1">  
            <img data-bgr="<%= images.poster %>" src="<%= images.poster %>" class="poster" />
            </paper-shadow>
            <div id="season-0" class="meta-container show-info episode-list-show">
                <div class="meta-item"><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star-outline"></i>
                </div>
                <div class="meta-dot"></div>
                <div class="meta-item">
                    <p><%= genres.join(" , ") %></p>
                </div>
                <div class="meta-dot"></div>
                <div class="meta-item">
                    <p><%= year %> - Ongoing</p>
                </div>
                <div class="meta-dot"></div>
                <div class="meta-item">
                    <p><%= runtime %> min</p>
                </div>
                <div class="meta-synop"><%= synopsis %></div>
                
                <div class="meta-btn"><%=i18n.__( "Read More") %></div>

                <div class="meta-divider"></div>
                <div class="people">
                    <p>David Benioff, D.B. Weiss</p>
                    <p class="status">Creators</p>
                </div>
                <div class="people">
                    <p>Richard Madden</p>
                    <p class="status">as Robb Stark</p>
                </div>
                <div class="people">
                    <p>Peter Dinklage</p>
                    <p class="status">as Tyrion Lannister</p>
                </div>
                <div class="people">
                    <p>Nikolaj Coster-Waldau</p>
                    <p class="status">as Jaime Lannister</p>
                </div>
            </div>
            <div class="episode-container">

                <% _.each(torrents, function(value, season) { 
                    var seasonID = parseInt(season) +1; %>
                  <ul id="season-<%= seasonID %>" class="">
                            <% _.each(value, function(episodeData, episode) {
                                var first_aired = '';
                                if (episodeData.first_aired !== undefined) {
                                    first_aired = moment.unix(episodeData.first_aired).locale(Settings.language).format("LLLL");
                                }
                                function formatTwoDigit(n) {
                                     return n > 9 ? '' + n : '0' + n;
                                    }
                                var episodeUIid = 'S'+ formatTwoDigit(season) + 'E'+ formatTwoDigit(episodeData.episode);
                            %>
    
                       <li data-tvdb="<%=episodeData.tvdb_id %>" data-season="<%= season %>" data-episode="<%= episodeData.episode %>" id="episodeTab-<%= episodeUIid %>" class="" >
            
                        <p class="episode-id"><%=episodeUIid %></p>
                        <p class="episode-name"><%=episodeData.title %></p>
                        <i class="zmdi zmdi-info info-icon"></i><i class="zmdi zmdi-eye watched-icon"></i>
                        <p class="episode-airdate"><%=first_aired %></p>

                        </li>
                  
                            <% }); %>
                        </ul>
                <% }); %>


            </div>
            <div class="controls-container">
                <div class="meta-container-c">
                    <li class="quality-toggle">
                        <pt-toggle id="quality-toggle" icon="av:high-quality">
                            <pt-selectable-element value="720" label="720p"></pt-selectable-element>
                            <pt-selectable-element value="1080" label="1080p" selected></pt-selectable-element>
                        </pt-toggle>
                    </li>
                    <li class="subtitles-dropdown">
                        <pt-dropdown id="subtitles-selector" openDir="up" icon="av:subtitles">
                            <pt-selectable-element selected value="en" label="English"></pt-selectable-element>
                            <pt-selectable-element value="es" label="Spanish"></pt-selectable-element>
                            <pt-selectable-element value="de" label="German"></pt-selectable-element>
                            <pt-selectable-element value="fr" label="French"></pt-selectable-element>
                        </pt-dropdown>
                    </li>
                    <li id="player-option" class="device-dropdown">
                        <pt-dropdown id="device-selector" openDir="up">
                            <pt-selectable-element selected value="pt" label="Popcorn Time" src="images/icons/local-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="vlc" label="VLC" src="images/icons/external-vlc-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="mplayer" label="Mplayer" src="images/icons/external-mplayer-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="airplay" label="Apple TV" src="images/icons/airplay-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="chromecast" label="Chromecast" src="images/icons/chromecast-icon.png">Chromecast</pt-selectable-element>
                        </pt-dropdown>
                    </li>
                </div>
                 <paper-shadow z="1">  
                <paper-button class="watchnow-btn"><i class="zmdi zmdi-play"></i><%=i18n.__( "Play") %> S01E01</paper-button>
                </paper-shadow>
            </div>