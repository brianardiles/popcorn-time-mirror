
    
        <li id="nav-movies" class="source active showMovies providerinfo" title="YTS">
            <a href="#" class="active">
                <core-icon icon="maps:local-movies"></core-icon> <%=i18n.__( "Movies") %>
            </a>
        </li>
        <li id="nav-shows" class="source showShows providerinfo" title="TVApi">
            <a href="#">
                <core-icon icon="hardware:tv"></core-icon> <%=i18n.__( "TV Series") %>
            </a>
        </li>
        <li id="nav-anime" class="source showAnime providerinfo" title="Haruhichan">
            <a href="#">
                <core-icon icon="social:mood"></core-icon> <%=i18n.__( "Anime") %>
            </a>
        </li>
        
        <% if (Settings.activateRandomize) { %>
        <li id="nav-randomize">
            <a href="#">
                <i id="filterbar-random" class="fa fa-random"></i> <%= i18n.__(" Randomize ") %>
            </a>
        </li>
        <% }%>
              
        <% if(!App.VPNClient.isDisabled()) { %>
        <li id="nav-vpn">
            <a href="#">
                <i style="color:#CC0000" id="filterbar-vpn-connect" class="fa fa-unlock-alt vpn-connect"></i> <%= i18n.__(" Connect VPN ") %>
            </a>
        </li>      
        <% }%>
                
        <% if (Settings.activateWatchlist) { %>
        <li id="nav-watchlist">
            <a href="#">
                <i id="filterbar-watchlist" class="fa fa-inbox watchlist" title=""></i> <%= i18n.__(" Watchlist ") %>
            </a>
        </li>    
        <% }%>  
                
        <li id="nav-favorites">
            <a href="#">
                <core-icon icon="bookmark"></core-icon> <%= i18n.__(" Favorites ") %>
            </a>
        </li>

        <% if (Settings.activateTorrentCollection) { %>
        <li id="nav-collection">
            <a href="#">
                <i id="filterbar-torrent-collection" class="fa fa-folder-open torrent-collection" title=""></i> <%= i18n.__(" Torrent Collection ") %>
            </a>
        </li>                    
        <% }%> 
        
        <% if (App.updateAvailable) { %>
        <li id="nav-update">
            <a href="#">
                <i id="filterbar-update" style="color:green" class="fa fa-refresh fa-spin"></i> <%= i18n.__("Update Available") %>
            </a>
        </li>
        <% }%>
        
        <li id="nav-about">
            <a href="#">
                <i id="filterbar-about" class="fa fa-info-circle about" title=""></i> <%= i18n.__(" About ") %>
            </a>
        </li>
        
        <li id="nav-settings"><a href="#"><core-icon icon="settings"></core-icon> <%= i18n.__(" Settings ") %></a></li>

