import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
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
            this.setField("memberFieldMap",{});

            modelManager.registerComponent(this);

            this.registerMember(modelManager,member,"member",true);
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
        json.type = this.constructor.uniqueName;

        //TO DO 

        if(this.displayState) {
            json.displayState = this.displayState;
        }

        if(this.writeExtendedData) {
            this.writeExtendedData(json,modelManager);
        }
        if(this.writeExtendedProps) {
            this.writeExtendedProps(json,modelManager);
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
        
        //allow the component implemnetation to read data (non-props) from the json
        if(this.loadExtendedData) {
            this.loadExtendedData(json);
        }

        //allow the component implemnetation to read properties from the json
        if(this.loadExtendedProps) {
            this.loadExtendedProps(json);
        }

        //////////////////////////////////////////////////////////////////
        //legacy name kept for legacy support
        if(this.readPropsFromJson) {
            this.readPropsFromJson(json);
        }
        //////////////////////////////////////////////////////////////////
    }

    /** This is used to update properties, such as from the set properties form. */
    loadPropertyValues(json) {
        if(this.loadExtendedProps) {
            this.loadExtendedProps(json);
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

    //This method should optionally be populated by an extending object.
    //** This method reads any necessary component implementation-specific stored data
    // * from the json. This should be used for stored data that is NOT updated when properties are updated. OPTIONAL */
    //loadExtendedData(json);

    //This method should optionally be populated by an extending object.
    //** This method reads any necessary component implementation-specific properties data
    // * from the json. This is also use when updating properties. OPTIONAL */
    //loadExtendedProps(json);

    //This method should optionally be populated by an extending object.
    //** This method writes any necessary component implementation-specific data (excluding properties)
    // * to the json. OPTIONAL */
    //writeExtendedData(json,modelManager);

    //This method should optionally be populated by an extending object.
    //** This method writes component implementation-specific properties
    // * to the json. OPTIONAL */
    //writeExtendedProps(json,moduleManager);

    //static transferMemberProperties(inputValues,propertyJson);
    //static transferComponentProperties(inputValues,propertyJson);

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

    /** This method is used for setting initial values in the property dialog. 
     * If there are additional property lines, in the generator, this method should
     * be extended to give the values of those properties too. */
    getPropertyValues() {
        
        var member = this.getField("member");
        
        var values = {};
        values.name = member.getName();
        values.parentId = member.getParentId();

        if(member.constructor.generator.readProperties) {
            member.constructor.generator.readProperties(member,values);
        }
        if(this.writeExtendedProps) {
            this.writeExtendedProps(values);
        }
        return values;
    }


    /** This function should be used to register child members in the case of compound components. This
     * will register the member with the modelManager and ensure update flags are properly handled. */
    registerMember(modelManager,childMember,fieldName,isMainMember) {
        this.setField(fieldName,childMember);
        modelManager.registerMember(childMember.getId(),this,isMainMember);

        //update childFieldMap
        let oldMemberFieldMap = this.getField("memberFieldMap");
        let memberFieldMap = {};
        Object.assign(memberFieldMap,oldMemberFieldMap);
        memberFieldMap[childMember.getId()] = fieldName;
        this.setField("memberFieldMap",memberFieldMap);
    }

    //======================================
    // Static methods
    //======================================

    /** This function creates a json to create the member for a new component instance. 
     * It uses default values and then overwrites in with optionalBaseValues (these are intended to be base values outside of user input values)
     * and then optionalOverrideValues (these are intended to be user input values) */
    static createMemberJson(componentClass,optionalInputProperties,optionalBaseValues) {
        var json = apogeeutil.jsonCopy(componentClass.DEFAULT_MEMBER_JSON);
        if(optionalBaseValues) {
            for(var key in optionalBaseValues) {
                json[key]= optionalBaseValues[key];
            }
        }
        if(optionalInputProperties) {
            //add the base component values
            if(optionalInputProperties.name !== undefined) json.name = optionalInputProperties.name;
            
            //add the specific member properties for this component type
            if(componentClass.transferMemberProperties) {
                componentClass.transferMemberProperties(optionalInputProperties,json);
            }
        }
        
        return json;
    }

    /** This function merges values from two objects containing component property values. */
    static createComponentJson(componentClass,optionalInputProperties,optionalBaseValues) {
        //copy the base properties
        var newPropertyValues = optionalBaseValues ? apogeeutil.jsonCopy(optionalBaseValues) : {};
        
        //set the type
        newPropertyValues.type = componentClass.uniqueName;
        
        //add in the input property Value
        if((optionalInputProperties)&&(componentClass.transferComponentProperties)) {
            componentClass.transferComponentProperties(optionalInputProperties,newPropertyValues);
        }
        
        return newPropertyValues;
    }
}

//======================================
// Implementation specific component static members
//======================================

/** This is the display name for the type of component */
//Component.displayName;

/** This is the univeral uniaue name for the component, used to deserialize the component. */
//Component.uniqueName;

//Component.DEFAULT_MEMBER_JSON

//Component.COMPONENT_PROPERTY_MAP

//JsonTableComponent.COMPONENT_DATA_MAP

//JsonTableComponent.MEMBER_PROPERTY_LIST