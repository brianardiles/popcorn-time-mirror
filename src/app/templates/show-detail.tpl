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
                        <li data-poster="https://walter.trakt.us/images/seasons/000/003/963/posters/thumb/3b1d09801b.jpg" data-id="1">Season&nbsp;1</li>
                        <li data-poster="https://walter.trakt.us/images/seasons/000/003/964/posters/thumb/7be9351659.jpg" data-id="2">Season&nbsp;2</li>
                        <li data-poster="https://walter.trakt.us/images/seasons/000/003/965/posters/thumb/70375805b1.jpg" data-id="3">Season&nbsp;3</li>
                        <li data-id="4">Season&nbsp;4</li>
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
                <ul id="season-1" class="">
                    <li class="watched" >
                        <p class="episode-id">s01e01</p>
                        <p class="episode-name">Winter Is Coming</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="watched" >
                        <p class="episode-id">s01e02</p>
                        <p class="episode-name">The Kingsroad</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li  class="watched">
                        <p class="episode-id">s01e03</p>
                        <p class="episode-name">Lord Snow</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="active">
                        <p class="episode-id">s01e04</p>
                        <p class="episode-name">Cripples, Bastards, and Broken Things</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="">
                        <p class="episode-id">s01e05</p>
                        <p class="episode-name">The Wolf and the Lion</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="">
                        <p class="episode-id">s01e06</p>
                        <p class="episode-name">A Golden Crown</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="">
                        <p class="episode-id">s01e07</p>
                        <p class="episode-name">You Win or You Die</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="">
                        <p class="episode-id">s01e08</p>
                        <p class="episode-name">The Pointy End</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="">
                        <p class="episode-id">s01e09</p>
                        <p class="episode-name">Baelor</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                    <li class="">
                        <p class="episode-id">s01e10</p>
                        <p class="episode-name">Fire and Blood</p>
                        <i class="md-info info-icon"></i><i class="md-remove-red-eye watched-icon"></i>
                        <p class="episode-airdate">2014-04-07</p>
                    </li>
                </ul>
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