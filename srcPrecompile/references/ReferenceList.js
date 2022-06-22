
import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceList extends FieldObject {

    constructor(referenceEntryClass,instanceToCopy) {
        super("referenceList",instanceToCopy);

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //create empty reference map
            this.setField("referenceEntryArray",[]);
            this.referenceEntryClass = referenceEntryClass;
        }
        else {
            this.referenceEntryClass = instanceToCopy.referenceEntryClass;
        }

        //==============
        //Working variables
        //==============

        this.workingChangeMap = {};

        //add a change map entry for this object
        this.workingChangeMap[this.getId()] = {action: instanceToCopy ? "referenceList_updated" : "referenceList_created", instance: this};
    }

    //====================================
    // Methods
    //====================================

    getReferenceEntryClass() {
        return this.referenceEntryClass;
    }

    getReferenceType() {
        return this.referenceEntryClass.REFERENCE_TYPE
    }

    //-------------------------------
    // Workspace object interface
    //-------------------------------

    getChildren(workspaceManager) {
        return this.getField("referenceEntryArray")
    }

    /** FIX THIS */
    getState() {
        return apogeeutil.STATE_NORMAL
    }

    getStateMessage() {
        return ""
    }

    getIconUrl() {
        return apogeeui.uiutil.getResourcePath(ICON_RES_PATH,"app")
    }

    getName() {
        return this.referenceEntryClass.LIST_DISPLAY_NAME
    }

    //====================================
    // Reference Lifecycle Methods
    //====================================

    /** This checks if there is an existing reference entry matching the newly requested reference. */
    getExistingReferenceEntry(entryCommandData) {
        let inputReferenceString = this.referenceEntryClass.getReferenceString(entryCommandData)

        let referenceEntryArray = this.getField("referenceEntryArray")
        return referenceEntryArray.find(referenceEntry =>referenceEntry.getInstanceReferenceString() == inputReferenceString)
    }

    
    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called. 
     * The argument specialCaseId is provided so an entry with a specific id can be created. This 
     * should not normally be done. It is provided for "undo/redo" functionality to keep the 
     * same id for an entry.. */
    createEntry(workspaceManager,referenceManager,entryData,specialCaseId) {
        let referenceEntry = new this.referenceEntryClass(entryData,null,specialCaseId)
        
        //add to list
        let referenceEntryArray = this.getField("referenceEntryArray")
        let newReferenceEntryArray = referenceEntryArray.splice()
        newReferenceEntryArray.push(referenceEntry)
        this.setField("referenceEntryArray",newReferenceEntryArray)

        //record the refernce was created
        referenceManager.registerRefObjectChange(referenceEntry,"created")

        let loadedPromise = referenceEntry.loadEntry(workspaceManager)
        return {referenceEntry,loadedPromise}
    }

    updateEntry(workspaceManager,referenceManager,entryId,updateData) {
        let referenceEntry = this.getMutableReferenceEntry(entryId)
        referenceEntry.updateData(workspaceManager,entryId,updateData)

        //record the reference was updated
        referenceManager.registerRefObjectChange(referenceEntry,"updated")
    }

    deleteEntry(referenceManager,entryId) {
        let oldRefArray = this.getField("referenceEntryArray")
        let index = oldRefArray.find(refEntry => refEntry.getId() == refEntryId)
        if(!index) throw new Error("Reference not found: id = " + refEntryId)

        let referenceEntry = refArray[index]
        if(!referenceEntry) throw new Error("Entry not found: " + entryId)

        referenceEntry.removeEntry()

        let newRefArray = oldRefArray.slice() //make a copy
        newRefArray.splice(index,1) //remove deleted element

        this.setField("referenceEntryArray",newRefArray)

        //record the reference was deleted
        referenceManager.registerRefObjectChange(referenceEntry,"deleted")
    }

    /** This method should be called when the parent is closed. It removes all links. */
    close() {
        let entryMap = this.getField("referenceEntryMap");
        for(let key in entryMap) {
            let referenceEntry = entryMap[key]
            referenceEntry.removeEntry()
        }
    }

    /** This returns a list of urls loaded for the given module type. (Note that
     * url for a NPM module is just the module name). */
    getModuleList() {
        //FIX THIS!!//
        let moduleList = []
        let referenceEntryMap = this.getField("referenceEntryMap")
        for(let entryId in referenceEntryMap) {
            let entry = referenceEntryMap[entryId]
            moduleList.push({
                entryId: entryId,
                referenceData: entry.getData()
            })
        }
        return moduleList
    }

    //====================================
    // Reference Owner Functionality
    //====================================

    /** This method locks the reference manager and all reference entries. */
    lockAll() {
        //FIGURE OUT WHAT TO DO WITH THIS
        this.workingChangeMap = null;
        //////////////////////////////////

        let referenceEntryArray = this.getField("referenceEntryArray");
        referenceEntryArray.forEach(refEntry => refEntry.lock())
        this.lock();
    }

    getRefEntryById(refEntryId) {
        let referenceEntryArray = this.getField("referenceEntryArray")
        return referenceEntryArray.find(referenceEntry => referenceEntry.getId() == refEntryId)
    }

    /** This method gets a mutable ref entry. If the current ref entry is mutable it returns
     * that. If not, it creates a mutable copy and registers the new mutable copy. It returns
     * null if the reference entry ID is not found. */
    getMutableRefEntryById(refEntryId) {
        //we should be unlocked - I'll test here anyway
        if(!this.getIsLocked()) throw new Error("Object locked by expected to be unlocked: id =" + this.getId())

        let refArray = this.getField("referenceEntryArray")
        let index = refArray.find(refEntry => refEntry.getId() == refEntryId)
        if(!index) throw new Error("Reference not found: id = " + refEntryId)

        let originalRefEntry = refArray[index];

        let mutableRefEntry
        if(refEntry.getIsLocked) {
            mutableRefEntry = new originalRefEntry.constructor(null,originalRefEntry)
            refArray[index] = mutableRefEntry
        }
        else {
            mutableRefEntry = originalRefEntry
        }

        return mutableRefEntry
    }

    //====================================
    // open and save methods
    //====================================

    /** This method opens the reference entries. An on references load callback 
     * can be passed and it will be a called when all references are loaded, with the
     * load completion command result for each. The return value for this function is the
     * initial command result for starting the refernce loading.
     */
    load(workspaceManager,json) {

        let entryLoadedPromises = [];
        
        //load the reference entries
        if(json.refEntries) {

            //construct the load function
            let loadRefEntry = refEntryJson => {
                let {referenceEntry,loadedPromise} = this.createEntry(workspaceManager,refEntryJson.entryType,refEntryJson.data);
                entryLoadedPromises.push(loadedPromise);
            }

            //load each entry
            json.refEntries.forEach(loadRefEntry);
        }

        //create the return promise
        let referencesLoadedPromise;
        if(entryLoadedPromises.length > 0) {
            referencesLoadedPromise = Promise.all(entryLoadedPromises);
        }
        else {
            referencesLoadedPromise = Promise.resolve();
        }
        return referencesLoadedPromise;
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    toJson() {
        let entryArray = this.getField("referenceEntryArray");
        let entriesJson = entryArray.map(entry => entry.toJson())
        if(entriesJson.length > 0) {
            json.refEntries = entriesJson;
        }
    
        return entriesJson
    }
    

}

const ICON_RES_PATH = "/icons3/folderIcon.png"