 <% if(typeof backdrop==="undefined" ){ backdrop="" ; }; if(typeof synopsis==="undefined" ){ synopsis="Synopsis not available." ; }; if(typeof runtime==="undefined" ){ runtime="N/A" ; }; for(var i=0 ; i < genre.length; i++){ genre[i]=i18n.__(genre[i]); }; %>
 <div class="bg-backdrop" data-bgr="<%= backdrop %>"></div>
 <div class="summary-wrapper movie">
            <div class="summary-overlay">  <paper-icon-button class="back" icon="arrow-back"></paper-icon-button>
                <div class="title"><%= title %></div>
                <i class="zmdi zmdi-bookmark-outline zmdi-hc-lg bookmark-toggle"></i>
                <i class="zmdi zmdi-eye zmdi-hc-lg watched-toggle"></i>
                   <paper-shadow z="1">  
                <img src="<%= cover %>" class="poster" />
                 </paper-shadow>
                <div class="meta">
                    <div class="meta-item">
                     <% var p_rating=Math.round(rating) / 2; %>
                            <% for (var i=1 ; i <= Math.floor(p_rating); i++) { %>
                               <i class="zmdi zmdi-star"></i>
                                <% }; %>
                                    <% if (p_rating % 1> 0) { %>
                                    <i class="zmdi zmdi-star-half"></i>
                                        <% }; %>
                                            <% for (var i= Math.ceil(p_rating); i < 5; i++) { %>
                                           <i class="zmdi zmdi-star-outline"></i>
                                                <% }; %>

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
                    <div id="imdb-link" class="meta-btn"><%=i18n.__( "Read More") %></div>
                    <div id="play-trailer" class="meta-btn"><%=i18n.__( "Watch Trailer") %></div>
                    <div class="meta-divider"></div>
                      <% _.each(cast.cast, function(person) {%>
                          <div class="people">
                    <p><%= person.person.name %></p>
                    <p class="status"><%=i18n.__( "as") %>&nbsp;<%= person.character %></p>
                        </div>
                  <% }); %>
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
                            <pt-selectable-element selected value="local" label="Popcorn Time" src="images/icons/local-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="vlc" label="VLC" src="images/icons/external-vlc-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="mplayer" label="Mplayer" src="images/icons/external-mplayer-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="airplay" label="Apple TV" src="images/icons/airplay-icon.png"></pt-selectable-element>
                            <pt-selectable-element value="chromecast" label="Chromecast" src="images/icons/chromecast-icon.png">Chromecast</pt-selectable-element>
                        </pt-dropdown>
                    </li>
                </div>
                 <paper-shadow z="1">  
                <paper-button class="watchnow-btn"><i class="zmdi zmdi-play"></i><%=i18n.__( "Watch Now") %></paper-button>
                </paper-shadow>
            </div>