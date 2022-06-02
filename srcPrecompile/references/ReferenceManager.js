
import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

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
        
        let referenceClassArray = ReferenceManager.getReferenceClassArray();
        this.referenceClassMap = {};
        referenceClassArray.forEach(referenceClass => {
            this.referenceClassMap[referenceClass.REFERENCE_TYPE] = referenceClass;
        })

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //create empty reference map
            this.setField("referenceEntryMap",{});
        }

        //==============
        //Working variables
        //==============
        this.viewStateCallback = null;
        this.cachedViewState = null;

        this.workingChangeMap = {};

        //add a change map entry for this object
        this.workingChangeMap[this.getId()] = {action: instanceToCopy ? "referenceManager_updated" : "referenceManager_created", instance: this};
    }

    //====================================
    // Methods
    //====================================

    getApp() {
        return this.app;
    }

    /** FIX THIS */
    getState() {
        return apogeeutil.STATE_NORMAL
    }

    //====================================
    // Reference Lifecycle Methods
    //====================================

    
    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called. 
     * The argument specialCaseId is provided so an entry with a specific id can be created. This 
     * should not normally be done. It is provided for "undo/redo" functionality to keep the 
     * same id for an entry.. */
    createEntry(entryType,entryData,specialCaseId) {
        let referenceEntryClass = this.referenceClassMap[entryType];
        if(!referenceEntryClass) throw new Error("Entry type not found: " + entryType);
        let referenceEntry = this._getExistingReferenceEntry(referenceEntryClass,entryData);
        if(!referenceEntry) {
            //load the entry
            let referenceEntryClass = this.referenceClassMap[entryType];
            referenceEntry = new referenceEntryClass(entryData,null,specialCaseId);
            this.registerRefEntry(referenceEntry);
        }
        return referenceEntry;
    }

    /** This method should be called when the parent is closed. It removes all links. */
    close() {
        let entryMap = this.getField("referenceEntryMap");
        for(let key in entryMap) {
            let referenceEntry = entryMap[key];
            referenceEntry.removeEntry();
        }
    }

    /** This returns a list of urls loaded for the given module type. (Note that
     * url for a NPM module is just the module name). */
    getModuleList(moduleType) {
        //FIX THIS!!//
        let moduleList = [];
        let referenceEntryMap = this.getField("referenceEntryMap");
        for(let entryId in referenceEntryMap) {
            let entry = referenceEntryMap[entryId];
            if(entry.getEntryType() == moduleType) {
                moduleList.push({
                    entryId: entryId,
                    referenceData: entry.getData()
                });
            }
        }
        return moduleList;
    }

    //====================================
    // Reference Owner Functionality
    //====================================

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

    /** This method locks the reference manager and all reference entries. */
    lockAll() {
        this.workingChangeMap = null;

        let referenceEntryMap = this.getField("referenceEntryMap");
        for(let id in referenceEntryMap) {
            referenceEntryMap[id].lock();
        }
        this.lock();
    }

    getRefEntryById(refEntryId) {
        return this.getField("referenceEntryMap")[refEntryId];
    }

    /** This method gets a mutable ref entry. If the current ref entry is mutable it returns
     * that. If not, it creates a mutable copy and registers the new mutable copy. It returns
     * null if the reference entry ID is not found. */
    getMutableRefEntryById(refEntryId) {
        let oldRefEntryMap = this.getField("referenceEntryMap");
        var oldRefEntry = oldRefEntryMap[refEntryId];
        if(oldRefEntry) {
            if(oldRefEntry.getIsLocked()) {
                //create an unlocked instance of the ref entry
                let newRefEntry = new oldRefEntry.constructor(null,oldRefEntry);

                //register this instance
                this.registerRefEntry(newRefEntry);

                return newRefEntry;
            }
            else {
                return oldRefEntry;
            }
        }
        else {
            return null;
        }
    }

    /** This method stores the reference entry instance. It must be called when a
     * new reference entry is created and when a reference entry instance is replaced. */
    registerRefEntry(referenceEntry) {
        let refEntryId = referenceEntry.getId();
        let oldRefEntryMap = this.getField("referenceEntryMap");
        let oldRefEntry = oldRefEntryMap[refEntryId];

        //create the udpated map
        let newRefEntryMap = {};
        Object.assign(newRefEntryMap,oldRefEntryMap);
        newRefEntryMap[refEntryId] = referenceEntry;
        this.setField("referenceEntryMap",newRefEntryMap);

        //update the change map
        let oldChangeEntry = this.workingChangeMap[refEntryId];  
        let newAction; 
        if(oldChangeEntry) {
            //we will assume the events come in order
            //the only scenarios assuming order are:
            //created then updated => keep action as created
            //updated then updated => no change
            //we will just update the referenceEntry
            newAction = oldChangeEntry.action;
        }
        else {
            //new action will depend on if we have the ref entry in our old ref entry map
            newAction = oldRefEntryMap[refEntryId] ? "referenceEntry_updated" : "referenceEntry_created"; 
        }
        this.workingChangeMap[refEntryId] = {action: newAction, instance: referenceEntry};
    }

    /** This method takes the local actions needed when a referenceEntry is deleted. It is called internally. */
    unregisterRefEntry(referenceEntry) {
        let refEntryId = referenceEntry.getId();

        //update the referenceEntry map
        let oldRefEntryMap = this.getField("referenceEntryMap");
        let newRefEntryMap = {};
        Object.assign(newRefEntryMap,oldRefEntryMap);
        //remove the given referenceEntry
        delete newRefEntryMap[refEntryId];
        //save the updated map
        this.setField("referenceEntryMap",newRefEntryMap);

        //update the change map
        let oldChangeEntry = this.workingChangeMap[refEntryId];
        let newChangeEntry;
        if(oldChangeEntry) {
            //handle the case of an existing change entry
            if(oldChangeEntry.action == "referenceEntry_created") {
                //referenceEntry created and deleted during this action - flag it as transient
                newChangeEntry = {action: "transient", instance: referenceEntry};
            }
            else if(oldChangeEntry.action == "referenceEntry_updated") {
                newChangeEntry = {action: "referenceEntry_deleted", instance: referenceEntry};
            }
            else {
                //this shouldn't happen. If it does there is no change to the action
                //we will just update the referenceEntry
                newChangeEntry = {action: oldChangeEntry.action, instance: referenceEntry};
            }
        }
        else {
            //add a new change entry
            newChangeEntry = {action: "referenceEntry_deleted", instance: referenceEntry};
        }
        this.workingChangeMap[refEntryId] = newChangeEntry;  
    }


    //====================================
    // open and save methods
    //====================================

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

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
                let data = refEntryJson.data
                //backward compatibility-----------------
                if(!data) {
                    data = {};
                    Object.assign(data,refEntryJson);
                    delete data.entryType;
                }
                //----------------------------------------

                //create the entry (this does not actually load it)
                let referenceEntry = this.createEntry(refEntryJson.entryType,data);

                //load the entry - this will be asynchronous
                let loadEntryPromise = referenceEntry.loadEntry(workspaceManager);
                entryLoadedPromises.push(loadEntryPromise);
            }

            //load each entry
            json.refEntries.forEach(loadRefEntry);
        }

        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
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
        let json = {};
        let entryMap = this.getField("referenceEntryMap");
        let entriesJson = [];
        for(let key in entryMap) {
            let refEntry = entryMap[key];
            entriesJson.push(refEntry.toJson());
        }
        if(entriesJson.length > 0) {
            json.refEntries = entriesJson;
        }
    
        //set the view state
        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }

        return json;
    }

    //=================================
    // Private
    //=================================

    /** This checks if there is an existing reference entry matching the newly requested reference. */
    _getExistingReferenceEntry(referenceEntryClass,entryCommandData) {
        let inputReferenceString = referenceEntryClass.getReferenceString(entryCommandData);

        let referenceEntryMap = this.getField("referenceEntryMap");
        for(let id in referenceEntryMap) {
            let referenceEntry = referenceEntryMap[id];
            if(referenceEntry.getInstanceReferenceString() == inputReferenceString) {
                return referenceEntry; 
            }
        }
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