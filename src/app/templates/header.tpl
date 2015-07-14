<span>Popcorn Time</span>
<div class="os-controls <%= process.platform %>">
	<% _.each(getButtons(), function(button) { %>
    <div class="<%= button %>"><i class="zmdi zmdi-<%= (button != "close" ? "window-" + button + "imize" : button) %>"></i>
    </div>
    <% }); %>
</div>