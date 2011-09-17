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
 
var SearchWithService = function(aServiceId) {
	this.swServices = SearchWith.getServices();	 
	this.serviceId = aServiceId;
};

SearchWithService.prototype = {
	getName: function() 
	{
		var name = "";
		switch (this.serviceId) {
			case "url":
				name = SearchWith.getPropString("address.bar", "searchwith-strings");
				break;

			case "all":
				name = SearchWith.getPropString("all", "searchwith-strings");
				break;

			default:
				name = SearchWith.getCVPref("service."+this.serviceId+".label");
		}

		return name;
	},
	
	getEngineId: function() 
	{
		return SearchWith.getCVPref("service."+this.serviceId+".engine");
	},

	getEngineName: function() 
	{
		var anEngine = new SearchWithEngine(this.getEngineId());
		return anEngine.getName();
	},
		
	isEnabled: function() 
	{
		return (SearchWith.trim(this.getEngineId()).length > 0);
	},
	
	setName: function(aName) 
	{
		SearchWith.setCVPref("service."+this.serviceId+".label", aName);
	},

	setEngineId: function(anEngineId) 
	{
		SearchWith.setCVPref("service."+this.serviceId+".engine", anEngineId);
	},

	countEngines: function() 
	{
		return SearchWith.getEnginesOfService(this.serviceId).length;
	},

	addToList: function() 
	{
		var swServices = SearchWith.getServices();
		for (var i=0; i<swServices.length; i++) {	// exit if already added
			if (swServices[i] == this.serviceId) return;
		}
		swServices.push(this.serviceId);
		SearchWith.setCVPref("service-list", swServices.join(","));
	},

	getEngines: function()
	{
		return SearchWith.getEnginesOfService(this.serviceId);
	},

	addToListbox: function(aListbox, aSelected) 
	{
		var serviceEngine = new SearchWithEngine(this.getEngineId());
		var li = aListbox.appendItem(this.getName(), this.serviceId);
		li.setAttribute("class", "listitem-iconic");
		li.setAttribute("image", serviceEngine.getIconPath());
		if (aSelected) {
			aListbox.selectedItem = li;
		}
		if (!this.isEnabled()) {
			li.disabled = true;
		}
	}
		
};

