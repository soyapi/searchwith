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
 
var SearchWithAdvancedSearch = {
	
	serviceId: "",
	selectedText: "",
	
    onLoad: function() 
    {	
        var swServiceName = "";
        this.selectedText = window.arguments[0];
        this.serviceId = window.arguments[1];
        var selectAll = window.arguments[2];
        var aService = new SearchWithService(this.serviceId);
		
        swServiceName = aService.getName();

        var selectionText = document.getElementById("searchwith-selection-text");
        selectionText.setAttribute("value", this.selectedText);
        
        var serviceLabel = document.getElementById("searchwith-selection-service-name");
        serviceLabel.value = swServiceName;
		
        var engineId = aService.getEngineId();
        var anEngine = new SearchWithEngine(engineId);  
        var engineIcon = document.getElementById("searchwith-selection-icon");
        engineIcon.src = anEngine.getIconPath();
		
		var swEngineList = document.getElementById("searchwith-selection-engine");
        this.populateEngines(swEngineList, this.serviceId);
		if (selectAll)
		  swEngineList.selectAll();

		if ((SearchWith.getEnginesOfService("").length < 1) || 
			 this.serviceId == "url" || this.serviceId == "all") {
			var moreEnginesLabel = document.getElementById("searchwith-selection-more-engines");
			moreEnginesLabel.setAttribute("disabled", "true");
			moreEnginesLabel.setAttribute("onclick", "");
		}

		window.focus();
    },
    
    doAccept: function(aEvent)
    {
        var selectionText = document.getElementById("searchwith-selection-text");
		var swEngineList = document.getElementById("searchwith-selection-engine");
		var serviceId = window.arguments[1];
		var selText = selectionText.value;

        if (swEngineList.selectedCount == 1) {
		    SearchWith.setCVPref("service."+serviceId+".engine", swEngineList.selectedItem.value);
		    SearchWith.setCVPref("engine."+swEngineList.selectedItem.value+".service", serviceId);
        }

		if (serviceId == "url") {
			SearchWith.openBrowserTab(selText, window.arguments[3]); 
		} 
		var swEngine;
		for (var i=0; i<swEngineList.selectedCount; i++) {
			swEngine = new SearchWithEngine(swEngineList.selectedItems[i].value);
			SearchWith.openBrowserTab(swEngine.getLeftUrl() + selText + 
									swEngine.getRightUrl(), window.arguments[3]); 
		}

		if (swEngineList.selectedCount == SearchWith.getEnginesOfService(serviceId).length)
			SearchWith.setBoolPref("service."+serviceId+".selectAll", true);
		else
			SearchWith.setBoolPref("service."+serviceId+".selectAll", false);


		SearchWith.saveSettings();
        return true;
    },
    
    populateEngines: function(swEngineList, serviceId) {
		var swEngines = null;
		if (serviceId == "url") {
			swEngines = SearchWith.getEnginesOfService("");
		} else if (serviceId == "all") {
			swEngines = SearchWith.getEngines();
		} else {
			swEngines = SearchWith.getEnginesOfService(serviceId);
		}
        var currentService = new SearchWithService(serviceId);
        var currentEngine = new SearchWithEngine(currentService.getEngineId());
        var miscEngines = new Array();
        var mi;
        for (engine in swEngines) {
            var thisEngine = new SearchWithEngine(swEngines[engine]);
            if (SearchWith.trim(thisEngine.getName()).length < 1 || 
                SearchWith.trim(swEngines[engine]).length < 1) {
                continue;
            }
            if (SearchWith.trim(thisEngine.getLeftUrl()).length < 1) {
                continue;
            }
			if (swEngines[engine] == currentService.getEngineId()) {
				if (swEngineList.getRowCount() > 0) {
					mi = swEngineList.insertItemAt(0,thisEngine.getName(), swEngines[engine]);
				} else {
					mi = swEngineList.appendItem(thisEngine.getName(), swEngines[engine]);
				}
				swEngineList.selectedItem = mi;
			} else {
				mi = swEngineList.appendItem(thisEngine.getName(), swEngines[engine]);
			}
			mi.setAttribute("class", "listitem-iconic");
			mi.setAttribute("image", thisEngine.getIconPath());
        } 
    },

	includeEngines: function() 
	{
		var moreEnginesString = SearchWith.getPropString("more.engines", "searchwith-strings");
		var engineList = document.getElementById("searchwith-selection-engine");
		window.openDialog('chrome://searchwith/content/searchwithIncludeEngines.xul', moreEnginesString, 
		                  "chrome", this.serviceId, engineList);
	}
	
};

