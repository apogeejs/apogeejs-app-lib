import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";

/** This class manages references for the web page.*/
export default class ReferenceEntry extends FieldObject {
    
    /** The reference data is a json entry with the referenceType, url and optionally nickname.
     * If this is a copy, the reference data wil be ignored and can be set to null. */
    constructor(fieldObjectType,referenceData,instanceToCopy,specialCaseIdValue) {
        super(fieldObjectType,instanceToCopy,specialCaseIdValue)

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            if(!referenceData.nickname) {
                //assigne a nickname if there isnot one
                referenceData = this.preprocessData(referenceData);
            }

            //allow for back compatibility - when data was not a chidl object of the reference data
            let data = referenceData.data ? referenceData.data : referenceData;
            this.setField("data",data);

            //we create in a pending state because the link is not loaded.
            this.setField("state",apogeeutil.STATE_PENDING);
            this.setField("stateMsg",PENDING_STATE_MSG);
        }  
    }

    //-------------------------------
    // Workspace object interface
    //-------------------------------

    getWorkspaceObjectType() {
        return "ReferenceEntry"
    }

    getState() {
        return this.getField("state");
    }

    getStateMessage() {
        return this.getField("stateMsg");
    }

    //---------------------------
    // references entry interface
    //---------------------------

    getData() {
        return this.getField("data");
    }

    ///////////////////////////////////////////////////////////////////////////

    /** This method loads the link onto the page. If passed, the onLoadComplete
     * callback will be called when load completes successfully or fails. */
    loadEntry(workspaceManager) {

        let entryLoadPromise = new Promise( (resolve,reject) => {

            //create load event handlers
            //on completion execute a command to update the link status
            let onLoad = (updatedData) => {
                let commandData = {
                    type: "linkLoaded",
                    id: this.getId(),
                    success: true
                };
                if(updatedData != undefined) {
                    commandData.data = updatedData;
                }

                workspaceManager.getApp().executeCommand(commandData);
                //call resolve in any case
                resolve();
            };
            let onError = (error) => {
                //for osme on loads we get an event object with no error info
                //convert this to a string
                if(error instanceof Event) {
                    error = "Link load unsuccessful";
                }

                let commandData = {
                    type: "linkLoaded",
                    id: this.getId(),
                    success: false,
                    error: error
                };
                workspaceManager.getApp().executeCommand(commandData);
                //call resolve in any case
                resolve();
            }

            this.implementationLoadEntry(onLoad,onError,workspaceManager);
        });

        return entryLoadPromise;
    }

    /** This method gets the reference string for this instance. */
    getInstanceReferenceString() {
        return this.constructor.getReferenceString(this.getData());
    }

    /** This is the display name for the entry. */
    //getName();

    /** This method loads the link onto the page. It should call the 
     * appropriate callback on completion. */
    //implementationLoadEntry(onLoad,onError);
    
    /** This method removes the reference. It returns true if the link remove is successful. */
    //remove()

    /** This is the string that uniquely identifies the asset within the given reference type (such as the URI). */
    //static getReferenceString(data);
    
    
    ///////////////////////////////////////////////////////////////////////////

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    toJson() {
        var entryJson = {};
        entryJson.entryType = this.getEntryType();
        entryJson.data = {};
        Object.assign(entryJson.data,this.getData());
        return entryJson;
    }

    //-------------------------
    // Entry specific management methods
    //-------------------------

    /** This method removes and reloads the link, returning a promise. */
    updateData(workspaceManager,data) {
        let promise;

        //this does any processing for the data, if needed (such as creating a display name if needed)
        data = this.preprocessData(data);

        let referenceStringChange = (this.getInstanceReferenceString() != this.constructor.getReferenceString(data));

        //replace the link if the reference string changes
        if(referenceStringChange) {
            this.removeEntry();
        }

        //save data
        this.setField("data",data);

        //replace the link if the reference string changes
        if(referenceStringChange) {          
            promise = this.loadEntry(workspaceManager);
        }

        return promise;
    }

    /** This method will modify the data, if needed. An entry implementation should override this if needed. */
    preprocessData(data) {
        return data;
    }

    //===================================
    // private methods
    //===================================

    setClearState() {
        this.setState(apogeeutil.STATE_NORMAL);
    }

    setError(errorMsg) {
        this.setState(apogeeutil.STATE_ERROR,errorMsg);
    }

    setPendingState() {
        this.setState(apogeeutil.STATE_PENDING,PENDING_STATE_MSG);
    }

    setState(state,msg) {
        let currentState = this.getField("state");
        let currentMessage = this.getField("stateMsg");
        if(currentState != state) {
            //for now we are not tracking msg. If we do, we should check for that change too
            this.setField("state",state);
        }
        if(currentMessage != msg) {
            //for now we are not tracking msg. If we do, we should check for that change too
            if(msg !== undefined) this.setField("stateMsg",msg);
            else this.clearField("stateMsg");
        }
    }

    /** THis is a utility to create a display name from a url. */
    urlToDisplayName(url) {
        let lastSeperatorIndex = url.lastIndexOf("/");
        if(lastSeperatorIndex == 0) return url.substr(0,MAX_AUTO_NICKNAME_LENGTH);

        let fileName = url.substr(lastSeperatorIndex+1);
        let queryStart = fileName.indexOf("?");
        if(queryStart > 0) {
            fileName = fileName.substring(0,queryStart);
        }
        if(fileName.length > MAX_AUTO_NICKNAME_LENGTH) {
            fileName = fileName.substring(0,MAX_AUTO_NICKNAME_LENGTH);
        }
        return fileName;
    }

}

//====================================
// Static Fields
//====================================

let MAX_AUTO_NICKNAME_LENGTH = 24;

const PENDING_STATE_MSG = "loading..."


ReferenceEntry.ELEMENT_ID_BASE = "__apogee_reference_entry_";

ReferenceEntry.NO_NAME_AVAILABLE = "<no name available>";