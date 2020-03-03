import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 

/** This is the base functionality for a component. */
export default class Component extends EventManager {

    constructor(modelManager,member) {

        super();
        
        this.modelManager = modelManager;
        this.member = member;
    
        this.modelManager.registerMember(this.member,this);
        
        //inheriting objects can pass functions here to be called on cleanup, save, etc
        this.cleanupActions = [];

        this.updated = {};
        
        this._setState(member.getState());

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

    /** This method returns the base member for this component. */
    getMember() {
        return this.member;
    }

    getId() {
        return this.member.getId();
    }

    getName() {
        return this.member.getName();
    }

    getFullName() {
        return this.member.getFullName();
    }

    /** This method returns a display name for the member object. */
    getDisplayName(useFullPath) {
        if(useFullPath) {
            return this.getFullName();
        }
        else {
            return this.getName();
        }
    }

    getParentComponent() {
        let parent = this.member.getParent();
        if(parent) {
            return this.modelManager.getComponent(parent);
        }
        else {
            return null;
        }
    }

    getBannerState() {
        return this.bannerState;
    }

    getBannerMessage() {
        return this.bannerMessage;
    }

    /** This method returns the model for this component. */
    getModel() {
        return this.member.getModel();
    }

    /** This method returns the model manager for this component. */
    getModelManager() {
        return this.modelManager;
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    //------------------------------------------
    // Event Tracking Methods
    //------------------------------------------

    getUpdated() {
        return this.updated;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    //getId() Implmented above

    getTargetType() {
        return "component";
    }


    //------------------
    // serialization
    //------------------

    /** This serializes the component. */
    toJson() {
        var json = {};
        json.type = this.constructor.uniqueName;

        //TO DO 

        if(this.displayState) {
            json.displayState = this.displayState;
        }
        
        //allow the specific component implementation to write to the json
        if(this.writeToJson) {
            this.writeToJson(json);
        }

        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }
        
        return json;
    }

    /** This is used to load the component from a json and also to set properties, such as
     * from the set properties form. */
    loadPropertyValues(json) {
        if(!json) json = {};
        
        //take any immediate needed actions
        
        //set the tree state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }
        
        //allow the component implemnetation ro read from the json
        if(this.readFromJson) {
            this.readFromJson(json);
        }
    }
    //==============================
    // Protected Instance Methods
    //==============================

    //This method should optionally be populated by an extending object.
    //** This method reads any necessary component implementation-specific data
    // * from the json. OPTIONAL */
    //readFromJson(json);

    //This method should optionally be populated by an extending object.
    //** This method writes any necessary component implementation-specific data
    // * to the json. OPTIONAL */
    //writeToJson(json);

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
        
        if(updatedMember.getId() == this.member.getId()) {
            this.fieldUpdated("member");
            
            //check for name changes
            if(updatedMember.isFieldUpdated("name")) {
                this.fieldUpdated("name");
            }
            
            //check for parent change
            if(updatedMember.isFieldUpdated("owner")) {
                this.fieldUpdated("owner");
            }  

            if((updatedMember.isFieldUpdated("state"))||(updatedMember.isFieldUpdated("stateMessage"))) {
                this._setState(updatedMember.getState());
            }
        }
        else {
            //there was an update to an internal field
            this.fieldUpdated(updatedMember.getName());
            
            //for now we will assume the internal members do not have their name update!!!
            //maybe I should add a error check 
        }
    }

    /** This method is used for setting initial values in the property dialog. 
     * If there are additional property lines, in the generator, this method should
     * be extended to give the values of those properties too. */
    getPropertyValues() {
        
        var member = this.member;
        
        var values = {};
        values.name = member.getName();
        var parent = member.getParent();
        if(parent) {
            values.parentName = parent.getFullName();
        }

        if(member.constructor.generator.readProperties) {
            member.constructor.generator.readProperties(member,values);
        }
        if(this.readExtendedProperties) {
            this.readExtendedProperties(values);
        }
        return values;
    }

    _setState(newState) {
        //only process a state change
        if((newState == this.bannerState)&&(this.bannerState != apogeeutil.STATE_ERROR)) {
            return;
        }

        let newMsg;
        switch(newState) {
            case apogeeutil.STATE_NORMAL:
                newMsg = "";
                break;

            case apogeeutil.STATE_PENDING:
                newMsg = bannerConstants.PENDING_MESSAGE;
                break;

            case apogeeutil.STATE_INVALID:
                newMsg = bannerConstants.INVALID_MESSAGE;
                break;

            case apogeeutil.STATE_ERROR:
                let errorList = this.member.getErrors();
                newMsg = this._getErrorMessage(errorList);
                //we could check if the message changes, but I won't since there is more
                //error info we should store in the future.
                break;

            default:
                newMsg = "Unknown state: " + newBannerState;
        }

        //set the new states
        this.bannerState = newState;
        this.bannerMessage = newMsg;
        this.fieldUpdated("bannerState");
    }

    _getErrorMessage(errorList) {
        return errorList.join("\n");
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
// All components should have a generator to create the component
// from a json. See existing components for examples.
//======================================
