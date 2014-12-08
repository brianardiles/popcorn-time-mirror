(function (App) {
	'use strict';

	var AnimeCollection = App.Model.Collection.extend({
		model: App.Model.Movie,
		popid: 'mal_id',
		type: 'anime',
		getProviders: function () {
			return {
				torrents: App.Config.getProvider('anime'),
				//         subtitle: App.Config.getProvider('subtitle'),
                                metadata: App.Config.getProvider('animemeta')
			};
		},
	});

	App.Model.AnimeCollection = AnimeCollection;
})(window.App);
