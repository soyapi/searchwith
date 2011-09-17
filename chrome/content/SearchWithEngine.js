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

var SearchWithEngine = function(anEngineId) {
    this.engineId = anEngineId;
};
SearchWithEngine.prototype = {    
    getName: function() 
    {
		var engineName = SearchWith.getCVPref("engine."+this.engineId+".name");
		if (SearchWith.trim(name).length < 1)
			return this.engineId;
		  
		return engineName;
    },
    
    getLeftUrl: function() 
    {
		return SearchWith.getCVPref("engine."+this.engineId+".lefturl");
    },
    
    getRightUrl: function() 
    {
		return SearchWith.getCVPref("engine."+this.engineId+".righturl");
    },
    
    getIconPath: function() 
    {
        var iconPath = "";
		iconPath = SearchWith.getCVPref("engine."+this.engineId+".iconpath");
		if (SearchWith.trim(iconPath).length < 1) {
			var urlParts = this.getLeftUrl().split("/");
			if (urlParts[0] && urlParts[2]) {
				iconPath = urlParts[0]+"//"+urlParts[2]+"/favicon.ico";	
			}
		}
		return iconPath;
    },    
    
    getServiceId: function() 
    {
        return SearchWith.getCVPref("engine."+this.engineId+".service");
    },
    
    setName: function(aName) 
    {
		SearchWith.setCVPref("engine."+this.engineId+".name", aName);
    },
    
    setLeftUrl: function(aLeftUrl) 
    {
		SearchWith.setCVPref("engine."+this.engineId+".lefturl", aLeftUrl);
    },   
    
    setRightUrl: function(aRightUrl) 
    {
		SearchWith.setCVPref("engine."+this.engineId+".righturl", aRightUrl);
    },
    
    setIconPath: function(anIconPath) 
    {
		SearchWith.setCVPref("engine."+this.engineId+".iconpath", anIconPath);
    },
    
    addToList: function() 
    {
        var swEngines = SearchWith.getEngines();
        for (var i=0; i<swEngines.length; i++) {
            if (swEngines[i] == this.engineId) return;
        }

        swEngines.push(this.engineId);
		SearchWith.setCVPref("engine-list", swEngines.join(","));
    },
	
	removeFromList: function()
	{
		var swEngines = SearchWith.getEngines();
        var arr = new Array();
        for (var i=0; i<swEngines.length; i++) {
            if (swEngines[i] != this.engineId) {
                arr.push(swEngines[i]);
            }
        }
        SearchWith.setCVPref("engine-list", arr.join(","));
	},
    
    isEnabled: function() 
    {
        return (SearchWith.trim(this.getLeftUrl()).length > 0);
    },
	
    setServiceId: function(aServiceId) 
    {
		SearchWith.setCVPref("engine."+this.engineId+".service", aServiceId);
    },

	addToListbox: function(aListbox, aSelected, aPosition) 
	{
		var li = null;
		if (aPosition && aListbox.getRowCount() > aPosition) {
			li = aListbox.insertItemAt(aPosition, this.getName(), this.engineId);
		} else {
			li = aListbox.appendItem(this.getName(), this.engineId);
		}
		li.setAttribute("class", "listitem-iconic");
		li.setAttribute("image", this.getIconPath());
		if (aSelected) {
			aListbox.selectedItem = li;
		}
		if (!this.isEnabled()) {
			li.disabled = true;
		}
	},

	addToMenu: function(aPopup, aSelected) {
		var aMenuItem = null;
        aMenuItem = document.createElement("menuitem");
        aMenuItem.setAttribute("id", "sw-"+this.engineId);
        aMenuItem.setAttribute("label", this.getName());
		aMenuItem.setAttribute("class", "menuitem-iconic");
		aMenuItem.setAttribute("image", this.getIconPath());

		aPopup.appendChild(aMenuItem)
		if (aSelected) {
			document.getElementById("sw-disable-service").removeAttribute("selected");
			aMenuItem.setAttribute("selected", true);
		}

	}

};

