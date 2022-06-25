
/** This function determines if there is (not) extended error information to display. */
export function isErrorElementRemoved(component) {
    if(component.getState() == apogeeutil.STATE_ERROR) {
        let extendedErrorInfoPresent = false;
        const errorInfo = component.getErrorInfo()
        if(errorInfo) {
            //check for detail in error info
            if(errorInfo.multiMember) {
                extendedErrorInfoPresent = ((errorInfo.memberErrorList) &&
                    (errorInfo.memberErrorList.some(memberErrorInfo => isExtendedInfoInMemberErrorInfo(memberErrorInfo))))
            }
            else {
                extendedErrorInfoPresent = isExtendedInfoInMemberErrorInfo(errorInfo)
            }
        }
        return !extendedErrorInfoPresent
    }
    else {
        //no error info present
        return true
    }
}

function isExtendedInfoInMemberErrorInfo(memberErrorInfo) {
    return ((memberErrorInfo.errorInfoList)&&(memberErrorInfo.errorInfoList.length > 0))
} 

export function getStandardErrorSourceState(component) {
    return {
        state: component.getState(),
        errorInfo: component.getErrorInfo
    }
}

export function StandardErrorElement({sourceState, cellShowing}) {
    //do something better if there is not an error
    if(sourceState != apogeeutil.STATE_ERROR) {
        return <div>No error</div>
    }

    return (
        <div className="errorDisplay_main">
            {_getErrorInfoElement(sourceState.errorInfo)}
        </div>
    )
}


function _getErrorInfoElement(errorInfo) {
    if(!errorInfo) {
        //we should not be showing error display in this case
        return <EmptyExtendedErrorElement />
    }

    if(errorInfo.multiMember) {
        return <MultiMemberErrorElement errorInfo={errorInfo} />
    }
    else if((errorInfo.errorInfoList)&&(errorInfo.errorInfoList.length > 0)) {
        return <>
            {errorInfo.errorInfoList.map(errorInfo => <GeneralErrorElement errorInfo={errorInfo} />)}
        </>
    }
    else {
        //we should not be showing error display in this case
        return <EmptyExtendedErrorElement />
    }
}

function MultiMemberErrorElement({errorInfo}) {
    if((!errorInfo.memberErrorList)||(errorInfo.memberErrorList.length == 0)) {
        //we should not show error display in this case
        return <EmptyExtendedErrorElement />
    }

    return (
        <>
            {errorInfo.memberErrorList.map( memberData => {
                if(memberData.errorInfoList) {
                    return (
                        <>
                            <div className="errorDisplay_sectionHeadingDiv2">{memberData.name}</div>
                            {memberData.errorInfoList.map(errorInfo => _getErrorInfoElement(errorInfo))}
                        </>
                    )
                }
                else {
                    //no info for this member (if all are empty we should not display error data)
                    ''
                }
            })}
        </>
    )

}

function GeneralErrorElement({errorInfo}) {
    let elements = []
    if(errorInfo.description) elements.push(<ErrorDescriptionElement description={errorInfo.description} />)
    if(errorInfo.errors) elements.push(<ErrorCodeErrorsElement codeErrors={errorInfo.errors} />)
    if(errorInfo.stack) elements.push(<ErrorStackElement stackTrace={errorInfo.stack} />)
    if(errorInfo.memberTrace) elements.push(<ErrorMemberTraceElement memberTrace={errorInfo.memberTrace} />)
    if(errorInfo.code) elements.push(<ErrorCodeElement code={errorInfo.code} />)

    if(elements.length > 0) {
        return <div className="errorDisplay_sectionDiv">{elements}</div>
    }
    else {
        //We would like this not to happen
        return ''
    }
}

function EmptyExtendedErrorElement() {
    return (
        <div className="errorDisplay_sectionDiv">
            <div className="errorDisplay_sectionHeadingDiv3">No extended error info available</div>
        </div>
    )
}

function ErrorDescriptionElement({description}) {
    return (
        <div className="errorDisplay_sectionDiv">
            <div className="errorDisplay_descriptionSectionDiv">{description}</div>
        </div>
    )
}

function ErrorCodeErrorsElement({codeErrors}) {
    return (
        <div className="errorDisplay_sectionDiv">
            {codeErrors.map(codeError => {
                return (
                    <>
                        {codeError.description ? <div key="description" className="errorDisplay_sectionHeadingDiv2">{codeError.description}</div> : ''}
                        {codeError.lineNumber ? <div key="lineNumber" className="errorDispaly_sectionLabelLineDiv">
                                <span className="errorDisplay_sectionLineLabelSpan">Line Number: </span>
                                <span className="errorDisplay_sectionLineTextSpan">{codeError.lineNumber}</span>
                            </div> : ''}
                        {codeError.column ? <div key="column" className="errorDispaly_sectionLabelLineDiv">
                                <span className="errorDisplay_sectionLineLabelSpan">Column: </span>
                                <span className="errorDisplay_sectionLineTextSpan">{codeError.column}</span>
                            </div> : ''}
                        {codeError.index ? <div key="index" className="errorDispaly_sectionLabelLineDiv">
                                <span className="errorDisplay_sectionLineLabelSpan">Index: </span>
                                <span className="errorDisplay_sectionLineTextSpan">{codeError.index}</span>
                            </div> : ''}
                    </>
                )
            })}
        </div>
    )
}

function ErrorStackElement({stackTrace}) {
    return (
        <div className="errorDisplay_sectionDiv">
            <div className="errorDisplay_sectionHeadingDiv1">Stack Trace</div>
            <pre className="errorDisplay_stackTraceDiv">{stackTrace}</pre>
        </div>
    )
}

function ErrorMemberTraceElement({memberTrace}) {
    if(!Array.isArray(memberTrace)) {
        return ''
    }

    return (
        <div className="errorDisplay_sectionDiv">
            <div className="errorDisplay_sectionHeadingDiv1">Member Code</div>
            {memberTrace.map(memberEntry => {
                return (
                    <>
                        {memberEntry.name ? <div key="description" className="errorDisplay_sectionHeadingDiv2">{memberEntry.name}</div> : ''}
                        {memberEntry.code ? <CodeElement code={memberEntry.code} /> : ''}
                    </>
                )
            })}
        </div>
    )
}

function ErrorCodeElement({code}) {
    return (
        <div className="errorDisplay_sectionDiv">
            <div className="errorDisplay_sectionHeadingDiv1">Code</div>
            <CodeElement code={code} />
        </div>
    )
}

function CodeElement({code}) {

    //split code into lines, each will be numbered
    let lineArray = code.split("\n");

    let className
    //-------------------
    //this is a clumsy way of adjusting the number line gutter for longer code
    //but I am not sure how I should do this.
    //if the code is longer then 10000 then they have to deal with the line numbers going outside the gutter for now.
    if((lineArray.length > 99)&&(lineArray.length < 1000)) {
        className = "errorDisplay_codeSection errorDisplay_longCode"
    }
    else if(lineArray.length > 1000) {
        className = "errorDisplay_codeSection errorDisplay_veryLongCode"
    }
    else {
        className = "errorDisplay_codeSection"
    }
    //-------------------

    return (
        <pre className={className}>
            {lineArray.map(line => <code>{line + '\n'}</code>)}
        </pre>
    );
}





