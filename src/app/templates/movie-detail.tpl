 <div style="background-image: url(<%= backdrop %>);" class="summary-wrapper movie">
            <div class="summary-overlay"> <i id="exit-detail" class="zmdi zmdi-arrow-left zmdi-hc-lg back"></i>
                <div class="title"><%= title %></div>
                <i class="zmdi zmdi-bookmark-outline zmdi-hc-lg bookmark-toggle"></i>
                <i class="zmdi zmdi-eye zmdi-hc-lg watched-toggle"></i>
                <img src="<%= cover %>" class="poster" />
                <div class="meta">
                    <div class="meta-item"><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star"></i><i class="zmdi zmdi-star-outline"></i>
                    </div>
                    <div class="meta-dot"></div>
                    <div class="meta-item">
                        <p><%=genre.join( " , ") %></p>
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