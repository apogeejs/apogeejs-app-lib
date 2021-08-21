import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";

/** This is the base functionality for a component. */
export default class Component extends FieldObject {

    constructor(member,modelManager,instanceToCopy,componentConfig,specialCaseIdValue) {
        super("component",instanceToCopy,specialCaseIdValue);

        this.componentConfig = componentConfig;

        //=============
        // component type specific variables
        //=============

        //inheriting objects can pass functions here to be called on cleanup, save, etc
        this.cleanupActions = [];
        
        //parent logic
        if(this.componentConfig.childParentFolderPath) {
            this.childParentFolderFieldName = this.memberPathToMemberField(this.componentConfig.childParentFolderPath);
            this.isParent = true;
        }
        else {
            this.isParent = false;
        }

        //this is used to allow reacting to loca field changes, such as when swe want to store a field linked to another field (like code and its function)
        this.componentFieldChangeHandlers = {};

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            modelManager.registerComponent(this);

            //process the members associated with this component
            let memberFieldMap = {};
            let memberJson = this._getDefaultMemberJson();
            let memberFieldName = "member";
            let isRoot = true;
            this._processMemberAndChildren(modelManager,member,memberJson,memberFieldName,isRoot,memberFieldMap);
            
            this.setField("memberFieldMap",memberFieldMap);
        }

        //==============
        //Working variables
        //==============
        this.viewStateCallback = null;
        this.cachedViewState = null;
    }

    //==============================
    // Public Instance Methods
    //==============================

    //--------------------------
    // Accessors and convencience functions
    //--------------------------

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

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    getComponentConfig() {
        return this.componentConfig;
    }

    getComponentType() {
        return this.componentConfig.defaultComponentJson.type;
    }

    getComponentTypeDisplayName() {
        return this.componentConfig.displayName;
    }

    /** Here setField is overridden to allow local handlers for when a field changes. */
    setField(fieldName,fieldValue) {
        super.setField(fieldName,fieldValue);
        this._onComponentFieldChange(fieldName,fieldValue);
    }

    /** This method adds a handler for when a local field changes */
    addComponentFieldChangeHandler(fieldName,handler) {
        let handlerList = this.componentFieldChangeHandlers[fieldName];
        if(!handlerList) {
            handlerList = [];
            this.componentFieldChangeHandlers[fieldName] = handlerList;
        }
        handlerList.push(handler); 
    }

    /** This method removes a handler for when a local field changes */
    removeComponentFieldChangeHandler(fieldName,handler) {
        throw new Error("NOT IMPLEMENTED!");
    }

    //--------------------------
    // Event handlers
    //--------------------------

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

    //------------------
    // parent child methods
    //------------------

    /** This returns the parent component for this component. */
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

    /** This returns the component at the specified component path. If the component is not
     * found, null is returned. */
	getChildComponent(modelManager,componentPath) {
		if((!componentPath)||(componentPath == ".")) {
			return this;
		}
		else if(this.isParent) {
			let componentPathArray = Component.getPathArrayFromPath(componentPath);
			return Component._getChildComponentImpl(modelManager,this,componentPathArray);
		}
        else {
            return null;
        }
	}

    /** This returns true if the component is a parent component. */
    getIsParent() {
        return this.isParent;
    }

    /** This returns the folder member which holds the child content. */
    getParentFolderForChildren() {
        if(this.isParent) {
            return this.getField(this.childParentFolderFieldName);
        }
        else {
            return null;
        }
    }

    getChildMemberFromPath(childPath) {
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

	/** This converts a component or member path to a path array. */
	static getPathArrayFromPath(path) {
		if((!path)||(path == ".")) {
			return [];
		}
		else {
			return path.split(",").map(entry => entry.trim());
		}
	}

	static _getChildComponentImpl(modelManager,parentComponent,componentPathArray,startIndex) {
		if(componentPathArray.length == 0) return parentComponent;
		if(startIndex === undefined) startIndex = 0;
	
		let folderMember = parentComponent.getParentFolderForChildren();
		let childMemberId = folderMember.lookupChildId(componentPathArray[startIndex]);
		let childComponentId = modelManager.getComponentIdByMemberId(childMemberId);
		let childComponent = modelManager.getComponentByComponentId(childComponentId);
		if(startIndex >= componentPathArray.length-1) {
			return childComponent;
		}
		else {
			return this._getChildComponentImpl(modelManager,childComponent,componentPathArray,startIndex+1);
		}
	}

	//BELOW ONLY APPLIES IF THE PARENT IS A FOLDER (FIX FOR FUNCTION FOLDER!!!)
	//I think we need to look up the type for the component children. We might need to add model manager.
	static getFullMemberPath(componentPath,memberPath) {
		if((!componentPath)||(componentPath == ".")) {
			return memberPath;
		}
		else if((!memberPath)||(memberPath == ".")) {
			return componentPath;
		}
		else {
			return componentPath + "." + memberPath;
		}
	}


    //------------------
    // serialization
    //------------------

    /** This serializes the component. */
    toJson(modelManager) {
        var json = {};
        json.type = this.getComponentType();

        if(this.displayState) {
            json.displayState = this.displayState;
        }

        if(this.writeExtendedData) {
            this.writeExtendedData(json,modelManager);
        }

        //write the child jsons, if applicable
        if(this.isParent) {
            var folder = this.getParentFolderForChildren();
            var childrenPresent = false;
            var children = {};
            var childIdMap = folder.getChildIdMap();
            for(var key in childIdMap) {
                var childId = childIdMap[key];
                var childComponentId = modelManager.getComponentIdByMemberId(childId);
                var childComponent = modelManager.getComponentByComponentId(childComponentId);
                var name = childComponent.getName();
                children[name] = childComponent.toJson(modelManager);
                childrenPresent = true;
            }
            if(childrenPresent) {
                json.children = children;
            }
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
    loadFromJson(json,modelManager) {
        if(!json) json = {};
        
        //set the tree state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }
        
        //allow the component implemnetation to read data from the json
        if(this.loadExtendedData) {
            this.loadExtendedData(json,modelManager);
        }

        //////////////////////////////////////////////////////////////////
        //legacy name kept for legacy support
        if(this.readPropsFromJson) {
            this.readPropsFromJson(json);
        }
        //////////////////////////////////////////////////////////////////
    }

    /** This method loads the children for this component */
    loadChildrenFromJson(modelManager,componentJson) {
        if((this.isParent)&&(componentJson.children)) {
            let parentMember = this.getParentFolderForChildren();
            for(let childName in componentJson.children) {
                let childMember = parentMember.lookupChild(modelManager.getModel(),childName);
                if(childMember) {
                    let childComponentJson = componentJson.children[childName];
                    modelManager.createComponentFromMember(childMember,childComponentJson);
                }
            };
        }
    }

    /** This is used to update properties, such as from the set properties form. */
    loadPropertyValues(propertyJson,modelManager) {
        if(this.loadExtendedData) {
            this.loadExtendedData(propertyJson,modelManager);
        }  

        //load properties in child components if applicable
        if((this.isParent)&&(propertyJson.children)) {
            let parentMember = this.getParentFolderForChildren();
            for(let childName in propertyJson.children) {
                let childMemberId = parentMember.lookupChildId(childName);
                if(childMemberId) {
                    let childPropertyJson = propertyJson.children[childName];
                    let childComponentId = modelManager.getComponentIdByMemberId(childMemberId);
                    let childComponent = modelManager.getMutableComponentByComponentId(childComponentId);
                    childComponent.loadPropertyValues(modelManager,childPropertyJson);
                }
            }
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

    /** If an extending object has any cleanup actions, a callback should be passed here.
     * The callback will be executed in the context of the current object. */
     addCleanupAction(cleanupFunction) {
        this.cleanupActions.push(cleanupFunction);
    }

    /** This method cleans up after a delete. Any extending object that has delete
     * actions should pass a callback function to the method "addClenaupAction" 
     * @protected */
    onDelete() {
        
        //execute cleanup actions
        for(var i = 0; i < this.cleanupActions.length; i++) {
            this.cleanupActions[i].call(this);
        }
    }

    /** This method writes any data fields associated with the component. */
    writeExtendedData(json,modelManager) {
        let componentFieldMap = this._getComponentFieldDefs();
        if(componentFieldMap) {
            let fieldsJson = {};
            let hasFields = false;
            for(let fieldName in componentFieldMap) {
                let fieldValue = this.getField(fieldName);
                let jsonValue;
                if(fieldValue !== undefined) {
                    let fieldTranslators = this._getFieldTranslators(fieldName);
                    if(fieldTranslators) {
                        jsonValue = fieldTranslators.fieldToJson(this,fieldValue,modelManager);
                    }
                    else {
                        jsonValue = fieldValue;
                    }
                    fieldsJson[fieldName] = jsonValue;
                    hasFields = true;
                }
            }
            if(hasFields) {
                json.fields = fieldsJson;
            }
        }
    }

    /** This method reads any data fields associated with the component. */
    loadExtendedData(json,modelManager) {
        if(!json.fields) return;

        let componentFieldMap = this._getComponentFieldDefs();
        if(componentFieldMap) {
            for(let fieldName in componentFieldMap) {
                let newJsonValue = json.fields[fieldName];
                let newFieldValue;
                if(newJsonValue !== undefined) {
                    let fieldTranslators = this._getFieldTranslators(fieldName);
                    if(fieldTranslators) {
                        newFieldValue = fieldTranslators.jsonToField(this,newJsonValue,modelManager);
                    }
                    else {
                        newFieldValue = newJsonValue;
                    }

                    let oldFieldValue = this.getField(fieldName);
                    if(!_.isEqual(newFieldValue,oldFieldValue)) {
                        this.setField(fieldName,newFieldValue);
                    }
                }
            }
        }
    }

    //==============================
    // Private Methods
    //==============================

    //------------------------
    // Field Change Handlers - This allows actions when a local field changes
    //------------------------

    _onComponentFieldChange(fieldName,fieldValue) {
        let handlerList = this.componentFieldChangeHandlers[fieldName];
        if(handlerList) {
            handlerList.forEach(handler => handler(fieldValue))
        }
    }

    //-----------------------
    // Configuation Property Accessors
    //-----------------------


    _getDefaultMemberJson() {
        return this.componentConfig.defaultMemberJson;
    }

    _getComponentFieldDefs() {
        let componentJson = this.componentConfig.defaultComponentJson;
        return componentJson.fields ? componentJson.fields : {};
    }

    _getFieldTranslators(fieldName) {
        if((this.componentConfig.fieldTranslators)&&(this.componentConfig.fieldTranslators[fieldName])) {
            return this.componentConfig.fieldTranslators[fieldName];
        }
        else {
            return null;
        }
    }

    /** This function processes the members associated with this component, using the default json
     * to look up the member instances. This includes registering the each member, saving the member in its
     * associated field, and constructing the member field map.  */
    _processMemberAndChildren(modelManager,member,memberJson,memberFieldName,isMainMember,memberFieldMap) {

        //register the member with the model manager
        modelManager.registerMember(member.getId(),this,isMainMember);

        //add to the local member field map
        memberFieldMap[member.getId()] = memberFieldName;

        //save the member in its component field
        this.setField(memberFieldName,member);
        
        //process the children of this member if they are a part of this component
        if((memberJson.children)&&(memberFieldName != this.childParentFolderFieldName)) {
            let model = modelManager.getModel();
            for(let childName in memberJson.children) {
                let childMember = member.lookupChild(model,childName);
                let childMemberJson = memberJson.children[childName];
                let childMemberFieldName = memberFieldName + "." + childName;
                let childIsMainMember = false;
                this._processMemberAndChildren(modelManager,childMember,childMemberJson,childMemberFieldName,childIsMainMember,memberFieldMap);
            }
        }
    }

}

//======================================
// Implementation specific component static members
//======================================

// ExtendingComponent.CLASS_CONFIG = {
//     componentClass: The class which should be instantiated to make this component.
//     displayName: The display name for this compononent - REQUIRED
//     defaultMemberJson: The JSON that creates the default members for this component
//     defaultComponentJson: The JSON that creates the default component.
//     fieldTranslators: functions to convert between field values and the json value during save and load. This can be 
//         omitted if the field value and the json value are the same. It is used if the json in converted on load or save. OPTIONAL
// }
