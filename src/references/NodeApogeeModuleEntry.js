import ReferenceEntry from "/apogeejs-app-lib/src/references/ReferenceEntry.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class NodeApogeeModuleEntry extends ReferenceEntry {
    
    getDisplayName() {
        return this.getModuleName();
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
        return `${data.name}|${data.version}` ;
    }
            
    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {

        let moduleName = this.getModuleName();
        let module = require(this.getModuleName());

        //I insert a delay here because the update commands in onLoad and onError must be sent
        //asynchronously (at least at the time of this comment - but that will probably change)

        let completeLoad = () => {
            if(!module) onError("Apogee module not found: " + moduleName);
            if(!module.default) onError("Format Error: No default export found for apogee module: " + moduleName);
            let moduleObject = module.default;
            if(!moduleObject.initApogeeModule) onError("Format Error: initApogeeModule not found: "  + moduleName);
            
            //install module
            moduleObject.initApogeeModule();

            //store data export
            if(moduleObject.getDataExport) {
                let dataExport = moduleObject.getDataExport();
                addApogeeModuleExport(moduleName,dataExport,false);
            }

            //update reference entry data
            let data = this.getData();
            let newData = {};
            Object.assign(newData,data);
            newData.module = module;
            onLoad(newData);
        }
        setTimeout(completeLoad,0);
    }
    
    /** This method removes the link. This returns a command result for the removed link. */
    removeEntry() {
        let moduleName = this.getModuleName();

        //allow for an optional module remove step
        let moduleObject = this.getField("module");
        if(moduleObject) {
            //try to uninstall module
            try {
                if(moduleObject.removeApogeeModule) moduleObject.removeApogeeModule();
            }
            catch(error) {
                console.log("Error uninstalling module: " + moduleName);
                if(error.stack) console.error(error.stack);
            }

            //remove data export
            if(moduleObject.getDataExport) {
                removeApogeeModuleExport(moduleName);
            }

            //update reference entry data
            let data = this.getData();
            let newData = {};
            Object.load(newData,data);
            delete newData.module;
            this.setField("data",data);
        }

        return true;
    }
}

NodeApogeeModuleEntry.REFERENCE_TYPE = "apogee module";

