
        <% if(typeof sorter !=='undefined' && sorters.length > 0) { %>
        
                <pt-dropdown id="filter-sorter" class="filter-element">
                    <% _.each(sorters, function(c) { %>
                        <pt-selectable-element value="<%= c %>" label="<%=i18n.__(c.capitalizeEach())%>"></pt-selectable-element>
                    <% }); %>
                </pt-dropdown>
          
        <% } if(typeof type !=='undefined' && types.length > 0) { %>
 
            <pt-dropdown id="filter-type" class="filter-element" multiple="true" conditional="all">
                <pt-selectable-element checkable checked value="all" label="<%=i18n.__( "Type") %>"></pt-selectable-element>
                <% _.each(types, function(c) { %>
                    <pt-selectable-element checkable value="<%= c %>" label="<%=i18n.__(c) %>"></pt-selectable-element>
                <% }); %>
            </pt-dropdown>
        
        <% } if(typeof genre !=='undefined' && genres.length > 0) { %>
     
                <pt-dropdown id="filter-genre" class="filter-element" multiple="true" conditional="All">
                    <% _.each(genres, function(c) { %>
                        <pt-selectable-element checkable value="<%= c %>" label="<%=i18n.__(c.capitalizeEach()) %>"
                            <%= c === 'All' ? 'checked':''%>
                        ></pt-selectable-element>
                    <% }); %>
                </pt-dropdown>
        
            
        <%} %>
    
    <div class="right search">
     <form id="filterbar-search">
    <paper-input-decorator  floatingLabel="true" label="<%=i18n.__("Search")%>">
        <input id="filterbar-input" is="core-input">
    </paper-input-decorator>
      </form>
    </div>
    

