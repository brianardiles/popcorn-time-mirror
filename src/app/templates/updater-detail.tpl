<div class="fa fa-times close-icon"></div>
<h1>Update Available!</h1>
<h2>Version</h2>

<h2 id="updateName" style="font-size: 14px; text-decoration: none; padding-top: 10px;"><%= version %><span style="font-size: 13px;"> - <%= version_name %></span></h2>
<h2 style="padding-top: 35px;">Description</h2>
<p id="updateDescription"><%= description %></p>
<h2 style="padding-top: 35px;">ChangeLog</h2>

<ul id="updateChangeLog">

<% changelog.forEach(function (entry) {%>
   <li> <%= entry %></li>
<% });%>

</ul>
