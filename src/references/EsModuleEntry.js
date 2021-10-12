import ReferenceEntry from "/apogeejs-app-lib/src/references/ReferenceEntry.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class EsModuleEntry extends ReferenceEntry {
    
    getDisplayName() {
        return this.getModuleName();
    }

    getModuleName() {
        let data = this.getData();
        if(data) return data.name;
        else return null; //shouldn't happen
    }

    getUrl() {
        let data = this.getData();
        if(data) return data.url;
        else return null; //shouldn't happen
    }

    static getReferenceString(data) {
        return data.url;
    }
            
    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {
        //standard es module import
        let moduleName = this.getModuleName();
        importModule(moduleName,this.getUrl(),false).then(module => {
            addNameToModelModules(moduleName,module);
            onLoad();
        }).catch(onError);
    }
    
    /** This method removes the link. This returns a command result for the removed link. */
    removeEntry() {
        removeModule(this.getModuleName());
        return true;
    }
    
}

EsModuleEntry.REFERENCE_TYPE = "es module";
