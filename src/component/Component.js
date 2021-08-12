import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";

/** This is the base functionality for a component. */
export default class Component extends FieldObject {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super("component",instanceToCopy,keepUpdatedFixed);

        //inheriting objects can pass functions here to be called on cleanup, save, etc
        this.cleanupActions = [];
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            modelManager.registerComponent(this);

            //process the members associated with this component
            let memberFieldMap = {};
            let memberJson = this.constructor.getDefaultMemberJson();
            let memberFieldName = "member";
            let isRoot = true;
            this.processMemberAndChildren(modelManager,member,memberJson,memberFieldName,isRoot,memberFieldMap);
            
            this.setField("memberFieldMap",memberFieldMap);

            //initialize fields in the extending class
            let componentFieldMap = this.constructor.getComponentFieldDefs();
            if(componentFieldMap) {
                for(let fieldName in componentFieldMap) {
                    let newValue = componentFieldMap[fieldName];
                    this.setField(fieldName,newValue);
                }
            }
        }

        //==============
        //Working variables
        //==============
        this.viewStateCallback = null;
        this.cachedViewState = null;
    }

    /** If an extending object has any cleanup actions, a callback should be passed here.
     * The callback will be executed in the context of the current object. */
    addCleanupAction(cleanupFunction) {
        this.cleanupActions.push(cleanupFunction);
    }

    //==============================
    // Public Instance Methods
    //==============================

    /** This method returns the base member for this component. To see if this
     * field has been updated, check the "member" field of the component.  
     * To access other child members for compound components, use the access those fields using
     * the getField method. The field name is the "member." + the variable name of the field. */
    getMember() {
        return this.getField("member");
    }

    /** This method returns true if the data from a given named member field has changed. */
    isMemberDataUpdated(memberFieldName) {
        return this.isMemberFieldUpdated(memberFieldName,"data");
    }

    /** This method returns true if the given member field has been updated. */
    isMemberFieldUpdated(memberFieldName,memberFieldFieldName) {
        if(this.isFieldUpdated(memberFieldName)) {
            let member = this.getField(memberFieldName);
            return member.isFieldUpdated(memberFieldFieldName);
        }
        else {
            return false;
        }
    }

    /** This method returns true if the given member field has been updated. */
    areAnyMemberFieldsUpdated(memberFieldName,memberFieldFieldNameList) {
        if(this.isFieldUpdated(memberFieldName)) {
            let member = this.getField(memberFieldName);
            return member.areAnyFieldsUpdated(memberFieldFieldNameList);
        }
        else {
            return false;
        }
    }
    
    /** This method returns the ID for the field. It is fixed for the duration of the application.
     * it is not persistent between running the application different time. */
    getMemberId() {
        return this.getField("member").getId();
    }

    /** This method returns the name of the component. To see if the value has been updated, check 
     * the component field name "member" and the member field name "name".
     */
    getName() {
        return this.getField("member").getName();
    }

    /** This method returns the name of the member including the full path.
     * To check if the full name has changed, use the isFullNameChanged method of the member. */
    getFullName(modelManager) {
        return this.getField("member").getFullName(modelManager.getModel());
    }

    /** This method returns a display name for the member object. */
    getDisplayName(useFullPath,modelManagerForFullPathOnly) {
        if(useFullPath) {
            return this.getFullName(modelManagerForFullPathOnly);
        }
        else {
            return this.getName();
        }
    }

    /** This method returns true if the display name field is updated. This method exists because
     * display name is potentially a compound field and this is a systematic way to see if it has changed.
     * Components modifying the getDisplayName method should also update this method.
     * Note this method only applies when useFullPath = false. If you are using useFullPath = true, also
     * check if the fullName has changed. */
    isDisplayNameUpdated() {
        return this.isMemberFieldUpdated("member","name");
    }

    /** This can be used to see if the component state has been updated. */
    isStateUpdated() {
        return this.isMemberFieldUpdated("member","state");
    }

    /** This gets the map of members in this component. The key is the member ID and
     * the value is the stored name for the component. */
    getMemberFieldMap() {
        return this.getField("memberFieldMap");
    }

    getParentComponent(modelManager) {
        let model = modelManager.getModel();
        let parent = this.getField("member").getParentMember(model);
        if(parent) {
            let componentId = modelManager.getComponentIdByMemberId(parent.getId());
            return modelManager.getComponentByComponentId(componentId);
        }
        else {
            return null;
        }
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    //------------------
    // serialization
    //------------------

    /** This serializes the component. */
    toJson(modelManager) {
        var json = {};
        json.type = this.constructor.getClassUniqueName();

        //TO DO 

        if(this.displayState) {
            json.displayState = this.displayState;
        }

        if(this.writeExtendedData) {
            this.writeExtendedData(json,modelManager);
        }

        /////////////////////////////////////////////////////////////////////////
        //legacy name - kept for legacy support
        if(this.writeToJson) {
            this.writeToJson(json,modelManager);
        }
        //////////////////////////////////////////////////////////////////////////

        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }
        
        return json;
    }

    /** This is used to deserialize the component. */
    loadFromJson(json) {
        if(!json) json = {};
        
        //set the tree state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }
        
        //allow the component implemnetation to read data from the json
        if(this.loadExtendedData) {
            this.loadExtendedData(json);
        }


        //////////////////////////////////////////////////////////////////
        //legacy name kept for legacy support
        if(this.readPropsFromJson) {
            this.readPropsFromJson(json);
        }
        //////////////////////////////////////////////////////////////////
    }

    /** This is used to update properties, such as from the set properties form. */
    loadPropertyValues(modelManager,json) {
        if(this.loadExtendedData) {
            this.loadExtendedData(json);
        }  

        //////////////////////////////////////////////////////////////////
        //legacy name - kept for legacy support   
        if(this.readPropsFromJson) {
            this.readPropsFromJson(json);
        }
        //////////////////////////////////////////////////////////////////
    }
    //==============================
    // Protected Instance Methods
    //==============================

    /** This method cleans up after a delete. Any extending object that has delete
     * actions should pass a callback function to the method "addClenaupAction" */
    onDelete() {
        
        //execute cleanup actions
        for(var i = 0; i < this.cleanupActions.length; i++) {
            this.cleanupActions[i].call(this);
        }
    }

    /** This method extends the member udpated function from the base.
     * @protected */    
    memberUpdated(updatedMember) {
        let memberFieldMap = this.getField("memberFieldMap");
        let fieldName = memberFieldMap[updatedMember.getId()];

        //legacy case of old member registartion
        if(!fieldName) {
            fieldName = "member." + updatedMember.getName();
        }

        this.setField(fieldName,updatedMember);
    }

    /** This function processes the members associated with this component, using the default json
     * to look up the member instances. This includes registering the each member, saving the member in its
     * associated field, and constructing the member field map.  */
    processMemberAndChildren(modelManager,member,memberJson,memberFieldName,isMainMember,memberFieldMap) {

        //register the member with the model manager
        modelManager.registerMember(member.getId(),this,isMainMember);

        //add to the local member field map
        memberFieldMap[member.getId()] = memberFieldName;

        //save the member in its component field
        this.setField(memberFieldName,member);
        
        //process the children of this member
        if(memberJson.children) {
            let model = modelManager.getModel();
            for(let childName in memberJson.children) {
                let childMember = member.lookupChild(model,childName);
                let childMemberJson = memberJson.children[childName];
                let childMemberFieldName = memberFieldName + "." + childName;
                let childIsMainMember = false;
                this.processMemberAndChildren(modelManager,childMember,childMemberJson,childMemberFieldName,childIsMainMember,memberFieldMap);
            }
        }
    }

    //==============================
    // serialization and properties
    //==============================

    /** This method writes any data fields associated with the component. */
    writeExtendedData(json,modelManager) {
        let componentFieldMap = this.constructor.getComponentFieldDefs();
        if(componentFieldMap) {
            for(let fieldName in componentFieldMap) {
                json[fieldName] = this.getField(fieldName);
            }
        }
    }

    /** This method reads any data fields associated with the component. */
    loadExtendedData(json) {
        let componentFieldMap = this.constructor.getComponentFieldDefs();
        if(componentFieldMap) {
            for(let fieldName in componentFieldMap) {
                let newValue = json[fieldName];
                if(newValue != undefined) {
                    let oldValue = this.getField(fieldName);
                    if(newValue !== oldValue) {
                        this.setField(fieldName,newValue);
                    }
                }
            }
        }
    }

    //======================================
    // Static methods
    //======================================


    //=======================
    // Configuation Property Accessors
    //=======================

    static getClassDisplayName() {
        //"this" refers to the class object in a static
        return this.getConfigField("displayName");
    }

    static getClassUniqueName() {
        //"this" refers to the class object in a static
        return this.getConfigField("uniqueName");
    }

    static getDefaultMemberJson() {
        //"this" refers to the class object in a static

        //////////////////////////////////////
        //legacy - this data used to be saved on this static field
        if(this.DEFAULT_MEMBER_JSON) return this.DEFAULT_MEMBER_JSON;
        //////////////////////////////////////

        return this.getConfigField("defaultMemberJson");
    }

    static getTotalMemberJson() {
        let totalMemberJson = this.getConfigField("totalMemberJson");
        if(!totalMemberJson) return this.getDefaultMemberJson();
        else return totalMemberJson;
    }

    static getDefaultComponentJson() {
        //"this" refers to the class object in a static
        //default component json is optional. If not included, use a generated version 
        let json = this.getConfigField("defaultComponentJson");
        if(!json) {
            json = {
                type: this.getClassUniqueName()
            }
        }
        return json;
    }

    static getComponentFieldDefs() {
        //"this" refers to the class object in a static
        return this.getConfigField("componentFieldMap");
    }

    static getConfigField(fieldName) {
        //"this" refers to the class object in a static

        //////////////////////////////////////
        //legacy - before we used the CLASS_CONFIG field
        if(!this.CLASS_CONFIG) {
            
            return this[fieldName]
        }
        ////////////////////////////////////////
        
        return this.CLASS_CONFIG[fieldName];
    }

    //////////////////////////////////////////////////////////////////
    // NEW CHILD METHODS
    ////////////////////////////////////////////////////


    getDirectChildMember(childPath) {
        return this.getField(this.memberPathToMemberField(childPath));
    }

    memberPathToMemberField(childPath) {
        if(childPath == ".") {
            return "member";
        }
        else {
            return "member." + childPath;
        }
    }
}

//======================================
// Implementation specific component static members
//======================================

// ExtendingComponent.CLASS_CONFIG = {
//     displayName: The display name for this compononent - REQUIRED
//     uniqueName: The globally unique identifer for this component 
//     defaultMemberJson: The JSON that creates the default members for this component
//     componentFieldMap: A map of data field names to default values. All fields included in this map will
//                        automatically be initialized and serialized and property updates for them will be supported.
// }
