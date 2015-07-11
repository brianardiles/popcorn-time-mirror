<div class="bg-backdrop" style="background-image: url(<%= images.fanart %>);"></div>
        <div class="overlay"></div>
        <div class="summary-wrapper">
            <div class="summary-overlay"> <i class="zmdi zmdi-arrow-left zmdi-hc-lg back"></i>
                <div class="title"><%= title %></div>
                <i class="zmdi zmdi-bookmark-outline zmdi-hc-lg bookmark-toggle"></i>
                <i class="zmdi zmdi-eye zmdi-hc-lg watched-toggle"></i>
                <i class="zmdi zmdi-arrow-left zmdi-hc-lg season-prev"></i>
                <div class="seasons-wrapper">
                    <ul class="seasons-container owl-carousel">
                        <li data-poster="<%= images.poster %>" data-id="0" class=""><%= i18n.__( "Show Info") %></li>
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
            <img src="<%= images.poster %>" class="poster" />
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
                    <li class="quality-toggle"><i class="zmdi zmdi-hd"></i>
                        <p>480p</p>
                        <p>720p</p>
                        <p class="active">1080p</p>
                    </li>
                    <li><i class="zmdi zmdi-closed-caption"></i>
                        <p>English</p>
                    </li>
                    <li id="player-option"><i id="current-player-icon" class="zmdi zmdi-cast-connected"></i>
                        <p id="current-player-name">Living Room TV</p>
                        <ul class="dropdown">
                            <li class="active"><i class="zmdi zmdi-tv"></i>
                                <p>Living Room TV</p>
                            </li>
                            <li><i class="zmdi zmdi-cast-connected"></i>
                                <p>Chromecast</p>
                            </li>
                            <li><i class="zmdi zmdi-desktop-windows"></i>
                                <p>VLC</p>
                            </li>
                            <li><i class="zmdi zmdi-cast-connected"></i>
                                <p>Chromecast</p>
                            </li>
                            <li><i class="zmdi zmdi-desktop-windows"></i>
                                <p>VLC</p>
                            </li>
                        </ul>
                    </li>
                </div>
                <div class="watchnow-btn"><i class="zmdi zmdi-play"></i><%=i18n.__( "Play") %> S01E01</div>
            </div>