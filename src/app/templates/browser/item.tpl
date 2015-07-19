<img width="100%" class="" src="<%= image %>" />
<div class="info">
	<paper-fab icon="av:play-arrow" title="S01E01: Pilot"></paper-fab>
    <h3 class="item-title"><%= title %></h3>
    <div class="meta">
    	<%= year %>
    	<div class="dot"></div>
    	<% var p_rating = Math.round(rating) / 2; %>
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
</div>