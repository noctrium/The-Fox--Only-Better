// VERSION = '1.0.2'

// Strings - use for getting strings out of bundles from .properties locale files
this.__defineGetter__('Strings', function() { delete this.Strings; Modules.load('utils/Strings'); return Strings; });

// xmlHttpRequest() - aid for quickly using the nsIXMLHttpRequest interface
this.xmlHttpRequest = function(url, callback, method, async) { loadSandboxTools(); return xmlHttpRequest(url, callback, method, async); };

// aSync() - lets me run aFunc asynchronously
this.aSync = function(aFunc, aDelay) { loadSandboxTools(); return aSync(aFunc, aDelay); };

// dispatch() - creates and dispatches an event and returns (bool) whether preventDefault was called on it
this.dispatch = function(obj, properties) { loadSandboxTools(); return dispatch(obj, properties); };

// compareFunction() - returns (bool) if a === b
this.compareFunction = function(a, b, strict) { loadSandboxTools(); return compareFunction(a, b, strict); };

// isAncestor() - Checks if aNode decends from aParent
this.isAncestor = function(aNode, aParent) { loadSandboxTools(); return isAncestor(aNode, aParent); };

// hideIt() - in theory this should collapse whatever I want
this.hideIt = function(aNode, show) { loadSandboxTools(); return hideIt(aNode, show); };

// trim() - trims whitespaces from a string
this.trim = function(str) { loadSandboxTools(); return trim(str); };

// getComputedStyle() - returns the resulting object from calling the equivalent window.getComputedStyle() on it
this.getComputedStyle = function(aNode, pseudo) { loadSandboxTools(); return getComputedStyle(aNode, pseudo); };

// replaceObjStrings() - replace all objName and objPathString references in the node attributes and its children with the proper names
this.replaceObjStrings = function(node) { loadSandboxTools(); return replaceObjStrings(node); };

// setAttribute() - helper me that saves me the trouble of checking if the obj exists first everywhere in my scripts; yes I'm that lazy
this.setAttribute = function(obj, attr, val) { loadAttributesTools(); return setAttribute(obj, attr, val); };

// removeAttribute() - helper me that saves me the trouble of checking if the obj exists first everywhere in my scripts; yes I'm that lazy
this.removeAttribute = function(obj, attr) { loadAttributesTools(); return removeAttribute(obj, attr); };

// toggleAttribute() - sets attr on obj if condition is true; I'm uber lazy
this.toggleAttribute = function(obj, attr, condition, trueval, falseval) { loadAttributesTools(); return toggleAttribute(obj, attr, condition, trueval, falseval); };

// trueAttribute() - checks if attr on obj has value 'true'; once again, I'm uber lazy
this.trueAttribute = function(obj, attr) { loadAttributesTools(); return trueAttribute(obj, attr); };

// innerText() - returns the equivalent of IE's .innerText property of node; essentially returns .textContent without the script tags
this.innerText = function(node) { loadHTMLElementsTools(); return innerText(node); };

this.loadSandboxTools = function() {
	delete this.xmlHttpRequest;
	delete this.aSync;
	delete this.dispatch;
	delete this.compareFunction;
	delete this.isAncestor;
	delete this.hideIt;
	delete this.trim;
	delete this.replaceObjStrings;
	delete this.getComputedStyle;
	delete this.loadSandboxTools;
	Modules.load('utils/sandboxTools');
};

this.loadAttributesTools = function() {
	delete this.setAttribute;
	delete this.removeAttribute;
	delete this.toggleAttribute;
	delete this.trueAttribute;
	delete this.loadAttributesTools;
	Modules.load('utils/attributes');
};

this.loadHTMLElementsTools = function() {
	delete this.innerText;
	delete this.loadHTMLElementsTools;
	Modules.load('utils/HTMLElements');
};
