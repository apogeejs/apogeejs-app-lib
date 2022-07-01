import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import DataDisplay from "/apogeejs-app-lib/src/datadisplay/DataDisplay.js";
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";
import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js";
import ace from "/apogeejs-releases/releases/ext/ace/v1.4.12/ace.es.js";

/** Editor that uses the Ace text editor.
 * 
 * @param {type} component - component
 * @param {type} aceMode - the display format, such as "ace/mode/json"
 */
export default class AceTextEditor extends DataDisplay {
    
    constructor(aceMode,options) {
        super();

        this.destroyed = false;

        this.editorDiv = uiutil.createElement("div");

        //========================
        //this is for consistency of lines to pixels
        this.editorDiv.style.fontSize = "12px";
        this.editorDiv.style.lineHeight = "1.2";
        this.pixelsPerLine = 14;
        //=========================

        this.aceMode = aceMode;

        this.inputData = null;
        this.cachedDisplayData = null;
        this.dataError = false;

        //configure the options
        if(!options) options = {};

        this.editorOptions = {};
        
        if(options.displayMax) {
            this.maxLines = AceTextEditor.SIZE_COMMAND_INFO.max;
        }
        else {
            this.maxLines = AceTextEditor.SIZE_COMMAND_INFO.default;
        }
        this.editorOptions.maxLines = this.maxLines;
        this.editorOptions.minLines = AceTextEditor.SIZE_COMMAND_INFO.min;
    }
    
    createEditor() {
        if(this.destroyed) return;

        this.editor = ace.edit(this.editorDiv);
        this.editor.setOptions(this.editorOptions);
        this.editor.setHighlightActiveLine(false);
        this.editor.setAutoScrollEditorIntoView(true);
        this.editor.setTheme("ace/theme/eclipse");
        this.editor.getSession().setMode(this.aceMode); 
        this.editor.$blockScrolling = Infinity;
        this.editor.renderer.attachToShadowRoot(); 
        
        this.editor.commands.addCommand({
            name: "Save",
            exec: () => this.save(),
            bindKey: {mac: "cmd-s", win: "ctrl-s"}
        })

        this.editor.commands.addCommand({
            name: "Revert",
            exec: () => this.cancel(),
            bindKey: {mac: "esc", win: "esc"}
        })
        

        //handle focus change
        this.editor.on("blur",() => this.onEditorBlur());
        this.editor.on("focus",() => this.onEditorFocus());
        if(this.editor.isFocused()) {
            this.onEditorFocus();
        }
        else {
            this.onEditorBlur();
        }
        
        // if(this.cachedDisplayData) {
        //     //this.setData(this.cachedDisplayData);
        //     //NEW TEST
        //     this.updateData(this.cachedDisplayData)
        //     this.showDisplay()
        // }
        
        //enter edit mode on change to the data
        this.editor.addEventListener("input",() => this.checkStartEditMode());
    }
    
    getContent() {
        return this.editorDiv;
    }

    /** We override the save function to clear any error if there was one and the
     * user saves - meaning we want to keep the editor data. */
    save() {
        if(this.destroyed) return;

        //clear error flag since the user wants to save what is displayed
        if(this.dataError) this.dataError = false;

        super.save();
    }

    getData() {
        if(this.destroyed) return null;

        if((this.editor)&&(!this.dataError)) {
            this.cachedDisplayData = this.editor.getSession().getValue();
            this.inputData = this.cachedDisplayData;
        }
        return this.inputData; 
    }
    
    // setData(text) {
    //     if(this.destroyed) return;

    //     this.inputData = text;
    //     this.cachedDisplayData = text;
    //     this.dataError = false;

    //     //The data source should give a text value "" if the data in invalid rather than sending
    //     //in a json, but we will do this check anyway.
    //     if(text == apogeeutil.INVALID_VALUE) {
    //         //clear the display
    //         this.cachedDisplayData = "";
    //         //the dispaly shoudl be hidden, but do it again anyway

    //         this.setHideDisplay(true);
    //         this.dataError = true;
    //     }
    //     else if(!apogeeutil.isString(text)) {
    //         this.setMessage(DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO, "Data cannot be shown in editor: value is not text")
    //         this.setHideDisplay(true);
    //         //clear the display
    //         this.cachedDisplayData = "";
    //         this.dataError = true;
    //     }
        
    //     //place ineditor, if it is present
    //     if(this.editor) {
    //         this.editor.getSession().setValue(this.cachedDisplayData);

    //         //set the edit mode and background color
    //         if(this.editOk) {
    //             this.editorDiv.style.backgroundColor = "";
    //             this.editor.setReadOnly(false);
    //         }
    //         else {
    //             this.editorDiv.style.backgroundColor = DATA_DISPLAY_CONSTANTS.NO_EDIT_BACKGROUND_COLOR;
    //             this.editor.setReadOnly(true);
    //         }
    //     }
    // }

    internalUpdateData(text) {
        if(this.destroyed) return;

        this.inputData = text;
        this.cachedDisplayData = text;
        this.dataError = false;

        //The data source should give a text value "" if the data in invalid rather than sending
        //in a json, but we will do this check anyway.
        if(text == apogeeutil.INVALID_VALUE) {
            //we should not come here - the data source should prevent loading this
            this.cachedDisplayData = "Error! Display value is not a valid value!";
            this.dataError = true;
        }
        else if(!apogeeutil.isString(text)) {
            //we should not come here - the data source should prevent loading this
            this.cachedDisplayData = "Error! Display value is not text!";
            this.dataError = true;
        }
    }

    showDisplay() {
        if(this.destroyed) return;
        
        //place ineditor, if it is present
        if(this.editor) {
            this.editor.getSession().setValue(this.cachedDisplayData);

            //send the size command info===========
            let sizeCommandData = {
                previous: this.maxLines,
                constentSize: this.editor.getSession().getLength(),
                min: AceTextEditor.SIZE_COMMAND_INFO.min,
                max: AceTextEditor.SIZE_COMMAND_INFO.max,
                increment: AceTextEditor.SIZE_COMMAND_INFO.increment
            }
            if(this._setSizeCommandData) this._setSizeCommandData(sizeCommandData)
            //======================================

            //set the edit mode and background color
            if(this.getEditOk()) {
                this.editorDiv.style.backgroundColor = "";
                this.editor.setReadOnly(false);
            }
            else {
                this.editorDiv.style.backgroundColor = DATA_DISPLAY_CONSTANTS.NO_EDIT_BACKGROUND_COLOR;
                this.editor.setReadOnly(true);
            }
        }
    }
    
    onLoad() {
        if(this.destroyed) return;

        if(!this.editor) {
            this.createEditor();
        }
        this.editor.resize();
    }

    destroy() {
        this.destroyed = true;

        if(this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
        this.editorDiv = null;
        this.inputData = null;
        this.cachedDisplayData = null;
        this.editorOptions = null;
    }
    
    checkStartEditMode() {
        if(this.destroyed) return;

        if((!this.isInEditMode())&&(this.editor)) {
            var activeData = this.editor.getSession().getValue();
            if(activeData != this.cachedDisplayData) {
                this.onTriggerEditMode();
            }
        }
    }

    onEditorBlur() {
        if(this.editor) {
            this.editor.renderer.$cursorLayer.element.style.display = "none";
            this.editor.renderer.$markerBack.element.style.display = "none";
        }
    }

    onEditorFocus() {
        if(this.editor) {
            this.editor.renderer.$cursorLayer.element.style.display = "";
            this.editor.renderer.$markerBack.element.style.display = "";
        }
    }

    //---------------------------
    // UI State Management
    //---------------------------
    
    /** This method adds any data display state info to the view state json. 
     * By default there is none. Note that this modifies the json state of the view,
     * rather than providing a data object that will by added to it.. */
    addUiStateData(json) {
        if(this.destroyed) return;

        if(this.editorOptions.maxLines) {
            json.height = this.editorOptions.maxLines * this.pixelsPerLine;
        }
    }

    /** This method reads an data display state info from the view state json. */
    readUiStateData(json) {
        if(this.destroyed) return;

        if(json.height) {
            let maxLines = Math.round(json.height / this.pixelsPerLine);
            if(maxLines >= MAX_MAX_LINES) {
                this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
                maxLines = MAX_MAX_LINES;
            }
            else {
                this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
                if(maxLines < DEFAULT_MIN_LINES) {
                    maxLines = DEFAULT_MIN_LINES;
                }
                this.showSomeMaxLines = maxLines;
            }

            this.editorOptions.maxLines = maxLines;

            if(this.editor) {
                this.editor.setOptions(this.editorOptions);
            }
        }
    }

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    setSize(size) {
        if(size < AceTextEditor.SIZE_COMMAND_INFO.min) size = AceTextEditor.SIZE_COMMAND_INFO.min
        else if(size > AceTextEditor.SIZE_COMMAND_INFO.max) size = AceTextEditor.SIZE_COMMAND_INFO.max
        this.maxLines = size;
        //update editor
        this.editorOptions.maxLines = this.maxLines;
        if(this.editor) {
            this.editor.setOptions(this.editorOptions);
        }
    }

    getSize() {
        return this.currentDisplayLinesMax;
    }

}

//options for displaying all or some lines
AceTextEditor.OPTION_SET_DISPLAY_MAX = { "displayMax":true};
AceTextEditor.OPTION_SET_DISPLAY_SOME = { "displayMax":false};

//configuration constants
AceTextEditor.SIZE_COMMAND_INFO = {
    default: 15,
    min: 2,
    max: 100,
    increment: 1
}
