import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    /** This returns the folder member which holds the child content. */
    //Create this for extending classes
    //getParentFolderForChildren();

    /** This serializes the table component. */
    writeExtendedData(json,modelManager) {
        json = super.writeExtendedData(json,modelManager);
        
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

}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;

//The following config property should be added to indicate the field name for the folder member which holds the children.
//ExtendingComponent.CLASS_CONFIG.contentFolderFieldName