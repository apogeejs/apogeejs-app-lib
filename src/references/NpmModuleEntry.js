import ReferenceEntry from "/apogeejs-app-lib/src/references/ReferenceEntry.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class NpmModuleEntry extends ReferenceEntry {
    
    constructor(referenceList,referenceData) {
        super(referenceList,referenceData,NpmModuleEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {

        try {
            let module = require(this.getUrl());
            if((module)&&(module.initApogeeModule)) module.initApogeeModule();
            this.setField("module",module);
            
            //we need to call this asynchronously
            setTimeout(onLoad,0);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            
            //we need to call this asynchronously
            setTImeout(onError(error),0);
        }

    }
    
    /** This method removes the link. */
    removeEntry() {
        //allow for an optional module remove step
        let module = this.getField("module");
        if(module) {
            if(module.removeApogeeModule) module.removeApogeeModule();

            this.clearField("module");
        }
        
        //we aren't really removing it...
        //require.undef(this.url);

        return true;
    }
    
}

NpmModuleEntry.REFERENCE_TYPE = "npm module";

