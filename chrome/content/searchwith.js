/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Soyapi Mumba.
 *
 * Portions created by the Initial Developer are Copyright (C) 2005,2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 
var SearchWithObject = function() {};

var SearchWith = {
	load: function()
	{
		if (document.getElementById("contentAreaContextMenu")) {
			document.getElementById("contentAreaContextMenu").addEventListener("popupshown", SearchWith.initMenu, false);
		}
		if (document.getElementById("mailContext")) {
			document.getElementById("mailContext").addEventListener("popupshown", SearchWith.initMenu, false);
		}
		if (document.getElementById("messagePaneContext")) {
			document.getElementById("messagePaneContext").addEventListener("popupshown", SearchWith.initMenu, false);
		}
		if (document.getElementById("msgComposeContext")) {
			document.getElementById("msgComposeContext").addEventListener("popupshown", SearchWith.initMenu, false);
		}

		SearchWith.checkFirstRun();
		return;
	},
    
    checkFirstRun: function() 
	{
        var firstRun = false;
        var firstRunVer = false;
        firstRun = SearchWith.getBoolPref("firstRun");
        
        if (firstRun) {                 // fresh install
            SearchWith.doFirstRun();
		}
        return;
    },
    
    doFirstRun: function() 
	{
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);  
        var thisPrefBranch = prefs.getBranch("");

        this.initPluginDirs();
		this.importSearchBarEngines(false);
		
		// Google Desktop Search integration
		this.integrateService("Desktop Search", "googledesktop");
		
        // Flock integration
        if (this.getHostApp() == "Flock") {
            // use Flock's favourites web service if we have it in our engine list
			var browserBookmarkEngineId = "";
            try {
                browserBookmarkEngineId = thisPrefBranch.getComplexValue(
									"flock.favorites.webservice.id",
                                    Components.interfaces.nsISupportsString).data;
				var theEngine = new SearchWithEngine(browserBookmarkEngineId);
				if (theEngine.getName().length>0) {
					SearchWith.setCVPref("service.bookmark.engine", browserBookmarkEngineId);
				}
            } catch(e) {
            }
			
			// use Flock's photo web service if we have it in our engine list
			var browserPhotoEngineId = "";
            try {
                browserPhotoEngineId = thisPrefBranch.getComplexValue(
									"flock.photo.api.uiname",
                                    Components.interfaces.nsISupportsString).data.toLowerCase();
				var theEngine = new SearchWithEngine(browserPhotoEngineId);
				if (theEngine.getName().length>0) {
					SearchWith.setCVPref("service.photo.engine", browserPhotoEngineId);
				}
            } catch(e) {
            }
			
			// use Flock's sourceid parameter
			var allEngines = SearchWith.getEngines();
			for (each in allEngines) {
				var theEngine = new SearchWithEngine(allEngines[each]);
				var newParams = theEngine.getRightUrl().replace(/sourceid=mozilla/gi,
																"sourceid=flock-search");
                newParams = newParams.replace(/sourceid:mozilla/gi, "sourceid:flock-search");
				theEngine.setRightUrl(newParams);
			}
        }
        
        // get browser's default web search engine
        var browserWebEngineId = SearchWith.getPropString("browser.search.defaultenginename", 
                                            "sw_bundle_browser_region").toLowerCase();
		var thisEngine = new SearchWithEngine(browserWebEngineId);
        if (thisEngine.getName().length > 0) {
			SearchWith.setCVPref("service.web.engine", browserWebEngineId);
        }
		// sort service list
		SearchWith.setCVPref("service-list", SearchWith.getServices().sort());
		SearchWith.setBoolPref("firstRun", false);
    },
    
    initMenu: function() 
    {
        // disable context menu if not enabled in Prefs
        if (!SearchWith.getBoolPref("enable-contextmenu")) {
            document.getElementById("context-searchwith").setAttribute("hidden", "true");
            return;
        } 
		var swServices = SearchWith.getServices();		
		
        var swMenu = document.getElementById("context-searchwith");
        var menuItem;
        var cmdStr;
        var swPopup = document.getElementById("popup-searchwith");

        swMenu.setAttribute("hidden", "false");
        SearchWith.removeChildren(swPopup);

        menuItem = SearchWith.getSWMenuItem(swPopup, SearchWith.getPropString("address.bar", 
                                        "searchwith-strings"), "url");
        swPopup.appendChild(menuItem);
        menuItem = document.createElement("menuseparator");
        swPopup.appendChild(menuItem);

        for (swService in swServices) {
            var searchService = new SearchWithService(swServices[swService]);
            var anEngineId = searchService.getEngineId();
            
            if (anEngineId.length<1) {
                continue;
            }
            
            var anEngine = new SearchWithEngine(anEngineId);
            menuItem = SearchWith.getSWMenuItem(swPopup, searchService.getName(), swServices[swService]);
            menuItem.setAttribute("class", "menuitem-iconic");
            menuItem.setAttribute("image", anEngine.getIconPath());
            swPopup.appendChild(menuItem);
        }
        
        swPopup.appendChild(document.createElement("menuseparator"));
		swPopup.appendChild(SearchWith.getSWMenuItem(swPopup, SearchWith.getPropString("all", 
                                                        "searchwith-strings"), "all"));
		
		var swManagerString = SearchWith.getPropString("manage.services", "searchwith-strings");
		menuItem = SearchWith.getSWMenuItem(swPopup, swManagerString, "options");
        menuItem.setAttribute("oncommand", 
			'window.openDialog("chrome://searchwith/content/searchwithOptions.xul", "'+swManagerString+'","chrome");');
        swPopup.appendChild(menuItem);
    },
      
    getSWMenuItem: function(aPopup, aLabel, aValue) 
    {
        var aMenuItem = null;
        aMenuItem = document.createElement("menuitem");
        aMenuItem.setAttribute("id", "sw-"+aValue);
        aMenuItem.setAttribute("label", aLabel);
        aMenuItem.setAttribute("oncommand", "SearchWith.search('"+aValue+"', event);");
        return aMenuItem;
    },
    
    search: function(aServiceId, thisEvent) 
    {
		var thisApp;
		var selectAll = false;
		
		if (this.getHostApp() == "Thunderbird") {
            if (typeof(messenger) == "undefined") {
                messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();
                messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
            }
            thisApp = messenger;
		} else {
			thisApp = gBrowser;
		}
        var selText = this.getSelectedText();
        
        // Add quotes when CTRL key is pressed
		if (thisEvent.ctrlKey && selText.length > 0)
			selText = SearchWith.quoteText(selText);

        // Select All Engines of the selected service
		if (aServiceId != "url" && SearchWith.getBoolPref("service."+aServiceId +".selectAll") == true)
			selectAll = true;

        // advanced search when shift key is pressed or no text selected
        if (thisEvent.shiftKey || (selText.length < 1)) { 
            window.openDialog("chrome://searchwith/content/searchwithAdvancedSearch.xul","&advanced.search.title;",
                      "chrome",selText, aServiceId, selectAll, thisApp);
        } else {
            this.chooseEngine(selText, aServiceId, selectAll, thisApp);
        }
    },
    
    chooseEngine: function(selText, aServiceId, aSelectAll, aBrowser) 
    {
		if (aServiceId == "url") {
			if (!this.isURL(selText)) {
				this.openBrowserTab("http://google.com/search?q="+selText+"&btnI", aBrowser);
            } else {
				var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
										.getService(Components.interfaces.nsIXULAppInfo);
				var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
											   .getService(Components.interfaces.nsIVersionComparator);
                if (this.getHostApp() == "Thunderbird") {
                    this.openBrowserTab(selText, aBrowser);
				} else if (this.getHostApp() == "Firefox" && (versionChecker.compare(appInfo.version, "2.0") < 0)) {
					this.openBrowserTab(selText, aBrowser);
				} else {
					aBrowser.addTab(selText, null, null, null, null, true); // for FF 2.0 or later 
				}
			}
            return;
        }

        var swServices = this.getServices();
        var anEngine = "";
        var anEngineId = "";
		selText = escape(selText);
        
        if (aServiceId == "all") {
            for (var i=0; i<swServices.length; i++) {
                var aService = new SearchWithService(swServices[i]);
                anEngine = new SearchWithEngine(aService.getEngineId());
                if (aService.getEngineId().length>0) {
                    this.openBrowserTab(anEngine.getLeftUrl() + selText + 
                                        anEngine.getRightUrl(), aBrowser);
                }
            }
        } else {
		  	var engineIds = [];
			var service = new SearchWithService(aServiceId);
			if (aSelectAll)
			  engineIds = service.getEngines();
			else 
			  engineIds[0] = service.getEngineId();

			var engineIdCount = engineIds.length;
			for (var i=0; i<engineIdCount; i++) {
			  anEngine = new SearchWithEngine(engineIds[i]);
			  this.openBrowserTab(anEngine.getLeftUrl() + selText + 
								  anEngine.getRightUrl(), aBrowser);
			}
        }
    },
    
    getSelectedText: function() 
    {
        var node = document.popupNode;
        var selText = "";
        
        if ((node instanceof HTMLTextAreaElement) || 
		    (node instanceof HTMLInputElement && node.type == "text")) {
        
            selText = node.value.substring(node.selectionStart, node.selectionEnd);
            selText = selText.trim();
        } 
        else {
            var focusedWindow = new XPCNativeWrapper(
			     document.commandDispatcher.focusedWindow, 'window', 'getSelection()');
            selText = focusedWindow.getSelection().toString();
            selText = selText.trim();
        }
        
        if (selText.length <1) { 
			selText = window.getSelection().toString().trim();
        }
        
		// use link url when a link is clicked and no text selected
		if (typeof gContextMenu != "undefined") {
			if (selText.length<1 && gContextMenu.onLink) {
				if (typeof gContextMenu.linkURL != "function") {
					selText = gContextMenu.linkURL.trim();
				} else if (gContextMenu.linkURL()){
					selText = gContextMenu.linkURL().trim();
				}
			}
		}
        
        return selText;
    },
    
    openBrowserTab: function(srchUrl, anApp) 
    {
		if (this.getHostApp() == "Thunderbird") {
            if (srchUrl.search(/:\/\//) == -1 && (this.getHostApp() == "Thunderbird")) {
                srchUrl = "http:"+srchUrl;
			}
            anApp.launchExternalURL(srchUrl);
        } else {
            var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService).getBranch(""); 
            
            if (prefs.getBoolPref("browser.tabs.loadInBackground")) {
                anApp.addTab(srchUrl);
            } else {
                anApp.selectedTab = anApp.addTab(srchUrl);
            }
        }
    },
    
    removeChildren: function(anElement) 
    {
        while (anElement.hasChildNodes()) {
            anElement.removeChild(anElement.firstChild);
        }
    },
    
    getPropString: function(strName, aBundleName)
    {
        try {
            var strBundle = document.getElementById(aBundleName);
            return strBundle.getString(strName);
        } catch(e) {
            return strName;
        }
    },
	
    // get an array of available Search services
	getServices: function()
	{
		var swServices = SearchWith.getCVPref("service-list").split(','); 
		return swServices;
	},
	
    // get an array of available Search engines
	getEngines: function()
	{
		var swEngines = SearchWith.getCVPref("engine-list").split(',');
        swEngines.sort();
		return swEngines;
	},

    // get an array of available Search engines of the specified Service
	getEnginesOfService: function(aServiceId)
	{
		var serviceEngines = new Array();
		var swEngines = SearchWith.getEngines();
		for (var i=0; i<swEngines.length; i++) {
			var thisEngine = new SearchWithEngine(swEngines[i]);
			if (thisEngine.getLeftUrl().length < 1)
				continue;

			if (thisEngine.getServiceId().trim() == aServiceId) {
				serviceEngines.push(swEngines[i]);
			}
		}
		return serviceEngines;
	},
    
    // remove special characters from name to create an id
    createId: function(aName) 
	{
        var newId = aName.trim();
        if (newId.length <1) {
            return "";
        }
        
        newId = newId.toLowerCase();
        newId = newId.replace(/\W+/g, '');
        return newId;
    },
	
	resetSettings: function() 
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);  
        var swPrefBranch = prefs.getBranch("extensions.searchwith.");
		var swDefaultBranch = prefs.getDefaultBranch("extensions.searchwith.");
		var swSettings = swPrefBranch.getChildList("",{});
    
		for (each in swSettings) {
			try {
                swPrefBranch.clearUserPref(swSettings[each]);
			} catch(e) {
			}
		}
	},
	
	initPluginDirs: function() 
	{
		var dirList = [];
		var tmpPath = "";
        var plugDir = Components.classes["@mozilla.org/file/local;1"].createInstance(
                                            Components.interfaces.nsILocalFile);
        plugDir.QueryInterface(Components.interfaces.nsIFile);
		
		// browser plugin dir
        tmpPath = GetMycroftDir();
        if (this.getHostApp() == "Thunderbird") {
            var arr = GetMycroftDir().match(/(.*)([\\|\/])(.*)[\\|\/](.*)$/);

            // arr[2] is file delimiter; '/' or '\'
            if (navigator.platform.toLowerCase().search(/^mac/) != -1) 
				tmpPath = arr[1]+arr[2]+"Firefox.app"+arr[2]+"searchplugins";
            else if (navigator.platform.toLowerCase().search(/^win/) != -1) 
				tmpPath = arr[1]+arr[2]+"Mozilla Firefox"+arr[2]+"searchplugins";
            else 
                tmpPath = arr[1]+arr[2]+"mozilla-firefox"+arr[2]+"searchplugins";
        }
		var i = 0;
		try {
			plugDir.initWithPath(tmpPath);
			if (plugDir.exists()) {
				dirList[i] = tmpPath;
				i++;
			}
		} catch(ex) {
		}
		
		// user profile plugin dir
        tmpPath = cqrGetProfilePluginsDir();
		try {
			plugDir.initWithPath(tmpPath);
			if (plugDir.exists()) {
				dirList[i] = tmpPath;
				i++;
			}
		} catch(ex) {
		}
		
		// Google Desktop Search plugin dir
		var arr = GetMycroftDir().match(/(.*)([\\|\/])(.*)[\\|\/](.*)$/);
		if (arr && arr.length > 2) {
			//arr[2] is file delimiter; '/' or '\'
			tmpPath = arr[1]+arr[2]+"Google"+arr[2]+"Google Desktop Search"; 
			try {
				plugDir.initWithPath(tmpPath);
				if (!plugDir.exists()) 
					tmpPath = arr[1]+arr[2]+"Google"+arr[2]+"Google Desktop"; 
			} catch(ex) {}
					
			try {
				plugDir.initWithPath(tmpPath);
				if (plugDir.exists()) {
					dirList[i] = tmpPath;
					i++;
				}
			} catch(ex) {}
		}

		SearchWith.setCVPref("pluginsDirList", dirList.join(";"));
	},
	
	importSearchBarEngines: function(aVerboseMode) 
	{
        // adapted for SearchWith from ConQuery's FillMenu (conquery.js)
		cqrMess = document.getElementById("searchwith-conquery");
		var entry = new Object();
        var pluginCount = 0;
		pluginCount = SearchWithConquery.plg_QuickLoadAll();

        var entries = SearchWithEntryHash.Items;
        for (each in entries) {
            entry = entries[each];
			queryHash = SearchWithConquery.prepareAction(entry);
            
            if (entry.Action) {
                var cqrurl = SearchWithConquery.substVars(entry.Action, entry);
            } else {
                var cqrurl = entry.Action;
            }
            
            var firstpass = true;
            for (each in QueryHash){
                if (firstpass){
                    cqrurl = cqrurl + "?" + each + "=" + SearchWithQueryHash[each];
                    firstpass = false;
                } else {
                    cqrurl = cqrurl + "&" + each + "=" + QueryHash[each];
                }
            }
            
            var arr = cqrurl.match(/(.*)(\[:selection\])(.*)/);
            var swEngine = new SearchWithEngine(SearchWith.createId(entry.Title));
            swEngine.setName(entry.Title);
            swEngine.setLeftUrl(arr[1]);
            swEngine.setRightUrl(arr[3]);
            
            // support http:// and https:// paths for icons
			if (entry.iconpath.length>0) {
				if (entry.iconpath.search(/:\/\//g) == -1) {
					var theFile = Components.classes["@mozilla.org/file/local;1"].createInstance(
												Components.interfaces.nsILocalFile);
					theFile.QueryInterface(Components.interfaces.nsIFile);
					try {
						theFile.initWithPath(entry.iconpath);
						if (theFile.exists()) 
							entry.iconpath = "file://"+entry.iconpath;
					} catch(ex) {
					}
				}
				swEngine.setIconPath(entry.iconpath);
            }
			swEngine.addToList();
		}
		if (aVerboseMode) {
			var strBundle = document.getElementById("searchwith-strings");
			if (pluginCount == 1) {
				alert(strBundle.getFormattedString("plugin.imported", '1'));
            } else { 
				alert(strBundle.getFormattedString("plugins.imported", [pluginCount]));
            }
		}
	},
	
    importA9Plugin: function(filepath) 
    {
		var retItem = new SearchWithProtoEntry();
        var filedata = SearchWithConquery.readFile(filepath);
        var p_plgname = filepath.split(cqrdelim);
            
        var swDOMParser = new DOMParser();
        var searchDoc = swDOMParser.parseFromString(filedata, "text/xml");
        if (searchDoc.documentElement.tagName == "parsererror") {
            //alert(SearchWith.getPropString("parsing.error", "searchwith-strings");
            return;
        } 
        
        var leftUrl = "";
        var extraOptions = [];
        var childList = searchDoc.documentElement.childNodes;
        
        for (var i=0; i<childList.length; i++) {
            if (childList[i].nodeType != 1) 
				continue;

			if (childList[i].localName.toLowerCase() == "shortname") 
				retItem.Title = childList[i].textContent;
			else if (childList[i].localName.toLowerCase() == "description") 
				retItem.Desc = childList[i].textContent;
			else if (childList[i].localName.toLowerCase() == "image") 
				retItem.iconpath = childList[i].textContent;
			else if (childList[i].localName.toLowerCase() == "url") {
				if (childList[i].getAttribute("type") != "text/html") 
					continue;
				
				for (var a=0; a< childList[i].attributes.length; a++) {
					if (childList[i].attributes[a].name == "template") 
						retItem.Action = childList[i].attributes[a].value;
				}
				var queryParams = childList[i].childNodes;
				for (var c=0; c<queryParams.length; c++) {
					if (!queryParams[c].attributes) continue;
					for (var ca=0; ca<queryParams[c].attributes.length; ca++) {
						if (queryParams[c].attributes[ca].name == "name")
							leftUrl = leftUrl + queryParams[c].attributes[ca].value + "=";
						else if (queryParams[c].attributes[ca].name == "value")
							leftUrl = leftUrl + queryParams[c].attributes[ca].value + "&";
					}
				}
				if (leftUrl.charAt(leftUrl.length-1) == "&") 
					leftUrl = leftUrl.substring(0,leftUrl.length-1);
			}
        }
    
		if (retItem.Action.search(/\?/g) == -1) 
			retItem.Action += '?';
		
		var fullUrl = retItem.Action + leftUrl;
        var arr = fullUrl.split("{searchTerms}");
        var swEngine = new SearchWithEngine(SearchWith.createId(retItem.Title));
        swEngine.setName(retItem.Title);
        swEngine.setLeftUrl(arr[0]);
        swEngine.setRightUrl(arr[1]);
        swEngine.setIconPath(retItem.iconpath);
        swEngine.addToList();
    },
    
	// add new service with the specified engine
	integrateService: function(aServiceName, anEngineId) 
	{
		var swEngine = new SearchWithEngine(anEngineId);
		if (swEngine.getName().length>0) {
			var swService = new SearchWithService(this.createId(aServiceName));
			swService.setName(aServiceName);
			swService.setEngineId(anEngineId);
			swService.addToList();
		}
	},
    
    browse4Dir: function()
    {
        var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(
                            Components.interfaces.nsIFilePicker);
        filePicker.init(window, "", Components.interfaces.nsIFilePicker.modeGetFolder);
        var res = filePicker.show();
        if (res == Components.interfaces.nsIFilePicker.returnOK) 
            return filePicker.file.path;
        else 
			return "";
    },
    
    browse4File: function()
    {
        var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(
                            Components.interfaces.nsIFilePicker);
        filePicker.init(window, "", Components.interfaces.nsIFilePicker.modeOpen);
		filePicker.appendFilters(Components.interfaces.nsIFilePicker.filterImages);
        var res = filePicker.show();
        if (res == Components.interfaces.nsIFilePicker.returnOK) 
            return filePicker.file.path;
        else 
			return "";
    },
	
	// get SearchWith Complex Value Preference
	getCVPref: function(aPref)
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(
		               Components.interfaces.nsIPrefService);  
        var swPrefBranch = prefs.getBranch("extensions.searchwith.");
		var prefValue = "";
		
		try {
			prefValue = swPrefBranch.getComplexValue(aPref, 
								Components.interfaces.nsISupportsString).data;
		} catch(e){
		}
		
		return prefValue;
	},
	
	// get SearchWith Boolean Preference
	getBoolPref: function(aPref)
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(
		              Components.interfaces.nsIPrefService);  
        var swPrefBranch = prefs.getBranch("extensions.searchwith.");
		var prefValue = false;
		
		try {
			prefValue = swPrefBranch.getBoolPref(aPref);
		} catch(e){
		}
		
		return prefValue;
	},
	
	// set SearchWith Boolean Preference
	setCVPref: function(aPref, aValue)
	{
	    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(
			           Components.interfaces.nsIPrefService);  
        var swPrefBranch = prefs.getBranch("extensions.searchwith.");
		var suppStr = Components.classes["@mozilla.org/supports-string;1"].createInstance(
											Components.interfaces.nsISupportsString);
		suppStr.data = aValue;
		try {
			swPrefBranch.setComplexValue(aPref,
						Components.interfaces.nsISupportsString, suppStr);
		} catch(e) {
		}
	},
	
	// set SearchWith Boolean Preference
	setBoolPref: function(aPref, aValue)
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);  
        var swPrefBranch = prefs.getBranch("extensions.searchwith.");
		
		try {
			swPrefBranch.setBoolPref(aPref, aValue);
		} catch(e){
		}
	},
	
	// save SearchWith settings
	saveSettings: function()
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);  
		
		try {
			prefs.savePrefFile(null);
		} catch(e){
		}
	},
	
	// move data from old prefs to new ones
	syncLegacyPrefs: function() 
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);
        var swPrefs = prefs.getBranch("extensions.searchwith.");
		
		// old engines
		var engineList = SWLegacy.getEngines();
		for (i in engineList) {
			var engine = new SearchWithEngine(engineList[i]);
			engine.setName(SWLegacy.getEngineName(engineList[i]));
			engine.addToList();
			try {
				swPrefs.deleteBranch("engine-list."+engineList[i]);
			} catch(e) {
			}
		}
		
		// import old services and delete old prefs
		var serviceList = SWLegacy.getServices();
		for (i in serviceList) {
			var service = new SearchWithService(serviceList[i]);
			service.addToList();
			service.setEngineId(SWLegacy.getServiceEngineId(serviceList[i]));
			swPrefs.deleteBranch("service-list."+serviceList[i]);
		}
		// sort new services list
		SearchWith.setCVPref("service-list", SearchWith.getServices().sort());
	},
	
	url2host: function(url) {
		var re = new RegExp("^([http|https]://)([^/]*)","ig");
		retmp = re.exec(url);
		if (retmp) 
			return retmp[0]+retmp[1];
		else 
			return "";
	},

	quoteText: function(aText)
	{
		if (aText.substr(0,1) != '"')
			return '"'+aText+'"';
		else
			return aText;
	},

	/* return name of host application or blank if unknown */
	getHostApp: function()
	{
		const FIREFOX_ID = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
		const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
        const FLOCK_ID = "{a463f10c-3994-11da-9945-000d60ca027b}";

		var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
								.getService(Components.interfaces.nsIXULAppInfo);

		if (appInfo.ID == FIREFOX_ID) {
			return "Firefox";
		} else if(appInfo.ID == THUNDERBIRD_ID) {
			return "Thunderbird";
		} else if(appInfo.ID == FLOCK_ID) {
			return "Flock";
		} else {
			return "";
		}

	},
	
    editEngine: function(aListBoxId) 
    {
        var swsl = document.getElementById(aListBoxId);
        window.openDialog("chrome://searchwith/content/searchwithOptionsEngine.xul",
							"Engine Options", "chrome", swsl);
    },
	
    editService: function(aListBoxId) 
    {
        var swsl = document.getElementById(aListBoxId);
        window.openDialog("chrome://searchwith/content/searchwithOptionsService.xul",
							"Service Options", "chrome", swsl);
    },

	isURL: function(aText)
	{
		if (aText.search(/\s/) != -1)
			return false;

		if (aText.search(/:\/\//) != -1)
			return true;
		if (aText.search(/\.\w/) != -1)
			return true;

		if (aText.search(/@/) != -1)
			return false;

		return false;
	},

    getDelim: function() {
        var cqr_platform = new String(navigator.platform);
        var cqrdelim = "\\";
        if(cqr_platform.search(/^Win/)) {
            if(cqr_platform.search(/^Mac/)) {
                var cqrdelim = "/";
            } else {
                var cqrdelim = ":";
            }
        } else {
            var cqrdelim = "\\";
        }
        return cqrdelim;
    }


	
};

var SWLegacy = {
	getServices: function()
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);
        try {
			var svcPrefs = prefs.getBranch("extensions.searchwith.service-list.");				
			var swServices = svcPrefs.getChildList("", {});		
		} catch(e){
		}
		swServices.sort();
		return swServices;
	},
	
	getEngines: function()
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);
		try {
			var egnPrefs = prefs.getBranch("extensions.searchwith.engine-list.");				
			var swEngines = egnPrefs.getChildList("", {});		
		} catch(e) {
		}
        swEngines.sort();
		return swEngines;
	},
	
	getEngineName: function(anEngineId) 
	{
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);
		var swPrefs = prefs.getBranch("extensions.searchwith.");
		try {
            return swPrefs.getComplexValue("engine-list."+anEngineId,
                                Components.interfaces.nsISupportsString).data;
        } catch(e) {
            return "";
        }
	},
	
	getServiceEngineId: function(aServiceId) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);
        var swPrefs = prefs.getBranch("extensions.searchwith.");	
        try {
            return swPrefs.getComplexValue("service-list."+aServiceId,
                            Components.interfaces.nsISupportsString).data;
        } catch(e) {
            return "";
        }
	}
}

// Add trim() method to String Class
String.prototype.trim = function() 
{ 
    return this.replace(/^\s+|\s+$/g, ''); 
};

window.addEventListener("load", SearchWith.load, false);

