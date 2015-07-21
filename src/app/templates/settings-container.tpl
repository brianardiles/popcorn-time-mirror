<%
   
                       var langs = "";
                        for(var key in App.Localization.allTranslations) {
                                key = App.Localization.allTranslations[key];
                                if (App.Localization.langcodes[key] !== undefined) {
                                langs += "<paper-item "+(Settings.language == key? "selected='selected'":"")+" value='"+key+"'>"+
                                            App.Localization.langcodes[key].nativeName+"</paper-item>";
                            }
                        }


  var sub_langs = "<paper-item "+(Settings.subtitle_language == "none"? "selected='selected'":"")+" value='none'>" +
                                            i18n.__("Disabled") + "</paper-item>";

                        for(var key in App.Localization.langcodes) {
                            if (App.Localization.langcodes[key].subtitle !== undefined && App.Localization.langcodes[key].subtitle == true) {
                                sub_langs += "<paper-item "+(Settings.subtitle_language == key? "selected='selected'":"")+" value='"+key+"'>"+
                                                App.Localization.langcodes[key].nativeName+"</paper-item>";
                            }
                        }

%>



  <paper-icon-button class="back" icon="arrow-back"></paper-icon-button>
        <div class="title">Settings</div>
        <div class="sep"></div>
        <section>
            <h1>User Interface</h1>
            <div class="content">
                <div class="content-row">
                    <p>Defualt Language:</p>
                    <paper-dropdown-menu class="settings-dropdown" label="<%=App.Localization.langcodes[Settings.language].nativeName%>">
                        <paper-dropdown class="dropdown">
                            <core-menu class="menu">
                            <%=langs%>
                            </core-menu>
                        </paper-dropdown>
                    </paper-dropdown-menu>
                </div>
                <div class="content-row">
                    <p>Start Sceen:</p>
                    <paper-dropdown-menu class="settings-dropdown" label="Movies">
                        <paper-dropdown class="dropdown">
                            <core-menu class="menu">
                            
                            </core-menu>
                        </paper-dropdown>
                    </paper-dropdown-menu>
                </div>
                <div class="content-row">
                    <p>Watched Content:</p>
                    <paper-dropdown-menu class="settings-dropdown" label="Fade">
                        <paper-dropdown class="dropdown">
                            <core-menu class="menu">
                                <paper-item>Croissant</paper-item>
                                <paper-item>Donut</paper-item>
                                <paper-item>Financier</paper-item>
                                <paper-item>Madeleine</paper-item>
                            </core-menu>
                        </paper-dropdown>
                    </paper-dropdown-menu>
                </div>
                <div class="content-row">
                    <p>Translate Synopsis:</p>
                    <paper-checkbox></paper-checkbox>

                </div>
                <div class="content-row">
                    <p>Always On Top:</p>
                    <paper-checkbox></paper-checkbox>
                </div>

            </div>
        </section>
        <section>
            <h1>Subtitles</h1>
            <div class="content">
              <div class="content-row">
                  <p>Default Subtitle:</p>
                  <paper-dropdown-menu class="settings-dropdown" label="<%=Settings.subtitle_language%>">
                      <paper-dropdown class="dropdown">
                          <core-menu class="menu">
                       <%=sub_langs%>
                          </core-menu>
                      </paper-dropdown>
                  </paper-dropdown-menu>
              </div>
              <div class="content-row">
                  <p>Subtitle Size:</p>
                  <paper-dropdown-menu class="settings-dropdown" label="English">
                      <paper-dropdown class="dropdown">
                          <core-menu class="menu">
                              <paper-item>Croissant</paper-item>
                              <paper-item>Donut</paper-item>
                              <paper-item>Financier</paper-item>
                              <paper-item>Madeleine</paper-item>
                          </core-menu>
                      </paper-dropdown>
                  </paper-dropdown-menu>
              </div>
            </div>
        </section>
        <section>
            <h1>Playback</h1>
            <div class="content">
              <div class="content-row">
                  <p>Playback</p>
                  <paper-checkbox></paper-checkbox>
              </div>
            </div>
        </section>
        <section>
          <h1>Trakt.tv</h1>
          <div class="content">
            <div class="content-row">
              <p>Connect to Trakt.tv to automatically 'scrobble' episodes you watch in Popcorn Time</p>
            </div>
            <div class="content-row">
              <paper-button>Connect to Trakt</paper-button>
            </div>
          </div>
        </section>
        <section>
          <h1>TVShow Time</h1>
          <div class="content">
            <div class="content-row">
              <paper-button>Connect to TVShow Time</paper-button>
            </div>
          </div>
        </section>
        <section>
            <h1>Remote Control</h1>
            <div class="content"></div>
        </section>
        <section>
            <h1>Cache</h1>
            <div class="content"></div>
        </section>
        <section>
            <h1>Features</h1>
            <div class="content">
              <div class="content-row">
                  <p>Torrent Collection</p>
                  <paper-checkbox></paper-checkbox>
              </div>
              <div class="content-row">
                  <p>VPN</p>
                  <paper-checkbox></paper-checkbox>
              </div>
              <div class="content-row">
                  <p>Watchlist</p>
                  <paper-checkbox></paper-checkbox>
              </div>
              <div class="content-row">
                  <p>Randomize Button for Movies</p>
                  <paper-checkbox></paper-checkbox>
              </div>
            </div>
        </section>
