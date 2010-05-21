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
 * The Initial Developer of the Original Code is Vasa Maximov (ConQuery).
 *
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *                  Soyapi Mumba
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
 
//Plugin data holder
var ProtoEntry = function(){
    this.eId =  "";
    this.Title = "";
    this.order = 0;
    this.Action = "";
    this.Method = "";
    this.referrer = "";
    this.opentarget = "";
    this.openwin="";
    this.forcein ="";
    this.Desc =  "";
    //this.Inputs = new Object;
    this.Context = true;
    this.blocked = false;
    this.filepath = "";
    this.iconpath = "";
    this.qcharset = "UTF-8";
    this.showif = "";
    this.sitarget = "[:selection]";
    this.si_compiled = new Object;
    this.lastmatch = [];

    this._Clone = function(){
        var NewObj = new Object();
        for (var oP in this) NewObj[oP]=this[oP];
        return NewObj;
    }
  
    this._StoreInput = function(inp){
        var lst = new Object();
        var inobj = new Object();
        inobj.name = String(inp.name);
        inobj.value = String(inp.value);
        if (inp.label) {inobj.label=inp.label} else {inobj.label=""};
        if (inp.grouptitle) {inobj.grouptitle=inp.grouptitle} else {inobj.grouptitle=""};
        inobj.priority = String(inp.priority);
        var ItemName = inp.name;
        //ItemName = String(inp.priority);
  	
  	if (this.Inputs!=null){
  		if (this.Inputs[ItemName]){
  			if (!this.Inputs[ItemName].list){
  			  this.Inputs[ItemName].list = new Object();
  			  this.Inputs[ItemName].list[this.Inputs[ItemName].def.priority] = this.Inputs[ItemName].def;
  			}
  			this.Inputs[ItemName].list[inp.priority] = inobj;
  		}else{
  			this.Inputs[ItemName] = new Object();
  			this.Inputs[ItemName] = inobj;
  			this.Inputs[ItemName].def = new Object();
  			this.Inputs[ItemName].def = inobj;
  			//this.Inputs[ItemName].list = new Object();
  			//this.Inputs[ItemName].list[inp.priority] = inobj;
  		}
  	}else{
  		this.Inputs = new Object();
  		this.Inputs[ItemName] = new Object();
          this.Inputs[ItemName] = inobj;
  		this.Inputs[ItemName].def = new Object();
  		this.Inputs[ItemName].def = inobj;
  	}
  }
}

//Entries holder:
var _ProtoHash = function(){
    this.Items = [];
    this.orderIndex = [];
    this.orderIndex[0] = "";
    this.sorted = false;
    
    this._AddEntryObj = function (EntryObj, eId){
        //eId = String(EntryObj.filepath).replace(/[\\\/\.:]/ig, "");
        var tmp = EntryObj.filepath.split(cqrdelim);
        //eId = tmp[tmp.length-1].replace(/\./ig, "-");
        eId = tmp.join('_').replace(/\./ig, "-");
        EntryObj.eId = eId;
        this.Items[eId] = EntryObj._Clone();
        // XXXsoyapi prfs_UpdateEntryPrefs(eId);
        this.orderIt(eId);
        // XXXsoyapi prfs_SaveEntry(this.Items[eId]);
        this._Empty = false;
        return eId;
    }
  
    this.orderIt = function(id){
        var itemOrder = parseFloat(this.Items[id].order);
        var itemId = this.Items[id].eId;
    //dump("Incoming plug: " + itemId + " with order=" + itemOrder + "\n");
        if (itemOrder < 1) {
            var movedTo = this.orderIndex.length;
            this.orderIndex[movedTo] = itemId;
            this.Items[itemId].order = movedTo;
            //dump(">>> New SP " + itemId + " landed at index: " + movedTo + "\n");
            return;
        }
        if (this.orderIndex[itemOrder] && this.orderIndex[itemOrder] != itemId){
            occupantId = this.orderIndex[itemOrder];
            movedTo = this.orderIndex.length;
            this.Items[occupantId].order = movedTo;
            this.orderIndex[movedTo] = occupantId;
            prfs_SaveEntry(this.Items[occupantId]);
            this.orderIndex[itemOrder] = itemId;
            //dump(">>> Found occupant: " + occupantId + " at index: " + itemOrder + "\n");
            //dump(">>> " + occupantId + " moved to: " + this.Items[occupantId].order + " owner landed: " + itemId + "\n");

        } else {
            this.orderIndex[itemOrder] = itemId;
            //dump(">>> owner " + itemId + " landed at index: " + itemOrder + "\n");
        }
    }
  
    this._UpdateEntry = function(EntryObj){
        for (each in EntryObj){
            if (each != "Inputs") this.Items[each]=EntryObj[each]
        }
    }
  
    this._Exist = function (KeyName){
        var exst=false;
        if (this.Items[KeyName]) exst=true; 
        return exst;
    }
  
    this._Item = function (KeyName){
        return this.Items[KeyName];
    }
  
    this.rm = function(Key){
        delete this.Items[Key];
    }
  
    this.sort = function(){
        var items = [];
        var tmpArr = [];
        for (each in this.Items) tmpArr.push(this.Items[each]);
        tmpArr.sort(this._Cmp);
        this.clear();
        for (i=0; i<tmpArr.length;i++) this.Items[tmpArr[i].eId] = tmpArr[i];
        this.sorted = true;
    }

    this._Items = function(){
        return this.Items;
    }

    this.mainSet = function(limit){
        var retItems = [];
        if (limit == 0) return retItems;
        var i=0;
        for (each in this.Items){
            if (i >= limit) break;
            if (this.Items[each].Context == true && this.Items[each].blocked == false){
                retItems[each] = this.Items[each];
                i++;
            }
        }
        return retItems;
    }

    this.conquerySet = function(limit){
        var retItems = [];
        var i=0;
        for (each in this.Items){
            if (this.Items[each].Context == true && this.Items[each].blocked == false){
                if (i >= limit) retItems[each] = this.Items[each];
                i++;
            }
        }
        return retItems;
    }

    this.showifSet = function(){
        var retItems = [];
        for (each in this.Items){
            if (this.Items[each].showif && this.Items[each].Context == false && this.Items[each].blocked == false){
                retItems[each] = this.Items[each];
            }
        }
        return retItems;
    }

    this._Cmp = function(a, b){
        return a.order - b.order;
    }

    this.clear = function(){
        this.Items = [];
        this.orderIndex[0] = "";
        this._Empty = true;
    }
}

 /////// END classes ////////
////////////////////////////


 ////////////////////////////
//////// Globals ///////////

//Active Entries holder
var EntryHash = new _ProtoHash();

var QueryHash = new Object();
var curDirState = new Object();
var lastDirState = new Object();
var cqrShowAlternatives = false;
var cqrcancel = false;

var cqrParamsRE = new RegExp('\\w+\\s*?=\\s*?".*?"',"ig");
var cqrSIRe = new RegExp("\\[:(\\w+)(:(\\d*))?\\]", "ig");

if (SearchWith.getHostApp() == "Thunderbird") {
    var cqrMailFlag = true;
} else {
    var cqrMailFlag = false;
}

var cqr_platform = new String(navigator.platform);
if(cqr_platform.search(/^Win/)) {
    if(cqr_platform.search(/^Mac/)) {
        var cqrdelim = "/";
    } else {
        var cqrdelim = ":";
    }
} else {
    var cqrdelim = "\\";
}
//var cqrMess = srGetStrBundle("chrome://searchwith/locale/conquery.properties");
var cqrMess = null; //document.getElementById("searchwith-conquery");

/// Prefs globals ///

var cqrPrefs = Components.classes["@mozilla.org/preferences-service;1"].
  getService(Components.interfaces.nsIPrefService).getBranch("conquery.");
var cqrNavigatorPrefs = Components.classes["@mozilla.org/preferences-service;1"].
  getService(Components.interfaces.nsIPrefService);
const cqrConsoleService = Components.classes['@mozilla.org/consoleservice;1'].
  getService(Components.interfaces.nsIConsoleService);

var cqrPlugsDir = "";
var cqrPlugsDir2 = "";
var cqrPlugsDir3 = "";
var cqrUseHotMenu = false;
var cqrHTTPIcon = true;
var cqrOpenRes = "";
var cqrHideFromTools = false;
var cqrShowCSPInMainMenu = false;
var cqrHideQueryTo = false;
var cqrMainContextLimit = 3;
var cqrNavigatorDefaultCharset = "";

var cqrUseCtrlForHM = "";
var cqrUseMiddleClickForHM = "";
var cqrMiddleClickDelayms = "";
var cqrMiddleClickHidems = "";
prfs_LoadMain();


function cqerr(r, msg){
  cqrConsoleService.logStringMessage('SearchWith >> ' + msg + ":\n"+r);
  alert (cqrMess.getString("cqr.err.failed")+msg+"\n"+r);
  //dump("ConQuery >>> failed:" + msg + "\n"+r+"\n");
}

function myDump(aMessage) {
  //Thanks to:
  //http://kb.mozillazine.org/JavaScript_Console#Logging_custom_messages_in_JavaScript_Console
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                       .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage("SearchWith: " + aMessage);
}

function SearchWith_plg_QuickLoadAll(){
    EntryHash.clear();
    lastDirState = plg_GetDirState();
	var pluginCount = 0;
    
    //for (each in lastDirState) EntryHash._AddEntryObj(plg_quickread(each), "");
    for (each in lastDirState) {
        if (each.match(/\.src$/)) {
            EntryHash._AddEntryObj(plg_ReadData(each, false), "");
			pluginCount++;
        } else if (each.match(/\.xml$/)) {
			SearchWith.importA9Plugin(each);
			pluginCount++;
        }
    }
    EntryHash.sort();
	return pluginCount;
}

function plg_ReadData(filepath, omit_inputs){
	
    var retItem = new ProtoEntry();
	var filedata = cqReadFile(filepath);
    var p_plgname = filepath.split(cqrdelim);
    
    RegExp.multiline = true; // Thanks to Thomas de Grenier de Latour for this patch
                             //http://bugzilla.mozdev.org/show_bug.cgi?id=10316
	filedata = filedata.replace(/^\s*#.*/ig,"");
	filedata = filedata.replace(/[\n\r\f\t]/ig,"  ");
    RegExp.multiline = false;

	var SearchTagData = "";
	var mcSearch = new Array;

	SearchTagData = filedata.match(/<search.+?<\/search>/gi);
	mcSearch = plg_GetTags("search", SearchTagData);
	//mcSearch = plg_GetTags("search", filedata);
	if (mcSearch[0]){
		retItem.Title = mcSearch[0].name || p_plgname[p_plgname.length-1]+": "+cqrMess.getString('cqr.err.parse');
		retItem.Action = mcSearch[0].action || "http://conquery.mozdev.org/pluginsdocs.html";
		retItem.Desc = mcSearch[0].description || "";
        retItem.referrer = mcSearch[0].referrer || "";
        retItem.opentarget = mcSearch[0].opentarget || "";
        retItem.openwin = mcSearch[0].openwin || "";
        retItem.forcein = mcSearch[0].forcein || "";
		//XXX: Leo's malformed plugins special patch:
		    
		    if (p_plgname[p_plgname.length-1] == "leo.src") {
	            //because of two "name" params defined:
	            retItem.Title = "Leo Eng<->Ger";
	            //because of malformed action:
	            retItem.Action = "http://dict.leo.org/";
	            retItem.Desc = cqrMess.getString('cqr.err.leo') + retItem.Desc;
                alert(p_plgname[p_plgname.length-1]+": "+retItem.Desc);
                
		    } else if (p_plgname[p_plgname.length-1] == "leofrn.src"){
	            //because of two name params defined:
	            retItem.Title = "Leo Frn<->Amd";
	            //because of malformed action:
	            retItem.Action = "http://dico.leo.org/";
	            retItem.Desc = cqrMess.getString('cqr.err.leo') + retItem.Desc;
                alert(p_plgname[p_plgname.length-1]+": "+retItem.Desc);
		    }
		//EOf leo patch
		retItem.Method = mcSearch[0].method || "GET";
		retItem.qcharset = mcSearch[0].querycharset || "UTF-8";
		retItem.showif = mcSearch[0].showif || ""; 
		if (retItem.showif) {
		    re = new RegExp(retItem.showif, "ig");
		    retItem.si_compiled = re;
		}
		retItem.sitarget = mcSearch[0].showiftarget || "[:selection]";
		if (!omit_inputs) {
            var inp = plg_GetTags("input", SearchTagData);
            for (each in inp) retItem._StoreInput(inp[each]);
        }
        retItem.eId = "";
		retItem.filepath = filepath;
		retItem.iconpath = getPlugIcon(filepath);
		retItem.Context = true;
	}else{
	  	retItem.eId = "";
	  	retItem.Title = p_plgname[p_plgname.length-1]+": "+cqrMess.getString('cqr.err.parse');
	  	retItem.Method = "GET";
	  	retItem.Desc = filepath;
	  	retItem.Context = false;
	  	retItem.FilePath = filepath;
	}
    return retItem;	
}

function plg_GetTags(tag, str){
	//This extracts all <tag param="val< - > ue"> patterns from str
	var TagsData = [];
	var TagsBuff = [];
	var cqrTagsRE = new RegExp('<'+tag+'\\s.+?>(?=[^"<]+?<|$)', "ig");
    
	while (TagsBuff!=null){
        TagsBuff = cqrTagsRE.exec(str);
        if (TagsBuff!=null){
            TagsData[TagsData.length]=plg_TagParams(TagsBuff[0]);
            TagsData[TagsData.length-1].priority = cqrTagsRE.lastIndex;
        }
	}
    return TagsData;
}

function plg_TagParams(tag){
  var Params = new Object;
  var ParamsBuff = "  ";
  var ParamsData = [];
  //To correct Mycroft's "user" in <input>.
  tag = String(tag).replace(/\s+?user(="")*(?=\s*[\/>])/i, ' value="[:selection]"');
  Params["value"]= cqrMess.getString('cqr.err.parse');
  ParamsBuff = cqrParamsRE.exec(tag);
  while (ParamsBuff!=null){
		if (ParamsBuff!=null){
			var ParamsArr = String(ParamsBuff[0]).split(/=\s*"/);
			ParamsArr[1] = ParamsArr[1].replace(/^\s+/, "");
			Params[String(ParamsArr[0].replace(/\s+/,"")).toLowerCase()] = ParamsArr[1].replace(/"\s*/, "");
			ParamsBuff = cqrParamsRE.exec(tag);
		}
	}
return Params;
}

function plg_GetDirState(){
    var ret_arr = [];
    var plugDirsList = SearchWith.getCVPref("pluginsDirList").split(";"); //[cqrPlugsDir, cqrPlugsDir2, cqrPlugsDir3];
    for (i in plugDirsList) {
        var pdir = plugDirsList[i];
        if (pdir != '') {
            var dirstate = rdir(pdir);
            for (each in dirstate) {
                ret_arr[each] = dirstate[each];
            }
        }
    }
    return ret_arr;
}

function rdir(dirname){
var arr = [];
try{
  var dir = Components.classes["@mozilla.org/file/local;1"].
             createInstance(Components.interfaces.nsILocalFile);
  dir.initWithPath(dirname);
  if (dir.isDirectory()) {
      var items = dir.directoryEntries;
  } else {
      cqerr("", cqrMess.getString("cqr.err.read.dir")+"\n" + dirname);
      return arr;
  }

  items.QueryInterface(Components.interfaces.nsISimpleEnumerator);
  while (items.hasMoreElements()) {
    var i = items.getNext();
    i.QueryInterface(Components.interfaces.nsIFile);
    if (!i.isDirectory()){
      var fn = i.leafName;
      var fx = fn.substr(fn.length - 4, fn.length).toLowerCase();
      if ((fx == ".cqr")||(fx == ".xml")||(fx == ".src")) arr[i.path] = i.lastModifiedTime;
    }
  }
}catch(err){}
return arr;
}

function cqReadFile(filename) {
    var MODE_RDONLY = 0x01;
    var PERM_IRUSR = 00400;
    
    try {
        var file = Components.classes["@mozilla.org/file/local;1"].
                   createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filename);
        if (file.exists() && file.isReadable()) {
            var is = Components.classes["@mozilla.org/network/file-input-stream;1"].
                     createInstance(Components.interfaces.nsIFileInputStream);
            is.init(file, MODE_RDONLY, PERM_IRUSR, 0);
            var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].
                createInstance(Components.interfaces.nsIScriptableInputStream);
            sis.init(is);
            var data = sis.read(sis.available());
            sis.close();
            is.close();
            //return data;
            //thanks to Kuang-che Wu for UTF patch, found here:
            //http://www.csie.ntu.edu.tw/~r92030/project/patches.html
            try{
                var uc = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
                uc.charset = "UTF-8";
                return uc.ConvertToUnicode(data);
            }catch(er){
                return data;
            }
        }
        else {
            cqerr('', cqrMess.getString("cqr.err.read.file") + " " + filename +"\n");
            return null;
        }
    }
    catch (er) {
        cqerr(er, cqrMess.getString("cqr.err.read.file") + " " + filename +"\n");
    }
    return null;
}

function GetMycroftDir(){
	var gDirServiceProp = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var gChromeDir      = gDirServiceProp.get("AChrom",Components.interfaces.nsIFile);
	var patharr = gChromeDir.path.split(cqrdelim);
	patharr[patharr.length-1]="searchplugins";
	return patharr.join(cqrdelim);
}

function cqrGetProfilePluginsDir(){
var ret = '';
try {
var cqrProfileDir = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
ret = cqrProfileDir.path + cqrdelim + 'searchplugins';
} catch(err) {ret = ''}
return ret;
}

function srcDirChanged() {
  var rval = false;
  var lastcnt = 0;
  var curcnt = 0;
  
  for (each in lastDirState) { lastcnt+=1 }
  for (each in curDirState) { curcnt+=1 }

  if (lastcnt != curcnt) {
    rval = true;
  } else {
    for (each in lastDirState) {
      if (curDirState[each] != lastDirState[each]) { 
        rval = true;
        break;
      }
    }
  }
  curDirState = lastDirState;
  //rval = true;
  return rval;
}

function prfs_LoadMain(){
    //var intlPref = cqrNavigatorPrefs.readUserPrefs(null, null);
    //.getBranch(null);
    //if (intlPref.prefHasUserValue("charset.default")) {
        //cqrNavigatorDefaultCharset = cqrNavigatorPrefs.getCharPref("intl.charsetmenu.browser.static");
        //cqrNavigatorDefaultCharset = intlPref.getCharPref("intl.charsetmenu.browser.static");
    //} else {
    //    cqrNavigatorDefaultCharset = "UTF-8";
    //}
     
    cqrPlugsDir = prfs_ReadItem("Main.PlugsDir");
    cqrPlugsDir2 = prfs_ReadItem("Main.PlugsDir2");
    cqrUseHotMenu = prfs_ReadItem("Main.UseHotMenu");
    cqrUseCtrlForHM = prfs_ReadItem("Main.UseCtrlForHM")||false;
    cqrUseMiddleClickForHM = prfs_ReadItem("Main.UseMiddleClickForHM")||false;
    cqrMiddleClickDelayms = prfs_ReadItem("Main.MiddleClickDelayms")||0;
    cqrMiddleClickHidems = prfs_ReadItem("Main.MiddleClickHidems")||0;
        
    cqrHTTPIcon = prfs_ReadItem("Main.HTTPIcon");
    cqrOpenRes = prfs_ReadItem("Main.OpenResults");
    cqrHideFromTools = prfs_ReadItem("Main.HideFromTools")||false;
    cqrShowCSPInMainMenu = prfs_ReadItem("Main.ShowCSPInMainMenu")||false;
    cqrHideQueryTo = prfs_ReadItem("Main.cqrHideQueryTo")||false;
    cqrMainContextLimit = prfs_ReadItem("Main.MainContextLimit")||0;
    
    if (!cqrPlugsDir) cqrPlugsDir = GetMycroftDir();
    if (!cqrPlugsDir2) cqrPlugsDir2 = cqrGetProfilePluginsDir();
    if (cqrOpenRes == "") {cqrOpenRes = "tab_bg"};
}

function prfs_SaveMain(){
    cqrPlugsDir = document.getElementById("prfs_plugsdir").value;
    cqrPlugsDir2 = document.getElementById("prfs_plugsdir2").value;
    // Hot menu section
    cqrUseHotMenu = document.getElementById("enhotmenu").checked;
    cqrUseCtrlForHM = document.getElementById('ctrlshift').selected;
    cqrUseMiddleClickForHM = document.getElementById('middleclick').selected;
    cqrMiddleClickDelayms = document.getElementById('MCDelayOn_tb').value;
    cqrMiddleClickHidems = document.getElementById('MCDelayOff_tb').value;
    // HM section end
    cqrHTTPIcon = document.getElementById("HTTPIcon").checked;
    cqrOpenRes = document.getElementById("open_res").selectedItem.id;
    cqrHideFromTools = document.getElementById('hidefromtools').checked;
    cqrShowCSPInMainMenu = document.getElementById('cspInMainMenu').checked;
    cqrHideQueryTo = document.getElementById('cqrHideQueryTo').checked;
    cqrMainContextLimit = document.getElementById('MainContextLimit').value;

    cqrPrefs.setCharPref("Main.PlugsDir", cqrPlugsDir);
    cqrPrefs.setCharPref("Main.PlugsDir2", cqrPlugsDir2);
    cqrPrefs.setBoolPref("Main.UseHotMenu", cqrUseHotMenu);
    cqrPrefs.setBoolPref("Main.UseMiddleClickForHM", cqrUseMiddleClickForHM);
    cqrPrefs.setBoolPref("Main.UseCtrlForHM", cqrUseCtrlForHM);
    cqrPrefs.setIntPref("Main.MiddleClickDelayms", cqrMiddleClickDelayms);
    cqrPrefs.setIntPref("Main.MiddleClickHidems", cqrMiddleClickHidems);
    cqrPrefs.setBoolPref("Main.HTTPIcon", cqrHTTPIcon);
    cqrPrefs.setCharPref("Main.OpenResults", cqrOpenRes);
    cqrPrefs.setBoolPref("Main.HideFromTools", cqrHideFromTools);
    cqrPrefs.setBoolPref("Main.ShowCSPInMainMenu", cqrShowCSPInMainMenu);
    cqrPrefs.setBoolPref("Main.cqrHideQueryTo", cqrHideQueryTo);
    cqrPrefs.setIntPref("Main.MainContextLimit", cqrMainContextLimit);

    prfs_SaveEntries();
}

function prfs_UpdateEntries(){
  for (each in EntryHash.Items) prfs_UpdateEntryPrefs(each);
  EntryHash.sort();
}

function prfs_UpdateEntryPrefs(id){
  if (EntryHash.Items[id]){
    EntryHash.Items[id].blocked = prfs_ReadItem("Entries."+id+".blocked");
    var cntx = new Boolean;
    cntx = prfs_ReadItem("Entries."+id+".Context");
    if (String(cntx) != ""){
      EntryHash.Items[id].Context = cntx;
    }else{
      EntryHash.Items[id].Context = true;
    }
    EntryHash.Items[id].order = prfs_ReadItem("Entries."+id+".Order")||0;
  }
}

function prfs_SaveEntries(){
  cqrPrefs.deleteBranch("Entries.");
  for (e in EntryHash.Items) prfs_SaveEntry(EntryHash.Items[e]);
}

function prfs_SaveEntry(entry){
  cqrPrefs.setCharPref("Entries."+entry.eId+".eId", entry.eId);
  cqrPrefs.setCharPref("Entries."+entry.eId+".Title", entry.Title);
  cqrPrefs.setCharPref("Entries."+entry.eId+".Order", entry.order);
  cqrPrefs.setCharPref("Entries."+entry.eId+".filepath", entry.filepath);
  cqrPrefs.setBoolPref("Entries."+entry.eId+".Context", entry.Context);
  cqrPrefs.setBoolPref("Entries."+entry.eId+".blocked", entry.blocked);
}

function prfs_ReadItem(name){
	if (cqrPrefs.prefHasUserValue(name)) {
        var type = cqrPrefs.getPrefType(name);
        if (type & 128) {
            return cqrPrefs.getBoolPref(name);
        } else if (type & 64) {
            return cqrPrefs.getIntPref(name);
        } else if (type & 32) {
            return cqrPrefs.getCharPref(name);
        } else {
            return "";
        }
	} else {
	    //Good features must be turned on by default :))
	    if ((name == "Main.HTTPIcon") || (name == "Main.LoadTabsInBg")){
	        return true;
	    } else {
	        return "";
	    }
	}
}

function getPlugIcon(plugpath){
    var icon_gif = plugpath.substr(0, plugpath.length -4) + ".gif";
    var icon_png = plugpath.substr(0, plugpath.length -4) + ".png";
    
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    
    file.initWithPath(icon_gif);
    if (file.exists()) {
        return icon_gif;
    } else {
        file.initWithPath(icon_png);
        if (file.exists()) {
            return icon_png;
        } else {
            return "";
        }
    }
}

function exploreobj(obj){
  for (each in obj) {
    //info += each + ' >>> ' + obj[each] + '\n';
    info += each + '\n';
    a = '' + obj[each];
    if (a.substring(0,8) != 'function'){
    cqerr(each + ' >>> ' + a)
    }
    //a = obj[each];
    //  for (i  in  a){
    //    show(i + " >>> " + a[i]);
    //  }
    }
    //cqerr(info, 'Object ctructure:');
}

function show(data){
    dump(data + "\n");
}

function cqrAbsURI(base, url) 
{
  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);
  var baseURI  = ioService.newURI(base, null, null);
  return ioService.newURI(baseURI.resolve(url), null, null).spec;
}

function cqrGetClipboardText(){
// many thanks to XUL planet! :)
// http://xulplanet.com/tutorials/xultu/clipboard.html
try{
    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].
        getService(Components.interfaces.nsIClipboard);
    if (!clip) return false;

    var trans = Components.classes["@mozilla.org/widget/transferable;1"].
        createInstance(Components.interfaces.nsITransferable);
    if (!trans) return false;
    trans.addDataFlavor("text/unicode");
    clip.getData(trans,clip.kGlobalClipboard);
    var str = new Object();
    var strLength = new Object();

    trans.getTransferData("text/unicode",str,strLength);
    if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
    if (str) pastetext = str.data.substring(0,strLength.value / 2);
    if (pastetext) return pastetext;
    else return false;
}catch(er){return false;}
}


function cqrGetBrowserForWindow(win) {  
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].
        getService(Components.interfaces.nsIWindowMediator);
    var enumerator = windowManager.getEnumerator(null);
    while (enumerator.hasMoreElements()) {
        newBrowser = enumerator.getNext().getBrowser();
        newWin = newBrowser.contentWindow;
        var cntTabs = newBrowser.mTabContainer.childNodes.length;
        for (i=0;i<cntTabs;i++){
            nextTab = newBrowser.mTabContainer.childNodes[i];
            newTabBr = newBrowser.getBrowserForTab(nextTab);
            if (newTabBr.contentWindow == win) return newTabBr; 
        }
    }
    return null;
}

function getFNameFromURI(uri){
    var arr = uri.split("/");
    return arr[arr.length - 1];
    }

function url2host(url){
    var re = new RegExp("^http://([^/]*)","ig");
    retmp = re.exec(url);
    if (retmp) {
        return retmp[0];
    } else {
        return "";
    }
}


////// Borrowed from browser.js /////

var gWebPanelURI;
function openWebPanel(aTitle, aURI)
{
    // Ensure that the web panels sidebar is open.
    tst = toggleSidebar('viewWebPanelsSidebar', true);
    if (!tst) return false;

    // Set the title of the panel.
    document.getElementById("sidebar-title").value = aTitle;

    // Tell the Web Panels sidebar to load the bookmark.
    var sidebar = document.getElementById("sidebar");
    if (sidebar.docShell && sidebar.contentDocument && sidebar.contentDocument.getElementById('web-panels-browser')) {
        sidebar.contentWindow.loadWebPanel(aURI);
        if (gWebPanelURI) {
            gWebPanelURI = "";
            sidebar.removeEventListener("load", asyncOpenWebPanel, true);
        }
    }
    else {
        // The panel is still being constructed.  Attach an onload handler.
        if (!gWebPanelURI)
            sidebar.addEventListener("load", asyncOpenWebPanel, true);
        gWebPanelURI = aURI;
    }
    return true;
}



// |forceOpen| is a bool that indicates that the sidebar should be forced open.  In other words
// the toggle won't be allowed to close the sidebar.
function toggleSidebar(aCommandID, forceOpen) {
  var sidebarBox = document.getElementById("sidebar-box");
  if (!aCommandID)
    aCommandID = sidebarBox.getAttribute("sidebarcommand");

  var elt = document.getElementById(aCommandID);
  if (!elt) return false;   //This is Mozilla Suite or NS7 with very complex sidebars. Giving up...
  var sidebar = document.getElementById("sidebar");
  var sidebarTitle = document.getElementById("sidebar-title");
  var sidebarSplitter = document.getElementById("sidebar-splitter");

  if (!forceOpen && elt.getAttribute("checked") == "true") {
    elt.removeAttribute("checked");
    sidebarBox.setAttribute("sidebarcommand", "");
    sidebarTitle.setAttribute("value", "");
    sidebarBox.hidden = true;
    sidebarSplitter.hidden = true;
    content.focus();
    return true;
  }

  var elts = document.getElementsByAttribute("group", "sidebar");
  for (var i = 0; i < elts.length; ++i)
    elts[i].removeAttribute("checked");

  elt.setAttribute("checked", "true");;

  if (sidebarBox.hidden) {
    sidebarBox.hidden = false;
    sidebarSplitter.hidden = false;
  }

  var url = elt.getAttribute("sidebarurl");
  var title = elt.getAttribute("sidebartitle");
  if (!title)
    title = elt.getAttribute("label");
  sidebar.setAttribute("src", url);
  sidebarBox.setAttribute("src", url);
  sidebarBox.setAttribute("sidebarcommand", elt.id);
  sidebarTitle.setAttribute("value", title);
  if (aCommandID != "viewWebPanelsSidebar") { // no searchbox there
    // if the sidebar we want is already constructed, focus the searchbox
    if ((aCommandID == "viewBookmarksSidebar" && sidebar.contentDocument.getElementById("bookmarksPanel"))
    || (aCommandID == "viewHistorySidebar" && sidebar.contentDocument.getElementById("history-panel")))
      sidebar.contentDocument.getElementById("search-box").focus();
    // otherwiese, attach an onload handler
    else
      sidebar.addEventListener("load", asyncFocusSearchBox, true);
  }
  return true;
}

function cqrExploreDir(start){
  var items = cqReadDir(start);
  items.QueryInterface(Components.interfaces.nsISimpleEnumerator);
  while (items.hasMoreElements()) {
    var i = items.getNext();
    i.QueryInterface(Components.interfaces.nsIFile);
    if (i.isDirectory()){
      exploredir(start+delim+i.leafName);
    }else{
      var fn = i.leafName;
      var fx = fn.substr(fn.length - 4, fn.length);
      if (fx == "."+PlugExt) AllFiles[AllFiles.length] = start+delim+i.leafName;
    }
  }

}

function cqReadDir(dirname) {
    var dir = Components.classes["@mozilla.org/file/local;1"].
               createInstance(Components.interfaces.nsILocalFile);
    dir.initWithPath(dirname);
    if (dir.isDirectory()) {
        return dir.directoryEntries;
    } else {
        cqerr("", cqrMess.getString("cqr.err.read.dir")+"\n" + dirname);
        return null;
    }
}


////
