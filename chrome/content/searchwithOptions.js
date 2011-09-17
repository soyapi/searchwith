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
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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
 
var SearchWithOptions = {

	swServiceList: null,
	swEngineList: null,
	swNewEngineList: null,
	swPluginDirList: null,
	prefs: null,
	swPrefs: null, 
	svcPrefs: null,
	swPrefsString: "extensions.searchwith.",

    onLoad: function() 
    {
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefService);  
        this.swPrefs = this.prefs.getBranch("extensions.searchwith.");
        
        var enableContextMenu = document.getElementById("searchwith-prefs-enable-context");
        enableContextMenu.checked = SearchWith.getBoolPref("enable-contextmenu");
        
        this.swServiceList = document.getElementById("searchwith-prefs-service-list");
        this.swEngineList = document.getElementById("searchwith-prefs-engine-list");
        this.swNewEngineList = document.getElementById("searchwith-prefs-new-service-engine");
        this.swPluginDirList = document.getElementById("searchwith-prefs-plugin-dirlist");
        
        this.populateServices();
        this.populateEngines();
		this.populatePluginDirs();

		window.focus();
    },
    
    addService: function() 
    {
        var newServiceName = "";
        var newServiceId = "";
        
        newServiceName = document.getElementById("searchwith-prefs-new-service").value;
        SearchWith.trim(newServiceName);
        if (newServiceName.length <1) {
            return;
        }
        
        newServiceId = SearchWith.createId(newServiceName);
        var tmpService = new SearchWithService(newServiceId);
		tmpService.addToList();
		
		if (tmpService.getName().length >0) {
            alert(SearchWith.getPropString("service.already.exists", "searchwith-strings"));
            return;
        }
              
        var li = this.swServiceList.appendItem(newServiceName, newServiceId);
        li.disabled = true;
    
        this.swServiceList.selectedItem = li;
        document.getElementById("searchwith-prefs-new-service").value = "";
        this.editService();
    }, 
    
    populateServices: function() 
    {
        var serviceName = "";
        var swServices = SearchWith.getServices();
        this.swServiceList = document.getElementById("searchwith-prefs-service-list");
        
        SearchWith.removeChildren(this.swServiceList);
        for (var i=0; i<swServices.length; i++) {
            var aService = new SearchWithService(swServices[i]);
			aService.addToListbox(this.swServiceList);
        }
        this.refreshServiceBtns();
        this.swServiceList.selectedIndex = 0;
    },
    
    populateEngines: function() 
    {
        var swEngines = SearchWith.getEngines();
        SearchWith.removeChildren(this.swEngineList);
        for (var i=0; i<swEngines.length; i++) {
            var anEngine = new SearchWithEngine(swEngines[i]);
			anEngine.addToListbox(this.swEngineList);
        }
		
        // enable or disable buttons 
        if (this.swEngineList.getRowCount()<1) {
            document.getElementById("searchwith-prefs-edit-engine-button").disabled = true;
            document.getElementById("searchwith-prefs-remove-engine-button").disabled = true;
        } else {
            document.getElementById("searchwith-prefs-edit-engine-button").disabled = false;
            document.getElementById("searchwith-prefs-remove-engine-button").disabled = false;
            
            if (this.swEngineList.selectedItems.length < 1) {
                this.swEngineList.selectItem(this.swEngineList.getItemAtIndex(0));
            }
        }
    },
    
	populatePluginDirs: function() 
    {
        var swPluginDirs = SearchWith.getCVPref("pluginsDirList").split(";");
         
        SearchWith.removeChildren(this.swPluginDirList);
        
        for (each in swPluginDirs) {
            if (SearchWith.trim(swPluginDirs[each]).length<1) {
                continue;
            }
			var aListItem = this.swPluginDirList.appendItem(swPluginDirs[each], 
													swPluginDirs[each].toLowerCase());
			aListItem.setAttribute("tooltiptext", swPluginDirs[each]);
			aListItem.crop = "center";
        }
        
        // enable or disable buttons
        if (this.swPluginDirList.getRowCount()<1) {
            document.getElementById("searchwith-prefs-remove-plugindir").disabled = true;
        } else {
            document.getElementById("searchwith-prefs-remove-plugindir").disabled = false;
            
            if (this.swPluginDirList.selectedItems.length < 1) {
                this.swPluginDirList.selectItem(this.swPluginDirList.getItemAtIndex(0));
            }
        }
    },
	
    editService: function() 
    {
		SearchWith.editService("searchwith-prefs-service-list");
/*        var swsl = document.getElementById("searchwith-prefs-service-list");
        window.openDialog("chrome://searchwith/content/searchwithOptionsService.xul",
							"Service Options", "chrome", swsl);*/
    },
    
    removeService: function() 
    {
        var swsl = this.swServiceList;
		var delWarn = "";
		try {
            var strBundle = document.getElementById("searchwith-strings");
            delWarn = strBundle.getFormattedString("permanently.delete.service", 
													[swsl.selectedItem.label]);
        } catch(e) {
            delWarn = "permanently.delete.service";
        }
        if (!confirm(delWarn)) {
            return;
        }
		
        var serviceId = swsl.selectedItem.value;

		// clear service from engine of this service
		var serviceEngines = SearchWith.getEnginesOfService(serviceId);
		for (var i=0; i<serviceEngines.length; i++) {
		  var swEngine = new SearchWithEngine(serviceEngines[i]);
		  swEngine.setServiceId("");
		}
        
		// remove service from service list
        var swServices = SearchWith.getServices();
        var arr = new Array();
        for (var i=0; i<swServices.length; i++) {
            if (swServices[i] != serviceId) {
                arr.push(swServices[i]);
            }
        }
        
        try {
            this.swPrefs.deleteBranch("service."+serviceId);
        } catch(e) {
        }
        
        SearchWith.setCVPref("service-list",arr.join(","));
        this.populateServices();
    },
    
    refreshServiceBtns: function() 
    {
        document.getElementById("searchwith-prefs-edit-service-button").disabled = false;
        document.getElementById("searchwith-prefs-remove-service-button").disabled = false;
        document.getElementById("searchwith-prefs-service-moveup").disabled = false;
        document.getElementById("searchwith-prefs-service-movedown").disabled = false;
        
        if (this.swServiceList.getRowCount() < 1 ) {
            document.getElementById("searchwith-prefs-edit-service-button").disabled = true;
            document.getElementById("searchwith-prefs-remove-service-button").disabled = true;
            document.getElementById("searchwith-prefs-service-moveup").disabled = true;
            document.getElementById("searchwith-prefs-service-movedown").disabled = true;
        } else {
            if (this.swServiceList.selectedIndex == -1) {
                document.getElementById("searchwith-prefs-edit-service-button").disabled = true;
                document.getElementById("searchwith-prefs-remove-service-button").disabled = true;
                document.getElementById("searchwith-prefs-service-moveup").disabled = true;
                document.getElementById("searchwith-prefs-service-movedown").disabled = true;
            } else {    
                if (this.swServiceList.selectedIndex == 0) {
                    
                    document.getElementById("searchwith-prefs-service-moveup").disabled = true;
                }
                if (this.swServiceList.selectedIndex == this.swServiceList.getRowCount()-1) {
                    document.getElementById("searchwith-prefs-service-movedown").disabled = true;
                }
            }
        }
    },
    
    addEngine: function() 
    {
        var newEngineName = "";
        var newEngineId = "";
    
        newEngineName = document.getElementById("searchwith-prefs-new-engine").value;
        newEngineName = SearchWith.trim(newEngineName);
        if (newEngineName.length <1) {
            return;
        }
        
        newEngineId = SearchWith.createId(newEngineName);
        var newEngine = new SearchWithEngine(newEngineId);
        if (newEngine.getName().length > 0) {
            alert(SearchWith.getPropString("engine.already.exists", "searchwith-strings"));
			newEngine.addToList();
			return;
        }
        
        newEngine.setName(newEngineName);
        newEngine.addToList();
        
		// .appendItem() not working when item count exceeds no. of visible rows
		var eli = this.swEngineList.insertItemAt(0, newEngineName, newEngineId);
        this.swEngineList.selectedItem = eli;
		eli.setAttribute("disabled", "true");
		this.swEngineList.scrollToIndex(this.swEngineList.selectedIndex);
        document.getElementById("searchwith-prefs-new-engine").value = "";
        this.editEngine();
    },
    
    editEngine: function() 
    {
		SearchWith.editEngine("searchwith-prefs-engine-list");
		/*
        var swel = document.getElementById("searchwith-prefs-engine-list");
        if (swel.selectedItems.length>0) { // should always be true; we disable button when no engine is selected
            window.openDialog("chrome://searchwith/content/searchwithOptionsEngine.xul","Edit Engine",
                      "chrome",swel);
        }
		*/
    },
    
    removeEngine: function() 
    {
        var swel = this.swEngineList;
        var engineId = swel.selectedItem.value;
        var delWarn = "";
		try {
            var strBundle = document.getElementById("searchwith-strings");
            delWarn = strBundle.getFormattedString("permanently.delete.engine", 
													[swel.selectedItem.label]);
        } catch(e) {
            delWarn = "permanently.delete.engine";
        }
        if (!confirm(delWarn)) {
            return;
        }
        
        // if engine to be deleted is being used by a search service, disable the service
        var swServices = SearchWith.getServices();
        for (each in swServices) {
            var aService = new SearchWithService(swServices[each]);
            if (aService.getEngineId() == engineId) {
                aService.setEngineId("");
                this.populateServices();
            }
        }
            
        var swEngine = new SearchWithEngine(engineId);
		swEngine.removeFromList();
        
        try {
            this.swPrefs.deleteBranch("engine."+engineId);
        } catch(e) {
        }
        this.populateEngines();
    },
    
    checkAddServiceBtn: function(aEvent) 
    {
        var newService = document.getElementById("searchwith-prefs-new-service").value;
        newService = SearchWith.trim(newService);
        if (newService.length <1) {
            document.getElementById("searchwith-prefs-add-service-button").disabled = true;
        } else {
            document.getElementById("searchwith-prefs-add-service-button").disabled = false;
        }
    },
    
    checkAddEngineBtn: function() 
    {
        var newEngine = document.getElementById("searchwith-prefs-new-engine").value;
        newEngine = newEngine.replace(/\s+/g,'');
        if (newEngine.length <1) {
            document.getElementById("searchwith-prefs-add-engine-button").disabled = true;
        } else {
            document.getElementById("searchwith-prefs-add-engine-button").disabled = false;
        }
    },
    
    restoreDefaults: function() 
    {
        var swel = this.swEngineList;
        if (!confirm(SearchWith.getPropString("restore.default.settings", "searchwith-strings"))) {
            return;
        }
		
		SearchWith.resetSettings();
        SearchWith.doFirstRun();
        
        this.populateServices();        
        this.populateEngines();        
		this.populatePluginDirs();
    },
    
    loadMycroftPlugins: function() 
	{    
        SearchWith.importSearchBarEngines(true);
        this.populateEngines();
    },
    
    moveService: function(aDirection)
    {
        var swServices = SearchWith.getServices();
        var swsl = this.swServiceList;
        var serviceId = swServices[swsl.selectedIndex];
        
        var itemPos = swsl.selectedIndex;
        var newPos = 0;
        
        if (aDirection == "up") {
            if (itemPos > 0) {
                newPos = itemPos-1;
                swServices[itemPos] = swServices[newPos];
                swServices[newPos] = serviceId;
            }
        } else {
            if (itemPos < swServices.length) {
                newPos = itemPos+1;
                swServices[itemPos] = swServices[newPos];
                swServices[newPos] = serviceId;
            }
        }
        
        SearchWith.setCVPref("service-list", swServices.join(","));
        
        this.populateServices();
        swsl.selectedIndex = newPos;
    },
    
    addDir: function() 
    {
		var newPath = SearchWith.trim(document.getElementById("searchwith-prefs-new-plugindir").value);
		if (newPath.length < 1) {
			newPath = SearchWith.browse4Dir();
		} else {
            var theDir = Components.classes["@mozilla.org/file/local;1"].createInstance(
                                            Components.interfaces.nsILocalFile);
            theDir.QueryInterface(Components.interfaces.nsIFile);
            try {
				theDir.initWithPath(newPath);
				if (!theDir.exists()) {
					newPath = SearchWith.browse4Dir();
				}
			} catch(e) {
				newPath = SearchWith.browse4Dir();
			}    
        }
        
		if (newPath.length < 1) {
			return;
		}    
		
        var newItem = this.swPluginDirList.appendItem(newPath, newPath.toLowerCase());
        
        var currDirs = SearchWith.getCVPref("pluginsDirList").split(";");
        currDirs.push(newPath);
        SearchWith.setCVPref("pluginsDirList", currDirs.join(";"));
        
    },
	
	removePluginDir: function()
	{
		var currDirs = SearchWith.getCVPref("pluginsDirList").split(";");

        var delWarn = "";
		try {
            var strBundle = document.getElementById("searchwith-strings");
            delWarn = strBundle.getFormattedString("permanently.delete.dir", 
													[this.swPluginDirList.selectedItem.label]);
        } catch(e) {
            delWarn = "permanently.delete.dir";
        }
        if (!confirm(delWarn)) {
            return;
        }
        
        var newDirs = new Array();
		for (each in currDirs) {
			if (currDirs[each].toLowerCase() != this.swPluginDirList.selectedItem.value.toLowerCase()) {
				newDirs.push(currDirs[each]);
			}
		}

		SearchWith.setCVPref("pluginsDirList", newDirs.join(";"));
		this.populatePluginDirs();
	},
    
    changeShowContext: function()
    {
        var currVal = document.getElementById("searchwith-prefs-enable-context").checked;
        SearchWith.setBoolPref("enable-contextmenu", currVal);
    },

	onAccept: function()
	{
		var newServiceName = document.getElementById("searchwith-prefs-new-service");
		var newEngineName = document.getElementById("searchwith-prefs-new-engine");
		if (SearchWith.trim(newServiceName.value).length > 0) {
			this.addService();
			return false;
		}

		if (SearchWith.trim(newEngineName.value).length > 0) {
			this.addEngine();
			return false;
		}
		SearchWith.saveSettings();
		return true;		
    }
};

