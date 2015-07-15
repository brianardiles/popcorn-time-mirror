<%   
function formatTwoDigit(n) {
	return n > 9 ? '' + n : '0' + n;
}
var title, episode;
switch(data.type) {
    case 'movie':
    		title = data.metadata.title;
   			episode = '';
        break;
    case 'show':
    		title = data.metadata.showName;
			episode = 'S' + formatTwoDigit(data.metadata.season) + 'E' + formatTwoDigit(data.metadata.episode) + ' ' + data.metadata.episodeName;
        break;
}
%>
<style id="loadingStyle">
paper-progress::shadow #activeProgress {
  background-color: <%=data.metadata.color %>;
}
</style>

  <div class="bg-backdrop fadein" style="background-image: url(<%= data.metadata.backdrop %>);"></div>
        <div class="overlay"></div>
         <paper-icon-button class="back" icon="close"></paper-icon-button>
        <div class="title"><%= title %></div>
        <div class="episode-info"><%= episode %></div>
        <div class="meta-container">
            <div class="status"><%=i18n.__('Initializing')%></div>
            <paper-progress class="progressbar" indeterminate ></paper-progress>
             <div class="stats"></div>
        </div>
    <video controls id="loading_player" width="20%" height="20%" style="display:none" preload="none"></video>