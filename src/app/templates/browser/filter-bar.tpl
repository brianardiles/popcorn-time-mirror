
    <% if(typeof type !=='undefined' && types.length > 0){ %>
     
            <pt-dropdown id="filter-type" style="left:35px;" class="filter-element" multiple="true" conditional="all">
                <pt-selectable-element checkable checked value="all" label="<%=i18n.__( "Type") %>"></pt-selectable-element>
                <% _.each(types, function(c) { %>
                    <pt-selectable-element checkable value="<%= c %>" label="<%=i18n.__(c) %>"></pt-selectable-element>
                <% }); %>
            </pt-dropdown>
 
        
        <% }if(typeof genre !=='undefined' && genres.length > 0){ %>
     
                <pt-dropdown id="filter-genre" class="filter-element" multiple="true" conditional="All">
                    <% _.each(genres, function(c) { %>
                        <pt-selectable-element checkable value="<%= c %>" label="<%=i18n.__(c.capitalizeEach()) %>"
                            <%= c === 'All' ? 'checked':''%>
                        ></pt-selectable-element>
                    <% }); %>
                </pt-dropdown>
        
            
        <%} if(typeof sorter !=='undefined' && sorters.length > 0){ %>
        
                <pt-dropdown id="filter-sorter" class="filter-element">
                    <% _.each(sorters, function(c) { %>
                        <pt-selectable-element value="<%= c %>" label="<%=i18n.__(c.capitalizeEach())%>"></pt-selectable-element>
                    <% }); %>
                </pt-dropdown>
          
         <%}%>
    
    <div class="right search">
       <paper-input label="<%=i18n.__("Search")%>" floatingLabel="true" ></paper-input>
    </div>
    

