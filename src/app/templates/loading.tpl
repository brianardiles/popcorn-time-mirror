<div class="loading">
	<div class="loading-background"></div>
	<div class="loading-background-crossfade"></div>
	<div class="loading-background-overlay"></div>
	<video controls id="loading_player" width="20%" height="20%" style="display:none" preload="none"></video>
	<div class="state">
		<div class="title"></div>
		<div class="external-play" style="visibility:hidden"><%= i18n.__("Streaming to") %> <span class="player-name"></span></div>
		<!-- download -->
		<div class="text_download"></div>

		<div class="seed_status" style="visibility:hidden">
			<!-- loading bar -->
		<div class="loading-progressbar">
						<div class="slider">
			<div class="line"></div>
				<div class="break dot1"></div>
				<div class="break dot2"></div>
				<div class="break dot3"></div>
			</div>
		</div>

			<!-- downloading info -->
			<div class="loading-info">
				<span class="buffer_percent"></span><br><br>
				
				<span class="loading-info-text"><%= i18n.__("Download") %>:&nbsp;</span>
				<span class="download_speed value"><%= Common.fileSize(0) %>/s</span><br>
				<span class="loading-info-text"><%= i18n.__("Upload") %>:&nbsp;</span>
				<span class="upload_speed value"><%= Common.fileSize(0) %>/s</span><br>
				<span class="loading-info-text"><%= i18n.__("Active Peers") %>:&nbsp;</span>
				<span class="value_peers value">0</span>
			</div>
		</div>
		<div class="player-controls" style="visibility:hidden">
			<i class="fa fa-backward backward"></i>
			<i class="fa fa-pause pause"></i>
			<i class="fa fa-stop stop"></i>
			<i class="fa fa-forward forward"></i>
		</div>
		<div class="playing-progressbar" style="visibility:hidden">
			<div id="playingbar-contents"></div>
		</div>
		<div class="cancel-button">
            <div class="cancel-button-text"><%= i18n.__("Cancel") %></div>
        </div>
	</div>
    <div class="warning-nospace">
        <span class="warn"><%= i18n.__('Your disk is almost full.') %></span><br>
        <span class="detail"><%= i18n.__('You need to make more space available on your disk by deleting files.') %></span>
    </div>
</div>