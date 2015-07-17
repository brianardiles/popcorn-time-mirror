<div class="filters">
    <% if(typeof type !=='undefined' && types.length > 0){ %>
       <div class="filter types">
            <pt-dropdown id="filter-type" class="filter-element" class="filter-element" multiple="true" conditional="all">
                <pt-selectable-element checkable checked value="all" label="<%=i18n.__( "Type") %>"></pt-selectable-element>
                <% _.each(types, function(c) { %>
                    <pt-selectable-element checkable value="<%= c %>" label="<%=i18n.__(c) %>"></pt-selectable-element>
                <% }); %>
            </pt-dropdown>
        </div>
        
        <% }if(typeof genre !=='undefined' && genres.length > 0){ %>
            <div class="filter genres" style="margin-left: 110px;">
                <pt-dropdown id="filter-genre" class="filter-element" multiple="true" conditional="All">
                    <% _.each(genres, function(c) { %>
                        <pt-selectable-element checkable value="<%= c %>" label="<%=i18n.__(c.capitalizeEach()) %>"
                            <%= c === 'All' ? 'checked':''%>
                        ></pt-selectable-element>
                    <% }); %>
                </pt-dropdown>
            </div>
            
        <%} if(typeof sorter !=='undefined' && sorters.length > 0){ %>
            <div class="filter sorters">
                <pt-dropdown id="filter-sorter" class="filter-element">
                    <% _.each(sorters, function(c) { %>
                        <pt-selectable-element value="<%= c %>" label="<%=i18n.__(c.capitalizeEach())%>"></pt-selectable-element>
                    <% }); %>
                </pt-dropdown>
            </div> 
         <%}%>
    
    <div class="right search">
        <form>
            <input id="searchbox" type="text" placeholder="<%= i18n.__(" Search ") %>">
            <div class="clear fa fa-times"></div>
        </form>
    </div>
    
</div>
