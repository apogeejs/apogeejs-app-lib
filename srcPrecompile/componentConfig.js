import Component from "/apogeejs-app-lib/src/component/Component.js";

import JsonComponentConfig from "/apogeejs-app-lib/src/components/JsonComponent.js";
import FunctionComponentConfig from "/apogeejs-app-lib/src/components/FunctionComponent.js";
import FolderComponentConfig from "/apogeejs-app-lib/src/components/FolderComponent.js";
import FolderFunctionComponentConfig from "/apogeejs-app-lib/src/components/FolderFunctionComponent.js";
import DynamicFormConfig from "/apogeejs-app-lib/src/components/DynamicForm.js";
import FormDataComponentConfig from "/apogeejs-app-lib/src/components/FormDataComponent.js";
import CustomComponentConfig from "/apogeejs-app-lib/src/components/CustomComponent.js";
import CustomDataComponentConfig from "/apogeejs-app-lib/src/components/CustomDataComponent.js";
import WebRequestComponentConfig from "/apogeejs-app-lib/src/components/WebRequestComponent.js";
import {ErrorComponent, ErrorComponentConfig} from "/apogeejs-app-lib/src/components/ErrorComponent.js";

import FullActionFormComponentConfig from "/apogeejs-app-lib/src/components/FullActionFormComponent.js";
import FullDataFormComponentConfig from "/apogeejs-app-lib/src/components/FullDataFormComponent.js";

import DesignerDataFormComponentConfig from "/apogeejs-app-lib/src/components/DesignerDataFormComponent.js";
import DesignerActionFormComponentConfig from "/apogeejs-app-lib/src/components/DesignerActionFormComponent.js";

//JSON PLUS COMPONENT
import JsonPlusComponentConfig from "/apogeejs-app-lib/src/components/JsonPlusComponent.js";

//import ReactElementCellConfig from "/apogeejs-app-lib/src/components/ReactElementCell.js";
import ReactDisplayCellConfig from "/apogeejs-app-lib/src/components/ReactDisplayCell.js";

/** This module initializes the default component classes. */

let componentInfo = {}
export {componentInfo as default}

let componentConfigMap = {}
let components = []
let childComponents = []
let parentComponents = []

//==========================
// Functions
//==========================

/** This method registers a new component. It will be exposed when the user
 * requests to create a new component */
 componentInfo.registerComponent = function(componentConfig) {
    //we should maybe warn if another component bundle is being overwritten
    let componentType = componentConfig.defaultComponentJson.type;
    componentConfigMap[componentType] = componentConfig;
    if(components.indexOf(componentConfig) < 0) {
        components.push(componentConfig);
    }
    if((componentConfig.isParentOfChildEntries)&&(parentComponents.indexOf(componentConfig) < 0)) {
        parentComponents.push(componentConfig);
    }
    if((componentConfig.viewModes)&&(childComponents.indexOf(componentConfig) < 0)) {
        childComponents.push(componentConfig);
    }
}

/** This method unregisters a component. Note this method does not fire
 * a event (for now at least) */
componentInfo.unregisterComponent = function(componentConfig) {
    let componentType = componentConfig.defaultComponentJson.type;
    
    delete componentConfigMap[componentType];
    let index = components.indexOf(componentConfig);
    if(index >= 0) {
        components.splice(index,1);
    }
    index = parentComponents.indexOf(componentConfig);
    if(index >= 0) {
        parentComponents.splice(index,1);
    }
    index = childComponents.indexOf(componentConfig);
    if(index >= 0) {
        childComponents.splice(index,1);
    }
    
}

/** This method returns the component config for the component of a given type. */
componentInfo.getComponentConfig = function(componentType) {
    return componentConfigMap[componentType];
}

/** This method returns a component instance of the given component type. */
componentInfo.createComponentInstance = function(componentType,member,modelManager,specialCaseIdValue) {
    let componentConfig = componentInfo.getComponentConfig(componentType);
    if((!componentConfig)||(componentConfig == ErrorComponentConfig)) {
        return new ErrorComponent(member,modelManager,null,ErrorComponentConfig,specialCaseIdValue)
    }
    
    return new Component(member,modelManager,null,componentConfig,specialCaseIdValue)
}



componentInfo.getComponentConfigs = function() {
    return components;
}

componentInfo.getParentComponentConfigs = function() {
    return parentComponents
}

componentInfo.getChildComponentConfigs = function() {
    return childComponents
}

//===============================
//initialization
//===============================

//register standard child components
componentInfo.registerComponent(FolderComponentConfig);
componentInfo.registerComponent(JsonComponentConfig);
componentInfo.registerComponent(FunctionComponentConfig);
componentInfo.registerComponent(FolderFunctionComponentConfig);
componentInfo.registerComponent(WebRequestComponentConfig);

componentInfo.registerComponent(DesignerDataFormComponentConfig);
componentInfo.registerComponent(DesignerActionFormComponentConfig);

//additional child components
componentInfo.registerComponent(CustomComponentConfig);
componentInfo.registerComponent(CustomDataComponentConfig);
componentInfo.registerComponent(FullActionFormComponentConfig);
componentInfo.registerComponent(FullDataFormComponentConfig);

//legacy forms
componentInfo.registerComponent(DynamicFormConfig);
componentInfo.registerComponent(FormDataComponentConfig);

//JSON PLUS COMPONENT
componentInfo.registerComponent(JsonPlusComponentConfig);

//TESTING
//componentInfo.registerComponent(ReactElementCellConfig);
componentInfo.registerComponent(ReactDisplayCellConfig);




