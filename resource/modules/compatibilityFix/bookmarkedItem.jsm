Modules.VERSION = '1.1.4';

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });
this.__defineGetter__('StarUI', function() { return window.StarUI; });

this.setupHoldBookmarkPanel = function(e) {
	if(e.target.id == 'editBookmarkPanel') {
		Listeners.remove(window, 'popupshowing', setupHoldBookmarkPanel);
		Listeners.add(e.target, 'AskingForNodeOwner', holdBookmarkPanel);
	}
};

this.holdBookmarkPanel = function(e) {
	e.detail = 'bookmarks-menu-button';
	e.stopPropagation();
};

Modules.LOADMODULE = function() {
	// the editBookmarkPanel is only created when first called
	if($('editBookmarkPanel')) {
		Listeners.add($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	} else {
		Listeners.add(window, 'popupshowing', setupHoldBookmarkPanel);
	}
	
	Piggyback.add('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification', function() {
		// the chrome should already be opened for this (it's a click on the button), so we don't need to delay or pause this notification,
		// we only need to make sure the chrome doesn't hide until the animation is finished
		if(typeof(slimChromeContainer) != 'undefined'
		&& (isAncestor($('bookmarks-menu-button'), slimChromeContainer) || isAncestor($('bookmarks-menu-button'), overflowList))) {
			initialShowChrome(1500);
		}
		return true;
	}, Piggyback.MODE_BEFORE);
	
	// To prevent an issue with the BookarkedItem popup appearing below the browser window, because its anchor is destroyed between the time the popup is opened
	// and the time the chrome expands from mini to full (because the anchor is an anonymous node? I have no idea...), we catch this before the popup is opened, and
	// only continue with the operation after the chrome has expanded.
	// We do the same for when the anchor is the identity box, as in Mac OS X the bookmarked item panel would open outside of the window (no clue why though...)
	Piggyback.add('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel', function(aItemId, aAnchorElement, aPosition) {
		// in case the panel will be attached to the star button, check to see if it's placed in our toolbars
		if(typeof(slimChromeContainer) != 'undefined'
		&& isAncestor(aAnchorElement, slimChromeContainer)
		&& !trueAttribute(slimChromeContainer, 'fullWidth')) {
			var anchor = $("page-proxy-favicon");
			if(aAnchorElement != anchor) { anchor = null; }
			
			// re-command the panel to open when the chrome finishes expanding
			Listeners.add(slimChromeContainer, 'FinishedSlimChromeWidth', function() {
				// unfortunately this won't happen inside popupFinishedWidth in this case
				if(slimChromeContainer.hovers === 1 && Prefs.useMouse && $$('#'+objName+'-slimChrome-container:hover')[0]) {
					setHover(true);
				}
				
				// get the anchor reference again, in case the previous node was lost
				StarUI._doShowEditBookmarkPanel(aItemId, anchor || BookmarkingUI.anchor, aPosition);
			}, false, true);
			
			// expand the chrome
			initialShowChrome(750);
			
			return false;
		}
		
		return true;
	}, Piggyback.MODE_BEFORE);
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification');
	Piggyback.revert('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel');
	
	Listeners.remove($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	Listeners.remove(window, 'popupshowing', setupHoldBookmarkPanel);
};
