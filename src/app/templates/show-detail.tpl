<div class="bg-backdrop" style="background-image: url(<%= images.fanart %>);"></div>
        <div class="overlay"></div>
        <header>
            <span>Popcorn Time</span>
            <div class="os-controls">
                <div class="close"><i class="md-close"></i>
                </div>
                <div class="max"><i class="md-crop-landscape"></i>
                </div>
                <div class="min"><i class="md-remove"></i>
                </div>
            </div>
        </header>
        <div class="summary-wrapper">
            <div class="summary-overlay"> <i class="md-arrow-back md-lg back"></i>
                <div class="title"><%= title %></div>
                <i class="md-bookmark-outline md-lg bookmark-toggle"></i>
                <i class="md-remove-red-eye md-lg watched-toggle"></i>
                <i class="md-chevron-left md-lg season-prev"></i>
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

                         %>
                          <li id="seasonTab-<%= season + 1 %>" data-poster="<%= images.poster %>" data-id="<%= season + 1 %>"> <%= seasontext %></li>
                        <% }); %>
                       
                    </ul>
                </div>
                <i class="md-chevron-right md-lg season-next"></i>
            </div>
        </div>
        <div class="info-wrapper">
            <img src="<%= images.poster %>" class="poster" />
            <div id="season-0" class="meta-container show-info episode-list-show">
                <div class="meta-item"><i class="md-star"></i><i class="md-star"></i><i class="md-star"></i><i class="md-star"></i><i class="md-star-outline"></i>
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

                <% _.each(torrents, function(value, season) { %>
                  <ul id="season-<%=season + 1 %>" class="">
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
                              <li class="" >
                        <p class="episode-id"><%=episodeUIid %></p>
                        <p class="episode-name"><%=episodeData.title %></p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate"><%=first_aired %></p>
                        </li>
                            <% }); %>
                        </ul>
                <% }); %>






           
            </div>
            <div class="controls-container">
                <div class="meta-container-c">
                    <li class="quality-toggle"><i class="md-high-quality"></i>
                        <p>480p</p>
                        <p>720p</p>
                        <p class="active">1080p</p>
                    </li>
                    <li><i class="md-closed-caption"></i>
                        <p>English</p>
                    </li>
                    <li id="player-option"><i id="current-player-icon" class="md-cast-connected"></i>
                        <p id="current-player-name">Living Room TV</p>
                        <ul class="dropdown">
                            <li class="active"><i class="md-tv"></i>
                                <p>Living Room TV</p>
                            </li>
                            <li><i class="md-cast-connected"></i>
                                <p>Chromecast</p>
                            </li>
                            <li><i class="md-desktop-windows"></i>
                                <p>VLC</p>
                            </li>
                            <li><i class="md-cast-connected"></i>
                                <p>Chromecast</p>
                            </li>
                            <li><i class="md-desktop-windows"></i>
                                <p>VLC</p>
                            </li>
                        </ul>
                    </li>
                </div>
                <div class="watchnow-btn"><i class="md-play-arrow"></i><%=i18n.__( "Play") %> S01E01</div>
            </div>