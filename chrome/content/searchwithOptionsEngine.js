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

var SearchWithOptionsEngine = {
	
	swEngine: null,
	swServiceList: null,
	engineList: null,
	engineId: "",
	engineLabel: null,
	engineLeftURL: null,
	engineRightURL: null,
	engineIconPath: null,
	serviceList: null,
	
	leftUrl: "",
	engineName: "",
	
	onLoad: function() 
	{
		this.engineList = window.arguments[0];
		this.engineName = this.engineList.selectedItem.label;
		this.engineId = this.engineList.selectedItem.getAttribute("value");
		this.swEngine = new SearchWithEngine(this.engineId);
		
		this.engineLabel = document.getElementById("searchwith-prefs-engine-label");
		this.engineLeftURL = document.getElementById("searchwith-prefs-engine-lefturl");
		this.engineRightURL = document.getElementById("searchwith-prefs-engine-righturl");
		this.engineIconPath = document.getElementById("searchwith-prefs-engine-iconpath");
		
		this.engineLabel.value = this.swEngine.getName();
		if (this.engineLabel.value.length<1 && this.engineName.length>0) {
			this.engineLabel.value = this.engineName;
		}

		this.engineLeftURL.value = this.swEngine.getLeftUrl();
		this.engineRightURL.value = this.swEngine.getRightUrl();
		this.engineIconPath.value = this.swEngine.getIconPath();
		
		//var engineIconImg = document.getElementById("searchwith-prefs-engine-iconimg");
		//engineIconImg.src = prefEngineIconPath.value;
		
		this.populateServices();
	},
	
	populateServices: function() {
		var swServices = SearchWith.getServices();	
		this.serviceList = document.getElementById("searchwith-prefs-engine-service");
		
		var mi;
		for (var i=0; i < swServices.length; i++) {
			var thisService = new SearchWithService(swServices[i]);
			mi = this.serviceList.appendItem(thisService.getName(), swServices[i]);
			mi.setAttribute("label", thisService.getName());
			mi.setAttribute("value", swServices[i]);
			if (swServices[i] == this.swEngine.getServiceId()) {
				this.serviceList.selectedItem = mi;
			}
		}
	},
	
	acceptDialog: function() 
	{
		if (this.engineLeftURL.value.length < 1) {
			alert(SearchWith.getPropString("enter.search.address", "searchwith-strings"));
			return false;
		}

		if (SearchWith.trim(this.engineLabel.value).length > 0)
			this.swEngine.setName(this.engineLabel.value);
			
		if (SearchWith.trim(this.engineLeftURL.value).length > 0)	
			this.swEngine.setLeftUrl(this.engineLeftURL.value);
			
		if (SearchWith.trim(this.engineRightURL.value).length > 0)	
			this.swEngine.setRightUrl(this.engineRightURL.value);
			
		if (SearchWith.trim(this.engineIconPath.value).length > 0)	
			this.swEngine.setIconPath(this.engineIconPath.value);
			
		if (SearchWith.trim(this.serviceList.value).length > 0)	
			this.swEngine.setServiceId(this.serviceList.selectedItem.value);

		this.engineList.selectedItem.label = this.engineLabel.value;
		this.engineList.selectedItem.setAttribute("disabled", "false");
		SearchWith.saveSettings();
		return true;
	},
	
	getIconFile: function() 
	{
		var iconPath = SearchWith.browse4File();
		if (iconPath.length>0) {
			iconPath = "file://"+iconPath;
			this.iconPath.value = iconPath;
		}
	}

};

