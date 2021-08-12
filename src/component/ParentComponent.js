import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    /** This returns the folder member which holds the child content. */
    getParentFolderForChildren() {
        let contentFolderFieldPath = this.constructor.getConfigField("contentFolderFieldPath");
        return this.getDirectChildMember(contentFolderFieldPath);
    }

    /** This serializes the table component. */
    writeExtendedData(json,modelManager) {
        super.writeExtendedData(json,modelManager);
        
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

        return json;
    }

    /** This method loads the children for this component */
    loadChildrenFromJson(modelManager,componentJson) {
        if(componentJson.children) {
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
    loadPropertyValues(modelManager,propertyJson) {
        super.loadPropertyValues(modelManager,propertyJson);

        //load properties in child components if needed
        if(propertyJson.children) {
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
    }

    
	//////////////////////////////////////////////
	// Child accessor methods - move this later
	////////////////////////////////////////////////

	//for parent components!
	getChildComponent(modelManager,componentPath) {
		if((!componentPath)||(componentPath == ".")) {
			return this;
		}
		else {
			let componentPathArray = ParentComponent.getPathArrayFromPath(componentPath);
			return ParentComponent._getChildComponentImpl(modelManager,this,componentPathArray);
		}
	}

	//make this static too?
	/** This converts a component or member path to a path array. */
	static getPathArrayFromPath(path) {
		if((!path)||(path == ".")) {
			return [];
		}
		else {
			return path.split(",").map(entry => entry.trim());
		}
	}

	//maybe make this static?
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

	//for parent components!!!
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

}

//add this flag to the object so we can test it (without checking the instance type)
//ParentComponent.prototype.isParentComponent = true;

//The following config property should be added to indicate the field name for the folder member which holds the children.
//ExtendingComponent.CLASS_CONFIG.contentFolderFieldName