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

var SearchWithProtoEntry = function(){
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
var _SearchWithProtoHash = function(){
    this.Items = [];
    this.orderIndex = [];
    this.orderIndex[0] = "";
    this.sorted = false;
    
    this._AddEntryObj = function (EntryObj, eId){
        //eId = String(EntryObj.filepath).replace(/[\\\/\.:]/ig, "");
        var tmp = EntryObj.filepath.split(SearchWith.getDelim);
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

var SearchWithConquery = {
    readFile: function(filename) {
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
                this.cqerr('', cqrMess.getString("cqr.err.read.file") + " " + filename +"\n");
                return null;
            }
        }
        catch (er) {
            this.cqerr(er, cqrMess.getString("cqr.err.read.file") + " " + filename +"\n");
        }
        return null;
    },

    cqerr: function(r, msg){
        cqrMess = document.getElementById("searchwith-conquery");
        cqrConsoleService.logStringMessage('SearchWith >> ' + msg + ":\n"+r);
        alert (cqrMess.getString("cqr.err.failed")+msg+"\n"+r);
        //dump("ConQuery >>> failed:" + msg + "\n"+r+"\n");
    },

    plg_QuickLoadAll: function(){
        SearchWithEntryHash.clear();
        lastDirState = this.plg_GetDirState();
        var pluginCount = 0;
        
        for (each in lastDirState) {
            if (each.match(/\.src$/)) {
                //SearchWithEntryHash._AddEntryObj(plg_ReadData(each, false), "");
                //pluginCount++;
            } else if (each.match(/\.xml$/)) {
                SearchWith.importA9Plugin(each);
                pluginCount++;
            }
        }
        SearchWithEntryHash.sort();
        return pluginCount;
    },

    plg_GetDirState: function(){
        var ret_arr = [];
        var plugDirsList = SearchWith.getCVPref("pluginsDirList").split(";");
        for (i in plugDirsList) {
            var pdir = plugDirsList[i];
            if (pdir != '') {
                var dirstate = this.rdir(pdir);
                for (each in dirstate) {
                    ret_arr[each] = dirstate[each];
                }
            }
        }
        return ret_arr;
    },

    rdir: function(dirname){
        var arr = [];
        try{
          var dir = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);
          dir.initWithPath(dirname);
          if (dir.isDirectory()) {
              var items = dir.directoryEntries;
          } else {
              this.cqerr("", cqrMess.getString("cqr.err.read.dir")+"\n" + dirname);
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
    },

    substVars: function(str, EntryObj){
        var retstr = "";
        var cqrSIRe = new RegExp("\\[:(\\w+)(:(\\d*))?\\]", "ig");
        var cqrvars = cqrSIRe.exec(str);
        var lastind = 0;
        if (cqrvars){
          while (cqrvars){
            tmpstr = str.substring(lastind, cqrSIRe.lastIndex);
            
            switch("[:"+cqrvars[1]+"]"){
              case "[:selection]":
                //if (cqrPageSelection == "") cqrShowAlternatives=true;
                retstr += tmpstr.replace("[:selection]", cqrPageSelection);
                break;
              case "[:url]":
                retstr += tmpstr.replace("[:url]", cqrPageURL);
                break;
              case "[:linkurl]":
                retstr += tmpstr.replace("[:linkurl]", cqrLinkURL);
                break;
              case "[:imgurl]":
                retstr += tmpstr.replace("[:imgurl]", cqrImgURL);
                break;
              case "[:imgname]":
                retstr += tmpstr.replace("[:imgname]", cqrImgName);
                break;
              case "[:host]":
                retstr += tmpstr.replace("[:host]", cqrPageHost);
                break;
              case "[:title]":
                retstr += tmpstr.replace("[:title]", cqrPageTitle);
                break;
              case "[:source]":
                retstr += tmpstr.replace("[:source]", cqrPageSource);
                break;
              case "[:text]":
                retstr += tmpstr.replace("[:text]", "");
                break;
              case "[:cliptext]":
                retstr += tmpstr.replace("[:cliptext]", cqrClipboardText);
                break;
              case "[:matched]":
                var matchnum = Number(cqrvars[3]);
                if (isNaN(matchnum)) matchnum = 0;
                if (EntryObj.lastmatch[matchnum]){
                  retstr += tmpstr.replace(cqrvars[0], EntryObj.lastmatch[matchnum]);
                }else{
                  retstr += tmpstr.replace(cqrvars[0], "");
                }
                break;
              case "[:prompt]":
                cqrShowAlternatives=true;
                retstr += tmpstr.replace("[:prompt]", "");
                break;
              //if variable is not recognized
              default:
                retstr += tmpstr;
            }
            
          lastind = cqrSIRe.lastIndex;
          cqrvars = cqrSIRe.exec(str);
          }
          retstr += str.substring(lastind);
        } else {retstr = str}
        return retstr;
    },

    prepareAction: function(entryObj){
        var queryHash = new Object();
        try{
          for (i in entryObj.Inputs){
            queryHash[entryObj.Inputs[i].def.name] = entryObj.Inputs[i].def.value; 
          }
        }catch(er){
            alert(er);
        }
        return queryHash;
    }

}


var SearchWithEntryHash = new _SearchWithProtoHash();

