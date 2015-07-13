<div class="bg-backdrop" data-bgr="<%= images.fanart %>"></div>
<div class="overlay"></div>
<div class="summary-wrapper">
    <div class="summary-overlay">
        <paper-icon-button class="back" icon="arrow-back"></paper-icon-button>
        <div class="title"><%= title %></div>
        <paper-icon-button icon="bookmark-outline" class="bookmark-toggle">
        </paper-icon-button>
        <paper-icon-button icon="visibility-off" class="watched-toggle">
        </paper-icon-button>
        <div class="seasons-wrapper">
           <paper-tabs class="seasons-container" selected="0" noink="true" scrollable role="tablist" horizontal center layout>
               <paper-tab data-id="0" data-poster="<%= images.poster %>" role="tab" active class="active"><%= i18n.__( "Show Info") %></paper-tab>
               <% var torrents = {},
                        seasontext,
                        type,
                        index = 1;
                _.each(episodes, function(value, currentEpisode) {
                    if (!torrents[value.season]) torrents[value.season] = {};
                    torrents[value.season][value.episode] = value;
                });
                _.each(torrents, function(value, season) {
                if(season !== '0'){ 
                    type = 'season';
                    seasontext = i18n.__("Season %s", season) ; 
                } else{
                     type = 'special';
                    seasontext = i18n.__("Special Features") ;
                }
                var seasonID = parseInt(season) + 1;
                if(seasonImages && seasonImages[season] && seasonImages[season].images.poster.full){
                var seasonPoster = App.Trakt.resizeImage(seasonImages[season].images.poster.full, 'medium');
                }else{
                    var seasonPoster = images.poster;
                }
                 %>
                    <paper-tab id="seasonTab-<%= seasonID %>" data-type="<%= type %>"  data-index="<%= index %>" data-id="<%= seasonID %>" data-poster="<%= seasonPoster %>" role="tab"><%= seasontext %></paper-tab>
                <% index++; }); %>
           </paper-tabs>
        </div>
    </div>
</div>
        <div class="info-wrapper">
            <paper-shadow z="1" class="poster-shadow">  
            <img data-bgr="<%= images.poster %>" src="<%= images.poster %>" class="poster" />
            </paper-shadow>
            <div id="season-0" class="meta-container show-info episode-list-show">
                <div class="meta-item">

 <% var p_rating = Math.round(rating.percentage) / 20; // Roundoff number to nearest 0.5  %>
        
            <% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
                    <i class="zmdi zmdi-star"></i>
                <% }; %>
                <% if (p_rating % 1 > 0) { %>
       <i class="zmdi zmdi-star-half"></i>
                <% }; %>
                <% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
                   <i class="zmdi zmdi-star-outline"></i>
            <% }; %>

                </div>
                <div class="meta-dot"></div>
                <div class="meta-item">
                    <p><%= genres.splice(0,3).join(", ") %></p>
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

                <paper-button id="imdb-link" class="meta-btn">
                    <%=i18n.__( "Read More") %>
                </paper-button>

                <div class="meta-divider"></div>
                 <% if(cast.cast){

                 _.each(cast.cast, function(person) {%>
                  <div data-id="<%= person.person.ids.imdb || person.person.ids.slug %>" class="people">
                    <p class="person"><%= person.person.name %></p>
                    <p class="status"><%=i18n.__( "as") %>&nbsp;<%= person.character %></p>
                   </div>
                  <% }); } %>

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
    
                       <li data-tvdb="<%=episodeData.tvdb_id %>" data-season="<%= season %>" data-episode="<%= episodeData.episode %>" id="episodeTab-<%= episodeUIid %>" class="epsiode-tab" >
            
                        <p class="episode-id"><%=episodeUIid %></p>
                        <p class="episode-name"><%=episodeData.title %></p>
                        <paper-icon-button class="info-icon" icon="info"></paper-icon-button><paper-icon-button class="watched-icon" icon="visibility"></paper-icon-button>
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
                            <pt-selectable-element value="480" label="480p"></pt-selectable-element>
                            <pt-selectable-element value="720" label="720p"></pt-selectable-element>
                            <pt-selectable-element value="1080" label="1080p"></pt-selectable-element>
                        </pt-toggle>
                    </li>
                    <li class="subtitles-dropdown">
                        <pt-dropdown id="subtitles-selector" openDir="up" icon="av:subtitles">
                            <pt-selectable-element value="" selected label="<%=i18n.__( "Loading") %>..."></pt-selectable-element>
                        </pt-dropdown>
                    </li>
                    <li id="player-option" class="device-dropdown">
                        <pt-dropdown id="device-selector" openDir="up">
                         <% _.each(App.Device.Collection.models, function(player) { %>
                               <pt-selectable-element  <%= App.Device.Collection.selected.id === player.get('id') ? 'selected="true"':''%> value="<%= player.get('id') %>" label="<%= player.get('name') %>" src="images/icons/<%= player.get('type') %>-icon.png"></pt-selectable-element>
                         <% });%>
                        </pt-dropdown>
                    </li>
                </div>
                 <paper-shadow z="1">  
                <paper-button class="watchnow-btn"><i class="zmdi zmdi-play"></i><%=i18n.__( "Play") %>&nbsp;<span>S01E01</span></paper-button>
                </paper-shadow>
            </div>