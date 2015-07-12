<ul id="nav-filters" class="nav nav-hor filters">
    <% if(typeof type !=='undefined' ){ %>
        <li class="dropdown filter types">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <%=i18n.__( "Type") %>
                    <span class="value"><%= i18n.__(type.capitalizeEach()) %></span>
                    <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <% _.each(types, function(c) { %>
                    <li>
                        <a href="#" data-value="<%= c %>">
                            <%=i18n.__(c) %>
                        </a>
                    </li>
                    <% }); %>
            </ul>
        </li>
        <% }if(typeof genre !=='undefined' ){ %>
            <li class="dropdown filter genres">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                    <%=i18n.__( "Genre") %>
                        <span class="value"><%= i18n.__(genre.capitalizeEach()) %></span>
                        <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <% _.each(genres, function(c) { %>
                        <li>
                            <a href="#" data-value="<%= c %>">
                                <%=i18n.__(c.capitalizeEach()) %>
                            </a>
                        </li>
                        <% }); %>
                </ul>
            </li>
            <%} if(typeof sorter !=='undefined' ){ %>
                <li class="dropdown filter sorters">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        <%=i18n.__( "Sort by") %>
                            <span class="value"><%= i18n.__(sorter.capitalizeEach()) %></span>
                            <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <% _.each(sorters, function(c) { %>
                            <li>
                                <a href="#" data-value="<%= c %>">
                                    <%=i18n.__(c.capitalizeEach()) %>
                                </a>
                            </li>
                            <% }); %>
                    </ul>
                </li>
                <%}%>
    <li>
        <div class="right search">
            <form>
                <input id="searchbox" type="text" placeholder="<%= i18n.__(" Search ") %>">
                <div class="clear fa fa-times"></div>
            </form>
        </div>
    </li>
</ul>
