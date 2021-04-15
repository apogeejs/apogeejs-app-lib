import JsonTableComponent from "/apogeejs-app-lib/src/components/JsonTableComponent.js";
import FunctionComponent from "/apogeejs-app-lib/src/components/FunctionComponent.js";
import FolderComponent from "/apogeejs-app-lib/src/components/FolderComponent.js";
import FolderFunctionComponent from "/apogeejs-app-lib/src/components/FolderFunctionComponent.js";
import DynamicForm from "/apogeejs-app-lib/src/components/DynamicForm.js";
import FormDataComponent from "/apogeejs-app-lib/src/components/FormDataComponent.js";
import CustomComponent from "/apogeejs-app-lib/src/components/CustomComponent.js";
import CustomDataComponent from "/apogeejs-app-lib/src/components/CustomDataComponent.js";
import WebRequestComponent from "/apogeejs-app-lib/src/components/WebRequestComponent.js";
import ErrorComponent from "/apogeejs-app-lib/src/components/ErrorComponent.js";

import ActionFormComponent from "/apogeejs-app-lib/src/components/ActionFormComponent.js";
import DataFormComponent from "/apogeejs-app-lib/src/components/DataFormComponent.js";

//JSON PLUS COMPONENT
import JsonPlusTableComponent from "/apogeejs-app-lib/src/components/JsonPlusTableComponent.js";

/** This module initializes the default component classes. */

let componentInfo = {};
export {componentInfo as default};

let componentClasses = {};
let standardComponents = [];
let additionalComponents = [];
let pageComponents = [];

//==========================
// Functions
//==========================

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
componentInfo.registerComponent = function(componentClass) {
    var name = componentClass.uniqueName;

    //we should maybe warn if another component bundle is being overwritten
    componentClasses[name] = componentClass;
    if(additionalComponents.indexOf(name) < 0) {
        additionalComponents.push(name);
    }
}

/** This method registers a component. */
componentInfo.registerStandardComponent = function(componentClass) {
    var name = componentClass.uniqueName;

    //we should maybe warn if another component bundle is being overwritten 
    componentClasses[name] = componentClass;
    if(standardComponents.indexOf(name) < 0) {
        standardComponents.push(name);
    }
}

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
componentInfo.registerPageComponent = function(componentClass) {
    var name = componentClass.uniqueName;

    //we should maybe warn if another component bundle is being overwritten
    componentClasses[name] = componentClass;
    if(pageComponents.indexOf(name) < 0) {
        pageComponents.push(name);
    }
}

/** This method unregisters a component. Note this method does not fire
 * a event (for now at least) */
componentInfo.unregisterComponent = function(componentClass) {
    var name = componentClass.uniqueName;
 
    delete componentClasses[name];
    let stdIndex = standardComponents.indexOf(name);
    if(stdIndex >= 0) {
        standardComponents.splice(stdIndex,1);
    }
    else {
        let pageIndex = pageComponents.indexOf(name);
        if(pageIndex >= 0) {
            standardComponents.splice(pageIndex,1);
        }
    }
}

/** This method returns a component generator of a given name. */
componentInfo.getComponentClass = function(name) {
    return componentClasses[name];
}

componentInfo.getStandardComponentNames = function() {
    return standardComponents;
}

componentInfo.getAdditionalComponentNames = function() {
    return additionalComponents;
}

componentInfo.getPageComponentNames = function() {
    return pageComponents;
}

//===============================
//initialization
//===============================

//register standard child components
componentInfo.registerStandardComponent(JsonTableComponent);
componentInfo.registerStandardComponent(FunctionComponent);
componentInfo.registerStandardComponent(FolderFunctionComponent);
componentInfo.registerStandardComponent(ActionFormComponent);
componentInfo.registerStandardComponent(DataFormComponent);
componentInfo.registerStandardComponent(WebRequestComponent);

//additional child components
componentInfo.registerComponent(CustomComponent);
componentInfo.registerComponent(CustomDataComponent);

componentInfo.registerPageComponent(FolderComponent);
componentInfo.registerPageComponent(FolderFunctionComponent);

//other components
componentInfo.FOLDER_COMPONENT_CLASS = FolderComponent;
componentInfo.ERROR_COMPONENT_CLASS = ErrorComponent;

//legacy forms
componentInfo.registerComponent(DynamicForm);
componentInfo.registerComponent(FormDataComponent);

//JSON PLUS COMPONENT
componentInfo.registerComponent(JsonPlusTableComponent);




