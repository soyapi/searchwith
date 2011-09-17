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

var SearchWithOptionsService = {
	serviceName: "",
	serviceId: "",
	engineList: null,
	serviceLabel: null,
	serviceList: null,

	onLoad: function() 
	{
		this.serviceList = window.arguments[0];
		this.serviceId = this.serviceList.selectedItem.value;
		this.serviceName = this.serviceList.selectedItem.label;
		
		this.serviceLabel = document.getElementById("searchwith-prefs-service-label");
		this.serviceLabel.value = this.serviceName;
		
		this.engineList = document.getElementById("searchwith-prefs-new-service-engine");
		this.populateEngines();
	},

	populateEngines: function() {
		this.serviceId = this.serviceList.selectedItem.value;
		var swEngines = SearchWith.getEnginesOfService(this.serviceId);	
		var currentService = new SearchWithService(this.serviceId);
		var currentEngine = new SearchWithEngine(currentService.getEngineId());
		
		for (var i=0; i<swEngines.length; i++) {
			var thisEngine = new SearchWithEngine(swEngines[i]);
			if (SearchWith.trim(thisEngine.getName()).length < 1 || 
					SearchWith.trim(swEngines[i]).length < 1) {
					continue;
			}
			if (SearchWith.trim(thisEngine.getLeftUrl()).length < 1) {
					continue;
			}

			if ((thisEngine.getServiceId() == this.serviceId) || 
					(thisEngine.getServiceId() == "") || 
					(currentService.countEngines() == 0)) {
				if (swEngines[i] == currentService.getEngineId()) {
					thisEngine.addToListbox(this.engineList, true, 1);
				} else {
					thisEngine.addToListbox(this.engineList);
				}
			}
		}
	},
	
	saveEngine: function() 
	{
		if (this.engineList.selectedItem.value.length <1) {
			this.serviceList.selectedItem.disabled = true;
		} else {
			this.serviceList.selectedItem.disabled = false;
		}

		var thisEngine = new SearchWithEngine(this.engineList.selectedItem.value);
		thisEngine.setServiceId(this.serviceId);
		var engineService = new SearchWithService(this.serviceId);
		engineService.setEngineId(this.engineList.selectedItem.value);
	},

	saveName: function() 
	{
		if (this.serviceLabel.value.length >0) {
			SearchWith.setCVPref("service."+this.serviceId+".label", 
			                     this.serviceLabel.value);
			this.serviceList.selectedItem.label = this.serviceLabel.value;
		}
	},

	acceptDialog: function() {
		if (this.serviceLabel.value.length < 1) {
			alert(SearchWith.getPropString("enter.service.name", 
		       							   "searchwith-strings"));
			return false;
		}
		this.saveName();
		this.saveEngine();

		this.serviceList.selectedItem.label = this.serviceLabel.value;

		SearchWith.saveSettings();
		
		return true;
	},

	cancelDialog: function() {
		if (navigator.platform.toLowerCase().search(/^win/) != -1) {
			this.serviceLabel.value = this.serviceName;
			this.serviceList.selectedItem.label = this.serviceName;
		}
		return true;
	},

	includeEngines: function() 
	{
		var moreEnginesString = SearchWith.getPropString("more.engines", "searchwith-strings");
		window.openDialog('chrome://searchwith/content/searchwithIncludeEngines.xul', moreEnginesString, 
		                  "chrome", this.serviceId, this.engineList);
	}

};

