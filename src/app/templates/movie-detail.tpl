<style>
.controls-container .meta-container-c li pt-dropdown pt-selectable-element:hover {
  background-color: <%=color %> !important;
  color: <%=textcolor %> !important;
}
.controls-container .meta-container-c li.device-dropdown pt-selectable-element:hover::shadow #icon {
  <%
    if(textcolor == '#111214') {
        invert = 100;
    } else {
        invert = 0;
    }
  %>
    -webkit-filter: invert(<%=invert %>%);
}
</style>
<% if(typeof backdrop==="undefined" ){ backdrop="" ; }; if(typeof synopsis==="undefined" ){ synopsis="Synopsis not available." ; }; if(typeof runtime==="undefined" ){ runtime="N/A" ; }; for(var i=0 ; i < genre.length; i++){ genre[i]=i18n.__(genre[i]); }; %>
    <div class="bg-backdrop" data-bgr="<%= backdrop %>">
    </div>
    <div class="summary-wrapper movie">
        <div class="summary-overlay">
            <paper-icon-button class="back" icon="arrow-back"></paper-icon-button>
            <div class="title">
                <%= title %>
            </div>
            <paper-icon-button icon="bookmark-outline" class="bookmark-toggle">
            </paper-icon-button>
            <paper-icon-button icon="visibility-off" class="watched-toggle">
            </paper-icon-button>

                <img src="<%= cover %>" class="poster" />

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
                    <span class="meta-dot"></span>
                    <p>
                        <%=genre.join(", ") %>
                    </p>
                    <span class="meta-dot"></span>
                    <p>
                        <%=year %>
                    </p>
                    <span class="meta-dot"></span>
                    <p>
                        <%=runtime %> min
                    </p>
                </div>
                <div class="meta-synop">
                    <%=synopsis %>
                </div>
                <paper-button id="trakt-link" class="meta-btn">
                    <%=i18n.__( "Read More") %>
                </paper-button>
                <paper-button id="play-trailer" class="meta-btn">
                    <%=i18n.__( "Watch Trailer") %>
                </paper-button>
                <div class="meta-divider"></div><div class="director-title"><%=i18n.__( "Director") %></div>

                <% _.each(directors, function(person) {%>
                <div data-id="<%= person.imdb_code %>" class="people">
                    <div class="person-avatar">
                        <img src="<%= person.small_image %>" alt="">
                    </div>
                    <p class="person">
                        <%= person.name %>
                    </p>
                </div>
                <% }); %>

                <div class="actor-title"><%=i18n.__( "Actors") %></div>

                <% _.each(actors, function(actor) { %>
                <div data-id="<%= actor.imdb_code %>" class="people">
                    <div class="person-avatar">
                        <img src="<%= actor.small_image %>" alt="">
                    </div>
                    <p class="person">
                        <%= actor.name %>
                    </p>
                    <p class="status">
                        <%=i18n.__( "as %s", actor.character_name) %>
                    </p>
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
                    <pt-selectable-element value="720p" label="720p" <%=Settings.movies_default_quality === '720p' ? 'selected':''%>>
                    </pt-selectable-element>
                <% } %>
                <% if (torrents["1080p"] !== undefined) { %>
                    <pt-selectable-element value="1080p" label="1080p" <%=Settings.movies_default_quality === '1080p' ? 'selected':''%>>
                    </pt-selectable-element>
                <% } %>
                </pt-toggle>
            </li>
            <li class="subtitles-dropdown">
                <pt-dropdown id="subtitles-selector" openDir="up" icon="av:subtitles">
                    <pt-selectable-element value="none" label="<%= i18n.__("No subtitles") %>">
                    </pt-selectable-element>
                    <% for(var lang in subtitle){ %>
                        <pt-selectable-element value="<%= lang %>" label="<%= App.Localization.langcodes[lang].nativeName %>"  <%=Settings.subtitle_language === lang ? 'selected="true"':''%>>
                        </pt-selectable-element>
                    <% } %>
                </pt-dropdown>
            </li>
            <li id="player-option" class="device-dropdown">
                <pt-dropdown id="device-selector" openDir="up">
                <% _.each(App.Device.Collection.models, function(player) { %>
                    <pt-selectable-element  <%= App.Device.Collection.selected.id === player.get('id') ? 'selected="true"':''%> value="<%= player.get('id') %>" label="<%= player.get('name') %>" src="images/icons/<%= player.get('type') %>-icon.png">
                    </pt-selectable-element>
                <% });%>
                </pt-dropdown>
            </li>
        </div>
        <paper-shadow z="1">
            <paper-button style="background-color: <%=color %>; color: <%=textcolor %>;" class="watchnow-btn">
                <i class="zmdi zmdi-play"></i><%=i18n.__( "Watch Now") %>
            </paper-button>
        </paper-shadow>
    </div>