import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js"

export default function VanillaViewModeElement({component,getDataDisplay,showing,size}) {

    //this is just for debugging
    let [identifier,setIdentifier] = React.useState(() => apogeeutil.getUniqueString())

    //Get the mutable object for the vanilla javascript display
    let vanillaRef = React.useRef(null)
    let dataDisplay = vanillaRef.current
    if(!dataDisplay) {
        dataDisplay = getDataDisplay(component)
        dataDisplay.setComponent(component)

        //NEW CODE TEST
        dataDisplay.updateData()

        vanillaRef.current = dataDisplay     
    }

    //manage adding and removing the vanilla display element
    const viewRef = React.useRef()

    //edit state, for external edit bar
    let [editMode,setEditMode] = React.useState(false)

    let [showDataVersion,setShowDataVersion] = React.useState(0)
    let [reloadDataDisplayVersion,setReloadDataDisplayVersion] = React.useState(0)
    let activeShowDataVersion = showDataVersion
    let activeReloadDataDisplayVersion = reloadDataDisplayVersion
    
    //-----------------
    // Manage the data display wrapper
    //-----------------

    //set edit mode state
    dataDisplay.setEditModeState(editMode,setEditMode)

    //update if the component changes
    if(dataDisplay.getComponent() != component) { 
        dataDisplay.setComponent(component)
        let {reloadData,reloadDataDisplay} = dataDisplay.doUpdate();

        if(reloadDataDisplay) {
            //NEED TO HANDLE EDIT MODE!!!
            //create a new data display
            dataDisplay = getDataDisplay(component)
            dataDisplay.setComponent(component) //WHY ISNT THIS IN THE AOBVE FUNCTION?
            vanillaRef.current = dataDisplay

            //set edit mode state
            dataDisplay.setEditModeState(editMode,setEditMode)

            //NEW CODE TEST
            dataDisplay.updateData()

            activeShowDataVersion = showDataVersion + 1
            setShowDataVersion(activeShowDataVersion) //make this repeat after a certain value?
            activeReloadDataDisplayVersion = reloadDataDisplayVersion + 1
            setReloadDataDisplayVersion(activeReloadDataDisplayVersion) //make this repeat after a certain value?
            
        }
        else if(reloadData) {
            //only update data in display if we are not in edit mode
            if(!dataDisplay.isInEditMode()) {

                //NEW CODE TEST
                dataDisplay.updateData()

                activeShowDataVersion = showDataVersion + 1
                setShowDataVersion(activeShowDataVersion)
            }
        }
    }

    const msgText = dataDisplay.getMessage()
    const showMsgBar = dataDisplay.getMessageType() != DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
    let msgBarStyle = getMessageBarStyle(dataDisplay.getMessageType())
    const hideDisplay = dataDisplay.getHideDisplay()
    const styleData = hideDisplay ? {display: "none"} : {}

    const onSave = () => dataDisplay.save()
    const onCancel = () => dataDisplay.cancel()

    console.log(`render: identifier: ${identifier} hideDisplay: ${hideDisplay} msgText: ${msgText} instance#: ${component.instanceNumber}`)

    //---------------
    //manage the vanilla display element
    //---------------

    //add/remove data display content
    React.useEffect(() => {
        //set the new data display
        viewRef.current.appendChild(dataDisplay.getContent())
        if(dataDisplay.onLoad) dataDisplay.onLoad()

        //cleanup old data display
        return () => {
            viewRef.current.removeChild(dataDisplay.getContent())
            if(dataDisplay.onUnload) dataDisplay.onUnload()
            if(dataDisplay.destroy) dataDisplay.destroy()
        }

    },[activeReloadDataDisplayVersion])

    //update data display content
    React.useEffect(() => {
        console.log(`render: identifier: ${identifier} hideDisplay: ${hideDisplay} msgText: ${msgText} instance#: ${component.instanceNumber}`)
        dataDisplay.showDisplay()
    },[activeShowDataVersion,showing,hideDisplay])

    //udpate display size
    React.useEffect(() => {
        if(dataDisplay.setSize) dataDisplay.setSize(size)
    },[size])

    //---------------
    // Render react element
    //---------------

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