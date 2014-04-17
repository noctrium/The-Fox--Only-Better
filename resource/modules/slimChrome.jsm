moduleAid.VERSION = '1.2.8';

this.__defineGetter__('slimChromeSlimmer', function() { return $(objName+'-slimChrome-slimmer'); });
this.__defineGetter__('slimChromeContainer', function() { return $(objName+'-slimChrome-container'); });
this.__defineGetter__('slimChromeToolbars', function() { return $(objName+'-slimChrome-toolbars'); });

this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('customToolbars', function() { return $('customToolbars'); });
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

// until I find a better way of finding out on which side of the browser is the scrollbar, I'm setting equal margins
this.__defineGetter__('MIN_LEFT', function() { return 22; });
this.__defineGetter__('MIN_RIGHT', function() { return 22; });

this.moveSlimChromeStyle = {};
this.lastSlimChromeStyle = null;

this.delayMoveSlimChrome = function() {
	timerAid.init('delayMoveSlimChrome', moveSlimChrome, 0);
};

this.shouldReMoveSlimChrome = function(newStyle) {
	if(!lastSlimChromeStyle) { return true; }
	
	if(!newStyle) {
		return (slimChromeContainer.clientWidth != lastSlimChromeStyle.clientWidth);
	}
	else if(newStyle.right != lastSlimChromeStyle.right
		|| newStyle.left != lastSlimChromeStyle.left
		|| newStyle.width != lastSlimChromeStyle.width
		|| newStyle.clientWidth != lastSlimChromeStyle.clientWidth) {
			return true;
	}
	
	return false;
};

// Handles the position of the top chrome
this.moveSlimChrome = function() {
	moveSlimChromeStyle = {
		width: -MIN_RIGHT -MIN_LEFT,
		clientWidth: slimChromeContainer.clientWidth,
		left: MIN_LEFT,
		right: MIN_RIGHT
	};
	
	var appContentPos = $('content').getBoundingClientRect();
	moveSlimChromeStyle.width += appContentPos.width;
	moveSlimChromeStyle.left += appContentPos.left;
	moveSlimChromeStyle.right += document.documentElement.clientWidth -appContentPos.right;
	
	// Compatibility with TreeStyleTab
	if($('TabsToolbar') && !$('TabsToolbar').collapsed) {
		// This is also needed when the tabs are on the left, the width of the findbar doesn't follow with the rest of the window for some reason
		if($('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'left' || $('TabsToolbar').getAttribute('treestyletab-tabbar-position') == 'right') {
			var TabsToolbar = $('TabsToolbar');
			var TabsSplitter = document.getAnonymousElementByAttribute($('content'), 'class', 'treestyletab-splitter');
			moveSlimChromeStyle.width -= TabsToolbar.clientWidth;
			moveSlimChromeStyle.width -= TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left') {
				moveSlimChromeStyle.left += TabsToolbar.clientWidth;
				moveSlimChromeStyle.left += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
			if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right') {
				moveSlimChromeStyle.right += TabsToolbar.clientWidth;
				moveSlimChromeStyle.right += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
		}
	}
	
	if(!shouldReMoveSlimChrome(moveSlimChromeStyle)) { return; }
	
	lastSlimChromeStyle = moveSlimChromeStyle;
	
	// Unload current stylesheet if it's been loaded
	styleAid.unload('slimChromeMove_'+_UUID);
	
	var sscode = '/*The Fox, Only Better CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #theFoxOnlyBetter-slimChrome-container {\n';
	sscode += '		left: ' + moveSlimChromeStyle.left + 'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #theFoxOnlyBetter-slimChrome-container[hover] {\n';
	sscode += '		width: ' + Math.max(moveSlimChromeStyle.width, 100) + 'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('slimChromeMove_'+_UUID, sscode, true);
	
	findPersonaPosition();
};

this.onMouseOver = function(e) {
	setHover(true, e && isAncestor(e.target, slimChromeContainer));
};

this.onMouseOut = function() {
	setHover(false);
};

this.onFocus = function() {
	setHover(true, true);
};

this.onMouseOutBrowser = function(e) {
	// bascially this means that when the mouse left something, it entered "nothing", which is what we want to capture here
	if(e.relatedTarget) { return; }
	
	// we also only need to show if the mouse is hovering the toolbox, leaving the window doesn't count
	if(e.screenY < gNavToolbox.boxObject.screenY
	|| e.screenY > (gNavToolbox.boxObject.screenY +gNavToolbox.boxObject.height)
	|| e.screenX < gNavToolbox.boxObject.screenX
	|| e.screenY > (gNavToolbox.boxObject.screenX +gNavToolbox.boxObject.width)) { return; }
	
	onMouseOver();
	
	// don't keep listening to mouseout, otherwise the toolbox would get stuck open
	listenerAid.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	listenerAid.add(browserPanel, 'mouseover', onMouseReEnterBrowser);
};

this.onMouseReEnterBrowser = function(e) {
	// no need to check for target here, if we're entering something, there's always "something" to enter, so the other handlers can take care of it
	onMouseOut();
	
	// stop this listener, or the toolbox would be stuck close otherwise, and start listening for mouseout again
	listenerAid.remove(browserPanel, 'mouseover', onMouseReEnterBrowser);
	listenerAid.add(browserPanel, 'mouseout', onMouseOutBrowser);
};

this.onMouseOverToolbox = function(e) {
	if(trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover') && isAncestor(e.target, slimChromeContainer)) {
		slimChromeContainer.hoversQueued++;
		return;
	}
	onMouseOver(e);
};

this.onMouseOutToolbox = function(e) {
	if(trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover') && isAncestor(e.target, slimChromeContainer)) {
		slimChromeContainer.hoversQueued--;
		return;
	}
	onMouseOut();
};

this.onDragEnter = function() {
	setHover(true, false, 1);
	listenerAid.remove(slimChromeContainer, 'dragenter', onDragEnter);
	listenerAid.add(gBrowser, "dragenter", onDragExitAll);
	listenerAid.add(window, "drop", onDragExitAll);
	listenerAid.add(window, "dragend", onDragExitAll);
};

this.onDragExit = function() {
	setHover(false);
};

this.onDragExitAll = function() {
	listenerAid.add(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.remove(gBrowser, "dragenter", onDragExitAll);
	listenerAid.remove(window, "drop", onDragExitAll);
	listenerAid.remove(window, "dragend", onDragExitAll);
	setHover(false);
};

this.setHover = function(hover, now, force) {
	if(hover) {
		slimChromeContainer.hovers++;
		
		if(!now) {
			timerAid.init('setHover', function() {
				setAttribute(slimChromeContainer, 'hover', 'true');
			}, 75);
		} else {
			timerAid.cancel('setHover');
			setAttribute(slimChromeContainer, 'hover', 'true');
		}
		
		if(force != undefined && typeof(force) == 'number') {
			slimChromeContainer.hovers = force;
		}
	}
	else {
		if(force != undefined && typeof(force) == 'number') {
			slimChromeContainer.hovers = force;
		} else if(slimChromeContainer.hovers > 0) {
			slimChromeContainer.hovers--;
		}
		
		if(slimChromeContainer.hovers == 0) {
			removeAttribute(slimChromeContainer, 'fullWidth');
			
			if(!now) {
				timerAid.init('setHover', function() {
					removeAttribute(slimChromeContainer, 'hover');
				}, 250);
			} else {
				timerAid.cancel('setHover');
				removeAttribute(slimChromeContainer, 'hover');
			}
		}
	}
};

this.setMini = function(mini) {
	if(mini) {
		blockedPopup = false;
		timerAid.cancel('onlyURLBar');
		timerAid.cancel('setMini');
		setAttribute(slimChromeContainer, 'mini', 'true');
		setAttribute(slimChromeContainer, 'onlyURLBar', 'true');
	} else {
		// aSync so the toolbox focus handler knows what it's doing
		timerAid.init('setMini', function() {
			removeAttribute(slimChromeContainer, 'mini');
			timerAid.init('onlyURLBar', function() {
				removeAttribute(slimChromeContainer, 'onlyURLBar');
			}, 300);
		}, 50);
	}
};

this.focusPasswords = function(e) {
	if(e.target
	&& e.target.nodeName
	&& e.target.nodeName.toLowerCase() == 'input'
	&& !e.target.disabled
	&& (prefAid.miniOnAllInput || e.target.type == 'password')) {
		setMini(e.type == 'focus');
	}
};

// Keep chrome visible when opening menus within it
this.blockPopups = ['identity-popup', 'notification-popup'];
this.blockedPopup = false;
this.holdPopupNode = null;
this.holdPopupMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	
	// check if the trigger node is present in our toolbars;
	// there's no need to check the overflow panel here, as it will likely be open already in these cases
	var hold = isAncestor(trigger, slimChromeContainer);
	
	if(!hold && !trigger) {
		// CUI panel doesn't carry a triggerNode, we have to find it ourselves
		if(e.target.id == 'customizationui-widget-panel') {
			hold_loop: for(var t=0; t<slimChromeToolbars.childNodes.length; t++) {
				if(slimChromeToolbars.childNodes[t].localName != 'toolbar' || !CustomizableUI.getAreaType(slimChromeToolbars.childNodes[t].id)) { continue; }
				
				var widgets = CustomizableUI.getWidgetsInArea(slimChromeToolbars.childNodes[t].id);
				for(var w=0; w<widgets.length; w++) {
					var widget = widgets[w].forWindow(window);
					if(!widget || !widget.node || !widget.node.open) { continue; }
					
					hold = true;
					break hold_loop;
				}
			}
		}
		
		// let's just assume all panels that are children from these toolbars are opening from them
		else if(isAncestor(e.target, slimChromeContainer)) {
			hold = true;
		}
	}
	
	// nothing "native" is opening this popup, so let's see if someone claims it
	if(!hold) {
		trigger = askForOwner(e.target);
		if(trigger && typeof(trigger) == 'string') {
			trigger = $(trigger);
			// trigger could be either in the toolbars themselves or in the overflow panel
			hold = isAncestor(trigger, slimChromeContainer) || isAncestor(trigger, $('widget-overflow-list'));
		}
	}
	
	if(hold) {
		// if we're opening the chrome now, the anchor may move, so we need to reposition the popup when it does
		holdPopupNode = e.target;
		
		// if opening a panel from the urlbar, we should keep the mini state, instead of expanding to full chrome
		if(trueAttribute(slimChromeContainer, 'mini') && blockPopups.indexOf(e.target.id) > -1) {
			setMini(true);
			blockedPopup = true;
		} else {
			if(!trueAttribute(slimChromeContainer, 'hover')) {
				e.target.collapsed = true;
			}
			
			setHover(true);
		}
		
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			listenerAid.remove(e.target, 'popuphidden', selfRemover);
			
			if(typeof(setHover) != 'undefined') {
				if(trueAttribute(slimChromeContainer, 'mini') && blockPopups.indexOf(e.target.id) > -1) {
					if(blockedPopup) {
						setMini(false);
						blockedPopup = false;
					}
				} else {
					setHover(false);
				}
				holdPopupNode = null;
			}
		}
		listenerAid.add(e.target, 'popuphidden', selfRemover);
	}
};

this.findPersonaPosition = function() {
	if(!trueAttribute(document.documentElement, 'lwtheme')) {
		prefAid.lwthemebgImage = '';
		prefAid.lwthemebgWidth = 0;
		prefAid.lwthemecolor = '';
		prefAid.lwthemebgColor = '';
		stylePersonaSlimChrome();
		return;
	}
	
	var windowStyle = getComputedStyle(document.documentElement);
	if(prefAid.lwthemebgImage != windowStyle.getPropertyValue('background-image') && windowStyle.getPropertyValue('background-image') != 'none') {
		prefAid.lwthemebgImage = windowStyle.getPropertyValue('background-image');
		prefAid.lwthemecolor = windowStyle.getPropertyValue('color');
		prefAid.lwthemebgColor = windowStyle.getPropertyValue('background-color');
		prefAid.lwthemebgWidth = 0;
		
		lwthemeImage = new window.Image();
		lwthemeImage.onload = function() { findPersonaWidth(); };
		lwthemeImage.src = prefAid.lwthemebgImage.substr(5, prefAid.lwthemebgImage.length - 8);
		return;
	}
	
	stylePersonaSlimChrome();
};

this.findPersonaWidth = function() {
	if(prefAid.lwthemebgWidth == 0 && lwthemeImage.naturalWidth != 0) {
		prefAid.lwthemebgWidth = lwthemeImage.naturalWidth;
	}
	
	if(prefAid.lwthemebgWidth != 0) {
		stylePersonaSlimChrome();
	}
};

this.stylePersonaSlimChrome = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('personaSlimChrome_'+_UUID);
	
	if(prefAid.lwthemebgImage != '') {
		var windowStyle = getComputedStyle(document.documentElement);
		var containerBox = slimChromeContainer.getBoundingClientRect();
		var containerStyle = getComputedStyle(slimChromeContainer);
		
		// Another personas in OSX tweak
		var offsetWindowPadding = windowStyle.getPropertyValue('background-position');
		var offsetPersonaY = -containerBox.top;
		offsetPersonaY += parseInt(containerStyle.getPropertyValue('margin-top'));
		if(offsetWindowPadding.indexOf(' ') > -1 && offsetWindowPadding.indexOf('px', offsetWindowPadding.indexOf(' ') +1) > -1) {
			var offset = parseInt(offsetWindowPadding.substr(offsetWindowPadding.indexOf(' ') +1, offsetWindowPadding.indexOf('px', offsetWindowPadding.indexOf(' ') +1)));
			offsetPersonaY += offset;
		}
		
		if(containerStyle.getPropertyValue('direction') == 'ltr') {
			var borderStart = parseInt(containerStyle.getPropertyValue('border-left-width'));
		} else {
			var borderStart = parseInt(containerStyle.getPropertyValue('border-right-width'));
		}
		
		var offsetPersonaX = -lastSlimChromeStyle.left -(prefAid.lwthemebgWidth - document.documentElement.clientWidth) -borderStart;
		
		var sscode = '/*The Fox, only better CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #theFoxOnlyBetter-slimChrome-container {\n';
		sscode += '	  background-image: ' + prefAid.lwthemebgImage + ' !important;\n';
		sscode += '	  background-color: ' + prefAid.lwthemebgColor + ' !important;\n';
		sscode += '	  color: ' + prefAid.lwthemecolor + ' !important;\n';
		sscode += '	  background-position: left '+offsetPersonaX+'px top '+offsetPersonaY+'px !important;\n';
		sscode += '	  background-repeat: repeat !important;\n';
		sscode += '	  background-size: auto auto !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		styleAid.load('personaSlimChrome_'+_UUID, sscode, true);
	}
};

this.slimChromeTransitioned = function(e) {
	if(e.target != slimChromeContainer) { return; }
	
	switch(e.propertyName) {
		case 'width':
			if(gNavBar.overflowable && slimChromeContainer.hovers > 0) {
				// make sure it doesn't get stuck open
				setHover(true, false, 1);
				
				// account for queued hovers while in mini mode
				if(slimChromeContainer.hoversQueued) {
					slimChromeContainer.hovers += slimChromeContainer.hoversQueued;
					slimChromeContainer.hoversQueued = 0;
				}
				
				setAttribute(slimChromeContainer, 'fullWidth', 'true');
				
				gNavBar.overflowable._onResize();
				gNavBar.overflowable._lazyResizeHandler.finalize().then(function() {
					gNavBar.overflowable._lazyResizeHandler = null;
					if(holdPopupNode) {
						holdPopupNode.moveTo(-1,-1);
						holdPopupNode.collapsed = false;
					}
				});
			}
			break;
		
		case 'opacity':
			toggleAttribute(slimChromeContainer, 'noPointerEvents', !trueAttribute(slimChromeContainer, 'mini') && !trueAttribute(slimChromeContainer, 'hover'));
			break;
		
		default: break;
	}
};

this.slimChromeProgressListener = {
	last: null,
	onLocationChange: function(aProgress, aRequest, aURI) {
		// happens when exiting customize mode, although I have no clue why...
		if(typeof(slimChromeContainer) == 'undefined') { return; }
		
		try { var host = aURI.host; }
		catch(ex) { var host = aURI.spec; }
		
		// no point in showing in certain cases
		if(host == this.last || gBrowser.selectedTab.pinned || window.XULBrowserWindow.inContentWhitelist.indexOf(aURI.spec) > -1) { return; }
		
		this.last = host;
		
		// also no point in showing mini if it's already shown
		if(trueAttribute(slimChromeContainer, 'hover')) {
			setMini(false);
		} else {
			setMini(true);
			timerAid.init('setMini', function() { setMini(false); }, 2000);
		}
	}
};

this.slimChromeKeydown = function(e) {
	if(e.ctrlKey || e.altKey || e.metaKey) { return; }
	onMouseOut();
};

this.loadSlimChrome = function() {
	slimChromeContainer.hovers = 0;
	slimChromeContainer.hoversQueued = 0;
	
	slimChromeToolbars.appendChild(gNavBar);
	
	// the nav-bar really shouldn't over- or underflow when it's hidden, as it doesn't have its real width
	gNavBar.overflowable.__onLazyResize = gNavBar.overflowable._onLazyResize;
	gNavBar.overflowable._onLazyResize = function() {
		if(!trueAttribute(slimChromeContainer, 'hover')) { return; }
		this.__onLazyResize();
	};
	gNavBar.overflowable._onOverflow = gNavBar.overflowable.onOverflow;
	gNavBar.overflowable.onOverflow = function(e) {
		if(!trueAttribute(slimChromeContainer, 'hover')) { return; }
		this._onOverflow(e);
	};
	gNavBar.overflowable.__moveItemsBackToTheirOrigin = gNavBar.overflowable._moveItemsBackToTheirOrigin;
	gNavBar.overflowable._moveItemsBackToTheirOrigin = function(shouldMoveAllItems) {
		if(!trueAttribute(slimChromeContainer, 'hover')) { return; }
		this.__moveItemsBackToTheirOrigin(shouldMoveAllItems);
	};
	
	// also append all other custom toolbars
	var toolbar = customToolbars;
	while(toolbar.nextSibling) {
		toolbar = toolbar.nextSibling;
		if(toolbar.id == 'addon-bar') { continue; }
		
		var toMove = toolbar;
		toolbar = toolbar.previousSibling;
		slimChromeToolbars.appendChild(toMove);
		
		if(gNavToolbox.externalToolbars.indexOf(toMove) == -1) {
			gNavToolbox.externalToolbars.push(toMove);
		}
	}
	
	// position the top chrome correctly when the window is resized or a toolbar is shown/hidden
	listenerAid.add(browserPanel, 'resize', delayMoveSlimChrome);
	
	// keep the toolbox when hovering it
	listenerAid.add(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.add(gNavToolbox, 'mouseover', onMouseOverToolbox);
	listenerAid.add(gNavToolbox, 'mouseout', onMouseOutToolbox);
	
	// the empty area of the tabs toolbar doesn't respond to mouse events, so we need to use mouseout from the browser-panel instead
	listenerAid.add(browserPanel, 'mouseout', onMouseOutBrowser);
	
	// if a menu or a panel is opened from the toolbox, keep it shown
	listenerAid.add(window, 'popupshown', holdPopupMenu);
	
	// also keep the toolbox visible if it has focus of course
	listenerAid.add(gNavToolbox, 'focus', onFocus, true);
	listenerAid.add(gNavToolbox, 'blur', onMouseOut, true);
	
	// show mini chrome when focusing password fields
	listenerAid.add(gBrowser, 'focus', focusPasswords, true);
	listenerAid.add(gBrowser, 'blur', focusPasswords, true);
	
	// hide chrome when typing in content
	listenerAid.add(gBrowser, 'keydown', slimChromeKeydown, true);
	
	// re-do widgets positions after resizing
	listenerAid.add(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	
	// show mini when the current tab changes host; this will also capture when changing tabs
	gBrowser.addProgressListener(slimChromeProgressListener);
	
	// support personas in hovering toolbox
	observerAid.add(findPersonaPosition, "lightweight-theme-changed");
	
	moveSlimChrome();
};

this.unloadSlimChrome = function() {
	listenerAid.remove(browserPanel, 'resize', delayMoveSlimChrome);
	listenerAid.remove(browserPanel, 'mouseout', onMouseOutBrowser);
	listenerAid.remove(browserPanel, 'mouseover', onMouseReEnterBrowser);
	listenerAid.remove(gNavToolbox, 'dragenter', onDragEnter);
	listenerAid.remove(gNavToolbox, 'mouseover', onMouseOverToolbox);
	listenerAid.remove(gNavToolbox, 'mouseout', onMouseOutToolbox);
	listenerAid.remove(gBrowser, "dragenter", onDragExitAll);
	listenerAid.remove(window, "drop", onDragExitAll);
	listenerAid.remove(window, "dragend", onDragExitAll);
	listenerAid.remove(window, 'popupshown', holdPopupMenu);
	listenerAid.remove(gNavToolbox, 'focus', onFocus, true);
	listenerAid.remove(gNavToolbox, 'blur', onMouseOut, true);
	listenerAid.remove(gBrowser, 'focus', focusPasswords, true);
	listenerAid.remove(gBrowser, 'blur', focusPasswords, true);
	listenerAid.remove(gBrowser, 'keydown', slimChromeKeydown, true);
	listenerAid.remove(slimChromeContainer, 'transitionend', slimChromeTransitioned);
	gBrowser.removeProgressListener(slimChromeProgressListener);
	observerAid.remove(findPersonaPosition, "lightweight-theme-changed");
	
	gNavBar.overflowable._onLazyResize = gNavBar.overflowable.__onLazyResize;
	gNavBar.overflowable.onOverflow = gNavBar.overflowable._onOverflow;
	gNavBar.overflowable._moveItemsBackToTheirOrigin = gNavBar.overflowable.__moveItemsBackToTheirOrigin;
	delete gNavBar.overflowable.__onLazyResize;
	delete gNavBar.overflowable._onOverflow;
	delete gNavBar.overflowable.__moveItemsBackToTheirOrigin;
	
	gNavToolbox.insertBefore(gNavBar, customToolbars);
	
	while(slimChromeToolbars.firstChild) {
		var e = gNavToolbox.externalToolbars.indexOf(slimChromeToolbars.firstChild);
		if(e != -1) {
			gNavToolbox.externalToolbars.splice(e, 1);
		}
		
		gNavToolbox.appendChild(slimChromeToolbars.firstChild);
	}
};
	
moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'slimChrome', null, loadSlimChrome, unloadSlimChrome);
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('personaSlimChrome_'+_UUID);
	overlayAid.removeOverlayWindow(window, 'slimChrome');
};
