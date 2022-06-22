import ReferenceEntry from "/apogeejs-app-lib/src/references/ReferenceEntry.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class NpmModuleEntry extends ReferenceEntry {

    constructor(referenceData,instanceToCopy,specialCaseIdValue) {
        super(NpmModuleEntry.FIELD_OBJECT_TYPE,referenceData,instanceToCopy,specialCaseIdValue)
    }

    //note - we should differentiate the requested version (with wildcard entries like ~) and the actual version

    getEntryType() {
        return NpmModuleEntry.REFERENCE_TYPE
    }
    
    getDisplayName() {
        return this.getModuleName() + "@v" + this.getVersion();
    }

    getModuleName() {
        let data = this.getData();
        if(data) return data.name;
        else return null; //shouldn't happen
    }

    getVersion() {
        let data = this.getData();
        if(data) return data.version;
        else return null; //shouldn't happen
    }

    static getReferenceString(data) {
        return data.name + "@v" + data.version;
    }
            
    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {
        throw new Error("Load not implemented!");
    }
    
    /** This method removes the link. This returns a command result for the removed link. */
    removeEntry() {
        throw new Error("Remove not implemented!");
    }

}

NpmModuleEntry.REFERENCE_TYPE = "npm module"
NpmModuleEntry.FIELD_OBJECT_TYPE = "refNpm"


