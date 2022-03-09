//This is a single module that exports the public items from the apogee app namespace
export {default as Apogee} from "/apogeejs-app-lib/src/Apogee.js";
export {default as BaseFileAccess} from "/apogeejs-app-lib/src/BaseFileAccess.js";

export {default as Component} from "/apogeejs-app-lib/src/component/Component.js";

export {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";

export {default as componentInfo} from "/apogeejs-app-lib/src/componentConfig.js";

export {default as AceTextEditor} from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
export {default as ConfigurableFormEditor} from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
export {default as DataDisplay} from "/apogeejs-app-lib/src/datadisplay/DataDisplay.js";
export {default as dataDisplayHelper} from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
export * from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";

export {default as DATA_DISPLAY_CONSTANTS} from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";
export {default as ErrorDisplay} from "/apogeejs-app-lib/src/datadisplay/ErrorDisplay.js";
export {default as HandsonGridEditor} from "/apogeejs-app-lib/src/datadisplay/HandsonGridEditor.js";
export {default as HtmlJsDataDisplay} from "/apogeejs-app-lib/src/datadisplay/HtmlJsDataDisplay.js";
export {default as StandardErrorDisplay} from "/apogeejs-app-lib/src/datadisplay/StandardErrorDisplay.js";

export {default as ace} from "/apogeejs-releases/releases/ext/ace/v1.4.12/ace.es.js";

//initialize the component and command and reference types.
import "/apogeejs-app-lib/src/commandConfig.js";
import "/apogeejs-app-lib/src/referenceConfig.js";

import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

/** This function initializes the resources paths. Thuis covers the following paths
 * - "resources" folder - where the resource images are held
 * - "ace_includes" folder - where ace include files like themes are held
 * The argument includeBasePath can be either a string which is the common base path for the two above fodlers
 * or a object (map) including the folder name as the key and the assoicated base path as the value.
 */
 export function initIncludePath(includePathInfo) {

    if(!includePathInfo.resources) throw new Error("Resources path must be specified");
    if(!includePathInfo.aceIncludes) throw new Error("Ace includes path must be specified");

    //initialize resource path (relative to base path in web page)
    uiutil.initResourcePath(includePathInfo.resources);

    //any needs mode or theme files for the ace editor should go in the folder set below (relative to base path in web page)
    ace.config.set('basePath',includePathInfo.aceIncludes);
}

