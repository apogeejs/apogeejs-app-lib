import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js"

export default function VanillaViewModeElement({component,getDataDisplay,showing,size}) {

    //Store previous "showing" value (maybe in data display too?)
    let wasShowingRef = React.useRef(false)
    const madeVisible = (showing != wasShowingRef.current)
    wasShowingRef.current = showing

    //Get the mutable object for the vanilla javascript display
    let vanillaRef = React.useRef(null)
    let dataDisplay = vanillaRef.current
    if(!dataDisplay) {
        dataDisplay = getDataDisplay(component)
        dataDisplay.setComponent(component)
        vanillaRef.current = dataDisplay     
    }

    //set edit mode state
    let [editMode,setEditMode] = React.useState(false)
    dataDisplay.setEditModeState(editMode,setEditMode)

    if((size)&&(dataDisplay.setSize)) {
        dataDisplay.setSize(size)
    }

    //update if the component changes
    if(dataDisplay.getComponent() != component) { 
        dataDisplay.setComponent(component)
        let {reloadData,reloadDataDisplay} = dataDisplay.doUpdate();

        if(reloadDataDisplay) {
            //this will also reload data
            let oldContentElement = dataDisplay.getContent()
            let parent = oldContentElement.parent
            parent.removeChild(oldContentElement)

            if(dataDisplay.onUnload) dataDisplay.onUnload()
            if(dataDisplay.destroy) dataDisplay.destroy()

            dataDisplay = getDataDisplay(component)
            dataDisplay.setEditModeState(editMode,setEditMode)

            let newContentElement = dataDisplay.getContent()
            parent.appendChild(newContentElement)

            if(dataDisplay.onLoad) dataDisplay.onLoad()
            dataDisplay.showData()
        }
        else if(reloadData) {
            //only update data in display if we are not in edit mode
            if(!dataDisplay.isInEditMode()) {
                dataDisplay.showData()
            }
        }
    }
    else if(madeVisible) {
        //I think we need to do this because of react internal logic - refresh display if we are made visible 
        //(other wise it seems changes made while not visible are not kept)
        dataDisplay.showData()
    }

    //manage adding and removing the vanilla display element
    const viewRef = React.useRef()
    React.useEffect(() => {
        viewRef.current.appendChild(dataDisplay.getContent())
        if(dataDisplay.onLoad) dataDisplay.onLoad()

        //cleanup function
        return () => {
            //figure out how this should work - load unload
            if(dataDisplay.onUnload) dataDisplay.onUnload()
            if(dataDisplay.destroy) dataDisplay.destroy()
        }

    },[])
    
    //render the display
    const msgText = dataDisplay.getMessage()
    const showMsgBar = dataDisplay.getMessageType() != DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
    let msgBarStyle = getMessageBarStyle(dataDisplay.getMessageType())
    const hideDisplay = dataDisplay.getHideDisplay()
    const styleData = hideDisplay ? {display: "none"} : {}

    const onSave = () => dataDisplay.save()
    const onCancel = () => dataDisplay.cancel()

    return (
        <div >
            {showMsgBar ? <div className={msgBarStyle} >{msgText}</div> : ''}
            {editMode ?
                <div className="visiui_displayContainer_saveBarContainerClass">
                    Edit: 
                    <button type="button" onClick={onSave}>Save</button>
                    <button  type="button" onClick={onCancel}>Cancel</button>
                </div> : ''}
            {<div ref={viewRef} className="visiui_displayContainer_viewContainerClass" style={styleData}/>}
        </div>
    )
}

function getMessageBarStyle(messageType) {

    switch(messageType) {
        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR:
            return "visiui_displayContainer_messageContainerClass visiui_displayContainer_messageError"

        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_WARNING:
            return "visiui_displayContainer_messageContainerClass visiui_displayContainer_messageWarning"

        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO:
            return "visiui_displayContainer_messageContainerClass visiui_displayContainer_messageInfo"

        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE:
        default:
            return "visiui_displayContainer_messageContainerClass"
    }
}