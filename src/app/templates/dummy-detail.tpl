    <div class="bg-backdrop" data-bgr="">
    </div>
    <div class="summary-wrapper movie">
        <paper-icon-button class="back" icon="arrow-back"></paper-icon-button>
        <div class="title">
            <%= title %>
        </div>
        <paper-icon-button icon="bookmark-outline" class="bookmark-toggle">
        </paper-icon-button>
        <paper-icon-button icon="visibility-off" class="watched-toggle">
        </paper-icon-button>
     </div>

     <style shim-shadowdom>
  paper-spinner::shadow .circle {
    border-color: <%= color %>;
  }
    </style>
<div horizontal center-justified center layout>
<paper-spinner style="position: relative;  top: -30vh; width: 50px; height: 50px" class="spinnner" active></paper-spinner>
</div>