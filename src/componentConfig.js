import Component from "/apogeejs-app-lib/src/component/Component.js";

import JsonTableComponentConfig from "/apogeejs-app-lib/src/components/JsonTableComponent.js";
import FunctionComponentConfig from "/apogeejs-app-lib/src/components/FunctionComponent.js";
import FolderComponentConfig from "/apogeejs-app-lib/src/components/FolderComponent.js";
import FolderFunctionComponentConfig from "/apogeejs-app-lib/src/components/FolderFunctionComponent.js";
import DynamicFormConfig from "/apogeejs-app-lib/src/components/DynamicForm.js";
import FormDataComponentConfig from "/apogeejs-app-lib/src/components/FormDataComponent.js";
import CustomComponentConfig from "/apogeejs-app-lib/src/components/CustomComponent.js";
import CustomDataComponentConfig from "/apogeejs-app-lib/src/components/CustomDataComponent.js";
import WebRequestComponentConfig from "/apogeejs-app-lib/src/components/WebRequestComponent.js";
import ErrorComponentConfig from "/apogeejs-app-lib/src/components/ErrorComponent.js";

import FullActionFormComponentConfig from "/apogeejs-app-lib/src/components/FullActionFormComponent.js";
import FullDataFormComponentConfig from "/apogeejs-app-lib/src/components/FullDataFormComponent.js";

import DesignerDataFormComponentConfig from "/apogeejs-app-lib/src/components/DesignerDataFormComponent.js";
import DesignerActionFormComponentConfig from "/apogeejs-app-lib/src/components/DesignerActionFormComponent.js";

//JSON PLUS COMPONENT
import JsonPlusTableComponentConfig from "/apogeejs-app-lib/src/components/JsonPlusTableComponent.js";

/** This module initializes the default component classes. */

let componentInfo = {};
export {componentInfo as default};

let componentConfigMap = {};
let standardComponents = [];
let additionalComponents = [];
let pageComponents = [];

let ERROR_COMPONENT_CONFIG = ErrorComponentConfig;

//==========================
// Functions
//==========================

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
 componentInfo.registerComponent = function(componentConfig) {
    //we should maybe warn if another component bundle is being overwritten
    let componentType = componentConfig.defaultComponentJson.type;
    componentConfigMap[componentType] = componentConfig;
    if(additionalComponents.indexOf(componentType) < 0) {
        additionalComponents.push(componentType);
    }
}

/** This method registers a component. */
componentInfo.registerStandardComponent = function(componentConfig) {
    //we should maybe warn if another component bundle is being overwritten 
    let componentType = componentConfig.defaultComponentJson.type;
    componentConfigMap[componentType] = componentConfig;
    if(standardComponents.indexOf(componentType) < 0) {
        standardComponents.push(componentType);
    }
}

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
componentInfo.registerPageComponent = function(componentConfig) {
    //we should maybe warn if another component bundle is being overwritten
    let componentType = componentConfig.defaultComponentJson.type;
    componentConfigMap[componentType] = componentConfig;
    if(pageComponents.indexOf(componentType) < 0) {
        pageComponents.push(componentType);
    }
}

/** This method unregisters a component. Note this method does not fire
 * a event (for now at least) */
componentInfo.unregisterComponent = function(componentConfig) {
    let componentType = componentConfig.defaultComponentJson.type;
    
    delete componentConfigMap[componentType];
    let stdIndex = standardComponents.indexOf(componentType);
    if(stdIndex >= 0) {
        standardComponents.splice(stdIndex,1);
    }
    else {
        let pageIndex = pageComponents.indexOf(componentType);
        if(pageIndex >= 0) {
            pageComponents.splice(pageIndex,1);
        }
    }
}

/** This method returns the component config for the component of a given type. */
componentInfo.getComponentConfig = function(componentType) {
    return componentConfigMap[componentType];
}

/** This method returns the component config for the component of a given type. */
componentInfo.getComponentDisplayName = function(componentType) {
    let componentConfig = componentInfo.getComponentConfig(componentType);
    if(componentConfig) return componentConfig.displayName;
    else throw new Error("Component config not found: " + componentType);
}

/** This method returns a component instance of the given component type. */
componentInfo.createComponentInstance = function(componentType,member,modelManager,specialCaseIdValue) {
    let componentConfig = componentInfo.getComponentConfig(componentType);
    if(!componentConfig) {
        if(!ERROR_COMPONENT_CONFIG) {
            throw new Error("Application error: error component config not found!");
        }
        componentConfig = ERROR_COMPONENT_CONFIG;
    }

    if(!componentConfig.componentClass) {
        throw new Error("Application error: component class not included in component config!");
    }
    
    return new componentConfig.componentClass(member,modelManager,null,componentConfig,specialCaseIdValue);
}

componentInfo.getStandardComponentTypes = function() {
    return standardComponents;
}

componentInfo.getAdditionalComponentTypes = function() {
    return additionalComponents;
}

componentInfo.getPageComponentTypes = function() {
    return pageComponents;
}

//===============================
//initialization
//===============================

//register standard child components
componentInfo.registerStandardComponent(JsonTableComponentConfig);
componentInfo.registerStandardComponent(FunctionComponentConfig);
componentInfo.registerStandardComponent(FolderFunctionComponentConfig);
componentInfo.registerStandardComponent(WebRequestComponentConfig);

componentInfo.registerStandardComponent(DesignerDataFormComponentConfig);
componentInfo.registerStandardComponent(DesignerActionFormComponentConfig);

//additional child components
componentInfo.registerComponent(CustomComponentConfig);
componentInfo.registerComponent(CustomDataComponentConfig);
componentInfo.registerComponent(FullActionFormComponentConfig);
componentInfo.registerComponent(FullDataFormComponentConfig);

componentInfo.registerPageComponent(FolderComponentConfig);
componentInfo.registerPageComponent(FolderFunctionComponentConfig);

//legacy forms
componentInfo.registerComponent(DynamicFormConfig);
componentInfo.registerComponent(FormDataComponentConfig);

//JSON PLUS COMPONENT
componentInfo.registerComponent(JsonPlusTableComponentConfig);




