Modules.VERSION = '1.0.5';

this.miniActive = false;

this.focusPasswords = function(e) {
	var active = false;
	
	if(e.type == 'focus'
	&& e.target
	&& e.target.nodeName
	&& e.target.nodeName.toLowerCase() == 'input'
	&& !e.target.disabled
	&& (Prefs.miniOnAllInput || e.target.type == 'password')) {
		active = true;
	}
	
	if(active != miniActive) {
		miniActive = active;
		message('focusPasswords', miniActive);
	}
};

this.slimChromeProgressListener = {
	// this is needed in content progress listeners (for some reason)
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener, Ci.nsISupportsWeakReference]),
	
	last: null,
	onLocationChange: function(aProgress, aRequest, aURI) {
		try { var host = aURI.host; }
		catch(ex) { var host = aURI.spec; }
		
		// no point in showing in certain cases
		if(host == this.last) { return; }
		
		this.last = host;
		message('locationChange', { host: host, spec: aURI.spec });
	}
};

this.focusLoadListener = function() {
	// I don't think there's a way to do this without relying on each document's MutationObserver instance
	try {
		var listener = {
			observer: null,
			handler: function(mutations) {
				try {
					focusPasswords({
						target: document.activeElement,
						type: 'focus'
					});
				}
				catch(ex) {}
			}
		}
		
		listener.observer = new content.MutationObserver(listener.handler);
		listener.observer.observe(document.documentElement, { childList: true, subtree: true });
	}
	catch(ex) {}
};

Modules.LOADMODULE = function() {
	// show mini chrome when focusing password fields
	Listeners.add(Scope, 'focus', focusPasswords, true);
	Listeners.add(Scope, 'blur', focusPasswords, true);
	
	// show mini when the current tab changes host
	webProgress.addProgressListener(slimChromeProgressListener, Ci.nsIWebProgress.NOTIFY_ALL);
	
	// observe when any changes to the webpage are made, so that for instance when a focused input field is removed, the mini bar doesn't stay stuck open
	DOMContentLoaded.add(focusLoadListener);
	focusLoadListener();
};

Modules.UNLOADMODULE = function() {
	webProgress.removeProgressListener(slimChromeProgressListener);
	DOMContentLoaded.remove(focusLoadListener);
	Listeners.remove(Scope, 'focus', focusPasswords, true);
	Listeners.remove(Scope, 'blur', focusPasswords, true);
};
