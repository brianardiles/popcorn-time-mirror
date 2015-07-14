  <%   
function formatTwoDigit(n) {
	return n > 9 ? '' + n : '0' + n;
}
var episode = 'S' + formatTwoDigit(data.metadata.season) + 'E' + formatTwoDigit(data.metadata.episode) + ' ' + data.metadata.title;
%>

  <div class="bg-backdrop fadein" style="background-image: url(<%= data.metadata.backdrop %>);"></div>
        <div class="overlay"></div>
         <paper-icon-button class="back" icon="close"></paper-icon-button>
        <div class="title"><%= data.metadata.showName %></div>
        <div class="episode-info"><%= episode %></div>
        <div class="meta-container">
            <div class="status">Connecting</div>
            <div class="progressbar"></div>
        </div>
