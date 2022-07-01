export default function VanillaViewModeElement({displayState,dataState,hideDisplay,save,inEditMode,setEditModeData,verticalSize,cellShowing,getDataDisplay}) {

    //this is just for debugging
    let [identifier,setIdentifier] = React.useState(() => apogeeutil.getUniqueString())

    //Get the mutable object for the vanilla javascript display
    let vanillaRef = React.useRef(null)

    let previousStateRef = React.useRef(null)
    let previousState = previousStateRef.current

    let reloadData = false

    let dataDisplay = vanillaRef.current
    if( (!dataDisplay) || (previousState && (previousState.displayState != displayState) )) {
        //PRIOBABLY CLEAN UP HOW I DO THIS
        dataDisplay = getDataDisplay(displayState)
        dataDisplay.setDataState(dataState)
        vanillaRef.current = dataDisplay 
        reloadData = true
    }
    else if(previousState && (previousState.dataState != dataState))  {
        dataDisplay.setDataState(dataState)
        reloadData = true
    }
    else if(previousState && previousState.inEditMode && !inEditMode) {
        //edit mode canceled - reload the old data
        reloadData = true
    }
    else if( (previousState) && (((!previousState.cellShowing)&&(cellShowing)) || ((previousState.hideDisplay)&&(!hideDisplay))) ) {
        //reload the data if the cell is set to showing from not showing
        reloadData = true
    }

    //we don't need to check whether or not there was any change here. Resetting is OK
    dataDisplay.setEditModeInfo(inEditMode,setEditModeData)
    dataDisplay.setSave(save)

    //store the previous state
    previousStateRef.current = {displayState, dataState, hideDisplay, cellShowing, inEditMode}

    //hide/show display element
    const styleData = hideDisplay ? {display: "none"} : {}

    //---------------
    //manage the vanilla display element
    //---------------
    const viewRef = React.useRef()

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

    },[dataDisplay])

    //update data display content
    React.useEffect(() => {
        if(reloadData) {
            dataDisplay.showDisplay()
        }
    })

    //udpate display size
    React.useEffect(() => {
        if((dataDisplay.setSize)&&(verticalSize !== null)) dataDisplay.setSize(verticalSize)
    },[verticalSize])

    //---------------
    // Render react element
    //---------------

    return (
        <div >
            {<div ref={viewRef} className="visiui_displayContainer_viewContainerClass" style={styleData}/>}
        </div>
    )
}