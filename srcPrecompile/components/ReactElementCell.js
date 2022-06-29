import Component from "/apogeejs-app-lib/src/component/Component.js"
import Apogee from "/apogeejs-app-lib/src/Apogee.js"
import {jsxTransform} from "./JsxTransformer.js"

import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js"

/** This method creates the resource. */
function onJsxCodeUpdate(component,jsxCode) {
    try {
//KLUDGE!!
        let jsxFunction = `
function __createJsx(props) {
${jsxCode}
}        
        `
        const transformedJsxCode = jsxTransform(jsxFunction);

let functionBody = `
${transformedJsxCode.code}
return __createJsx(props)
`

        //transformedJsxCode.code
        let actionData = {
            action: "updateCode",
            memberId: component.getMember().getId(),
            argList: ["props"],
            functionBody: functionBody,
            supplemenatlCode: ""
        }

        //Another KLUDGE
        //Lookup the model id from the run context and send a future command
        let app = component.getApp();
        let appRunContext = app.getRunContext();

        setTimeout(() => {
            let model = appRunContext.getConfirmedModel(); //THis is not necessarily the current model, but it is the current model id
            let modelId = model.getId();
            appRunContext.futureExecuteAction(modelId,actionData)
        },0);

    }
    catch(error) {
        //how do I send an error to a function member?
        //I think set data is no allowed, which is the usual way to set an error

        apogeeUserAlert("Error converter JSX code: " + error.toString());
    }
}

function getOutputElement(component) {
    let elementMember = component.getField("jsx.member");
    if(elementMember.getState() == apogeeutil.STATE_NORMAL) {
        return elementMember.getData();
    }
    else {
        //return <div>Error in JSX code</div>
        return 
    }
}

const ReactElementCellConfig = {
    componentClass: Component,
    displayName: "React Element Cell",
    defaultMemberJson: {
        "type": "apogee.FunctionMember",
        "fields": {
            "argList": [],
            "functionBody": "",
            "supplementalCode": ""
        }
    },
    defaultComponentJson: {
        type: "apogeeapp.ReactElementCell",
        fields: {
            jsxCode: ""
        }
    },
    fieldFunctions: {
		jsxCode: {
			fieldChangeHandler: onJsxCodeUpdate 
		}
	},

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Display", 
            label: "Display", 
            isActive: true,
            getViewModeElement: (component,showing,size) => getOutputElement(component),
        },
        getAppCodeViewModeEntry("jsxCode",null,"jsxCode","JSX Code",{sourceType: "code", argList:"props", isActive: true /*,textDisplayMode: "ace/mode/js"*/}),
        getFormulaViewModeEntry("member",{name: "convertedCode", label:"Converted Code"})
    ],
    iconResPath: "/icons3/genericCellIcon.png"
}
export default ReactElementCellConfig;






