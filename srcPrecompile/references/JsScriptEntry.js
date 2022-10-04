import ReferenceEntry from "/apogeejs-app-lib/src/references/ReferenceEntry.js";
import {getLinkLoader} from "/apogeejs-app-lib/src/references/LinkLoader.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class JsScriptEntry extends ReferenceEntry {

    constructor(referenceData,instanceToCopy,specialCaseIdValue) {
        super(referenceData,instanceToCopy,specialCaseIdValue)
    }

    getEntryType() {
        return JsScriptEntry.REFERENCE_TYPE
    }

    getDisplayName() {
        let data = this.getData();
        if(data) return data.name
        else return ReferenceEntry.NO_NAME_AVAILABLE;
    }

    getUrl() {
        let data = this.getData();
        if(data) return data.url;
        else return null; //shouldn't happen
    }

    static getReferenceString(data) {
        return data.url;
    }

    preprocessData(data) {
        if(data.name) return data;

        let name = this.urlToDisplayName(data.url);
        let newData = {};
        Object.assign(newData,data);
        newData.name = name;
        return newData;
    }

    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {
        getLinkLoader().addLinkElement("script",this.getUrl(),this.getId(),onLoad,onError);
    }
    
    /** This method removes the link. */
    removeEntry() {
        getLinkLoader().removeLinkElement("script",this.getUrl(),this.getId());
        return true;
    }
}

JsScriptEntry.REFERENCE_TYPE = "js link"


