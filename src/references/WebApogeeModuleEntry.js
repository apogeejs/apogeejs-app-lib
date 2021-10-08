import ReferenceEntry from "/apogeejs-app-lib/src/references/ReferenceEntry.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class EsModuleEntry extends ReferenceEntry {
    
    getDisplayName() {
        return this.getReferenceStering();
    }

    getReferenceString() {
        return this.getModuleName() + "@v" + this.getModuleVersion();
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
            
    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {
        let localOnLoad = (module) => {
            if(module) {
                if((module.default)&&(module.default.initApogeeModule)) module.default.initApogeeModule();
            
                let data = this.getData();
                let newData = {};
                Object.load(newData,data);
                newData.module = module;
                onLoad(newData);
            }
            else {
                onError("Unknown error: Module not properly loaded. " + this.getUrl());
            }

        }

        //load the module
        import(this.getUrl()).then(localOnLoad).catch(onError);
    }
    
    /** This method removes the link. This returns a command result for the removed link. */
    removeEntry() {
        //allow for an optional module remove step
        let module = this.getField("module");
        if(module) {
            if((module.default)&&(module.default.removeApogeeModule)) module.default.removeApogeeModule();

            let data = this.getData();
            let newData = {};
            Object.load(newData,data);
            delete newData.module;
            this.setField("data",data);
        }

        return true;
    }
    
}

EsModuleEntry.REFERENCE_TYPE = "es module";
