Modules.VERSION = '1.0.3';

this.__defineGetter__('AniWeatherBrowserAgent', function() { return window.AniWeatherBrowserAgent; });

Modules.LOADMODULE = function() {
	Piggyback.add('AniWeather', AniWeatherBrowserAgent, 'prepareReportById', function() {
		// don't let slim chrome hide the top of the animation popups
		if(typeof(slimChromeContainer) != 'undefined' && trueAttribute(slimChromeContainer, 'hover')) {
			var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
			sscode += '@namespace url(http://www.w3.org/1999/xhtml);\n';
			sscode += '#weatherLauncher { margin-top: '+slimChromeContainer.clientHeight+'px !important; }\n';
			Styles.load('aniWeahter_'+_UUID, sscode, true);
		}
	}, Piggyback.MODE_AFTER);
	
	Piggyback.add('AniWeather', AniWeatherBrowserAgent, 'cancelReport', function() {
		Styles.unload('aniWeahter_'+_UUID);
	}, Piggyback.MODE_AFTER);
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert('AniWeather', AniWeatherBrowserAgent, 'prepareReportById');
	Piggyback.revert('AniWeather', AniWeatherBrowserAgent, 'cancelReport');
	Styles.unload('aniWeahter_'+_UUID);
};
