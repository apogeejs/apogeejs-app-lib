
import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import ReferenceList from "/apogeejs-app-lib/src/references/ReferenceList.js"

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceManager extends FieldObject {

    constructor(app,instanceToCopy) {
        super("referenceManager",instanceToCopy);

        this.app = app;

        //==============
        //Working variables
        //==============

        this.workingChangeMap = {}

        //add a change map entry for this object
        this.registerRefObjectChange(this,instanceToCopy ? "updated" : "created")

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            if(!instanceToCopy) {
                let referenceClassArray = ReferenceManager.getReferenceClassArray()
                let referenceListArray = []
                referenceClassArray.forEach(referenceClass => {
                    let referenceList = new ReferenceList(referenceClass)
                    referenceListArray.push(referenceList)
                    this.registerRefObjectChange(referenceList,"created")
                })
                this.setField("referenceListArray",referenceListArray)
            }
        }
    }

    //====================================
    // Methods
    //====================================

    getApp() {
        return this.app;
    }

    //-------------------------------
    // Workspace object interface
    //-------------------------------

    getWorkspaceObjectType() {
        return "ReferenceManager"
    }

    /** FIX THIS */
    getState() {
        return apogeeutil.STATE_NORMAL
    }

    getStateMessage() {
        return ""
    }

    //---------------------------
    // references methods
    //---------------------------

    /** This checks if an entry with the given identifying data already exists. This
     * should be checked before a reference entry is added. */
     getExistingReferenceEntry(entryType,entryData) {
        let referenceList = this.getReferenceList(entryType)
        if(!referenceList) throw new Error("Entry type not found: " + entryType)
        return referenceList.getExistingReferenceEntry(entryData)
    } 

    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called. 
     * The argument specialCaseId is provided so an entry with a specific id can be created. This 
     * should not normally be done. It is provided for "undo/redo" functionality to keep the 
     * same id for an entry. */
    createEntry(workspaceManager,entryType,entryData,specialCaseId) {
        let referenceList = this.getMutableReferenceListByType(entryType)
        if(!referenceList) throw new Error("Entry type not found: " + entryType)
        return referenceList.createEntry(workspaceManager,this,entryData,specialCaseId)
    }

    updateEntry(workspaceManager,entryId,updateData) {
        let entryType = this._getEntryTypeFromId(entryId)

        let referenceList = this.getMutableReferenceListByType(entryType)
        if(!referenceList) throw new Error("Entry type not found: " + entryType)
        return referenceList.updateEntry(workspaceManager,this,entryId,updateData)
    }

    removeEntry(workspaceManager,entryId) {
        let entryType = this._getEntryTypeFromId(entryId)

        let referenceList = this.getMutableReferenceListByType(entryType)
        if(!referenceList) throw new Error("Entry type not found: " + entryType)
        return referenceList.deleteEntry(this,entryId)
    }

    /** This method should be called when the parent is closed. It removes all links. */
    close() {
        //DOH! WORK OUT CHANGE ACCOUNTING, OR NOT?
        let referenceListArray = this.getField("referenceListArray")
        referenceListArray.forEach(referenceList => {
            referenceList.close()
        })
        //this.setField("referenceListArray",[])
    }

    /** This returns a list of urls loaded for the given module type. (Note that
     * url for a NPM module is just the module name). */
     getModuleList(entryType) {
        let referenceList = this.getReferenceList(entryType)
        if(!referenceList) throw new Error("Entry type not found: " + entryType)
        
        return referenceList.getModuleList()
    }

    //====================================
    // Reference Lifecycle Methods
    //====================================

    getReferenceLists() {
        return this.getField("referenceListArray")
    }

    getReferenceList(moduleType) {
        let referenceListArray = this.getField("referenceListArray")
        return referenceListArray.find(referenceList => referenceList.getReferenceType() == moduleType)
    }

    getMutableReferenceListByType(moduleType) {
        let oldReferenceListArray = this.getField("referenceListArray")
        let index = oldReferenceListArray.findIndex(referenceList => referenceList.getReferenceType() == moduleType)
        if(index < 0) throw new Error("Reference type not found: " + moduleType)

        let oldReferenceList = oldReferenceListArray[index]
        if(oldReferenceList.getIsLocked()) {
            //create an unlocked instance of the ref entry
            let newReferenceList = new oldReferenceList.constructor(null,oldList)
            let newReferenceListArray = oldReferenceListArray.slice()
            newReferenceListArray[index] = newReferenceList
            this.setField("referenceListArray",newReferenceListArray)

            this.registerRefObjectChange(newReferenceList,"updated")

            return newReferenceList;
        }
        else {
            return oldReferenceList;
        }

    }

    //====================================
    // Reference Owner Functionality
    //====================================

    /** This method locks the reference manager and all reference entries. */
    lockAll() {
        this.workingChangeMap = null;

        let referenceEntryMap = this.getField("referenceEntryMap");
        for(let id in referenceEntryMap) {
            referenceEntryMap[id].lock();
        }
        this.lock();
    }

    /** The change map lists the changes to the referenceEntrys and model. This will only be
     * valid when the ReferenceManager is unlocked */
    getChangeMap() {
        return this.workingChangeMap;
    }

    getChangeMapAll() {
        let changeMapAll = {};
        let referenceEntryMap = this.getField("referenceEntryMap");
        for(let id in referenceEntryMap) {
            changeMapAll[id] = {action: "referenceEntry_updated", instance: referenceEntryMap[id]};
        }
        return changeMapAll;
    }

    /** This method stores the reference entry instance. It must be called when a
     * new reference entry is created and when a reference entry instance is replaced. 
     * Change type should be the event names, not including the object type: created, updated, deleted*/
    registerRefObjectChange(refObject,changeType) {

        let objectType = refObject.getFieldObjectType()

        let inputAction = objectType + "_" + changeType
        let newAction

        //update the change map
        let oldChangeRecord = this.workingChangeMap[refObject.getId()]
        if(oldChangeRecord) {
            //we assume events come in order
            //get the action for multiple changes on object
            if((oldChangeRecord.action.endsWith("created"))&&(chageType == "deleted")) newAction = "transient"
            if(changeType == "deleted") newAction = inputAction
            else if(oldChangeRecord.action.endsWith("created")) newAction = oldChangeRecord.action
            else newAction = inputAction
        }
        else {
            //new action will depend on if we have the ref entry in our old ref entry map
            newAction = inputAction; 
        }
        this.workingChangeMap[refObject.getId()] = {action: newAction, instance: refObject}
    }

    //====================================
    // open and save methods
    //====================================

    /** This loads the ref entries, returning a promise that resolves when all are loaded. */
    load(workspaceManager,json) {
        if(!json) return

        let listLoadedPromises = [];
        
        //load the reference entries
        for(let entryType in json) {
            let referenceList = this.getMutableReferenceListByType(entryType)
            if(referenceList) {
                let loadPromise = referenceList.load(workspaceManager,json[entryType])
                listLoadedPromises.push(loadPromise)
            }
        }


        //create the return promise
        let listLoadedPromise;
        if(listLoadedPromises.length > 0) {
            listLoadedPromise = Promise.all(listLoadedPromises);
        }
        else {
            listLoadedPromise = Promise.resolve();
        }
        return listLoadedPromise;
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    toJson() {
        let json = {}
        let refListArray = this.getField("referenceListArray");
        refListArray.forEach(refList => {
            json[refList.getReferenceType()] = refList.toJson()
        })
        return json;
    }

    //=================================
    // Private
    //=================================

    static getEntryTypeFromId(entryId) {
        fieldObjectType = FieldObject.getTypeFromId(entryId)
        let referenceClass = ReferenceManager.referenceClassArray.find(referenceClass => referenceClass.FIELD_OBJECT_TYPE == fieldObjectType)
        if(!referenceClass) throw new Error("Reference type not found for entryId = " + entryId)
        return referenceClass.ENTRY_TYPE
    }

    /** This method returns the reference entry type classes which will be used in the app. */
    static getReferenceClassArray() {
        return ReferenceManager.referenceClassArray;
    }

    /** This method sets the reference entry type classes. */
    static setReferenceClassArray(referenceClassArray) {
        ReferenceManager.referenceClassArray = referenceClassArray
    }
    
}

const ICON_RES_PATH = "/icons3/folderIcon.png"
const TREE_LABEL = "Libraries"