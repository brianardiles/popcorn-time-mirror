 <div style="background-image: url(<%= backdrop %>);" class="summary-wrapper movie">
            <div class="summary-overlay"> <i id="exit-detail" class="md md-arrow-back md-lg back"></i>
                <div class="title"><%= title %></div>
                <i class="md md-bookmark-outline md-lg bookmark-toggle"></i>
                <i class="md md-remove-red-eye md-lg watched-toggle"></i>
                <img src="<%= cover %>" class="poster" />
                <div class="meta">
                    <div class="meta-item"><i class="md-star"></i><i class="md-star"></i><i class="md-star"></i><i class="md-star"></i><i class="md-star-outline"></i>
                    </div>
                    <div class="meta-dot"></div>
                    <div class="meta-item">
                        <p><%=genre.join( " / ") %></p>
                    </div>
                    <div class="meta-dot"></div>
                    <div class="meta-item">
                        <p><%= year %></p>
                    </div>
                    <div class="meta-dot"></div>
                    <div class="meta-item">
                        <p><%=runtime %> min</p>
                    </div>
                    <div class="meta-synop"><%=synopsis %></div>
                    <div class="meta-btn">read more</div>
                    <div class="meta-btn"><%=i18n.__( "Watch Trailer") %></div>
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
            </div>
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
            <div class="watchnow-btn"><i class="md-play-arrow"></i><%=i18n.__( "Watch Now") %></div>
        </div>