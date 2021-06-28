import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a table object. */
export default class DynamicForm extends Component {
        
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //extend edit component
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    };

}

//======================================
// This is the component generator, to register the component
//======================================

DynamicForm.displayName = "Legacy Action Form Cell (deprecated)";
DynamicForm.uniqueName = "apogeeapp.ActionFormCell";
DynamicForm.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FunctionMember",
    "updateData": {
        "argList": ["admin"]
    }
};
