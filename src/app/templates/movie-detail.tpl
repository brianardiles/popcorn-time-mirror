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
                    <li class="quality-toggle">
                        <pt-toggle id="quality-toggle" icon="av:high-quality">
                            <% if (torrents["720p"] !== undefined) { %>
                                <pt-selectable-element value="720p" label="720p" <%=Settings.movies_default_quality === '720p' ? 'selected':''%>></pt-selectable-element>
                            <% } %>
                            <% if (torrents["1080p"] !== undefined) { %>
                                <pt-selectable-element value="1080p" label="1080p" <%=Settings.movies_default_quality === '1080p' ? 'selected':''%>></pt-selectable-element>
                            <% } %>
                            
                            
                        </pt-toggle>
                    </li>
                    <li class="subtitles-dropdown">
                        <pt-dropdown id="subtitles-selector" openDir="up" icon="av:subtitles">
                            <pt-selectable-element value="none" label="<%= i18n.__("Disabled") %>"></pt-selectable-element>
                          
                            <% for(var lang in subtitle){ %>
                                <pt-selectable-element value="<%= lang %>" label="<%= App.Localization.langcodes[lang].nativeName %>"  <%=Settings.subtitle_language === lang ? 'selected="true"':''%>></pt-selectable-element>
                           <% } %>
                            
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
                <div class="watchnow-btn"><i class="zmdi zmdi-play"></i><%=i18n.__( "Play") %> S01E01</div>
            </div>