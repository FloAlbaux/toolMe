*** Settings ***
Library    Browser
Resource   variables.robot

*** Keywords ***
Go To Publish Via Home Link
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Click    role=link[name="${PUBLISH_CTA}"]
    Wait For Load State    networkidle
    Wait For Elements State    [id="${PUBLISH_TITLE_ID}"]    visible    timeout=15s

Fill Publish Form
    [Arguments]    ${title}    ${domain}=Web    ${short_desc}=Short    ${full_desc}=Full    ${deadline}=2030-12-31
    Fill Text    [id="${PUBLISH_TITLE_ID}"]    ${title}
    Fill Text    [id="${PUBLISH_DOMAIN_ID}"]    ${domain}
    Fill Text    [id="${PUBLISH_SHORT_ID}"]    ${short_desc}
    Fill Text    [id="${PUBLISH_FULL_ID}"]    ${full_desc}
    Fill Text    [id="${PUBLISH_DEADLINE_ID}"]    ${deadline}

Submit Publish Form
    Click    role=button[name="${PUBLISH_SUBMIT_TEXT}"]
    Wait For Load State    networkidle
    FOR    ${i}    IN RANGE    30
        ${url}=    Get Url
        Exit For Loop If    "/project/" in "${url}"
        Sleep    0.5s
    END
    Wait For Load State    networkidle

Create Project
    [Arguments]    ${title}
    Go To Publish Via Home Link
    Fill Publish Form    ${title}
    Submit Publish Form
    ${url}=    Get Url
    Should Start With    ${url}    ${BASE_URL}/project/
    ${project_id}=    Evaluate    "${url}".split("/project/")[1].split("/")[0].split("?")[0]
    RETURN    ${project_id}

Go To Home Via Header
    Click    role=banner >> role=link[name="${BRAND_NAME}"]
    Wait For Load State    networkidle

Current Page Shows Project With My Ad Tag
    [Arguments]    ${title}
    Wait For Elements State    role=article >> text=/${title}/    visible    timeout=25s
    Get Element    text=${PROJECT_MY_AD_TAG}

Go To My Listings
    Click    role=link[name="${ACCOUNT_PAGE_TITLE}"]
    Wait For Load State    networkidle

My Listings Shows Project
    [Arguments]    ${title}
    Wait For Elements State    role=article >> text=/${title}/    visible    timeout=15s

Click Project Card By Title
    [Arguments]    ${title}
    Wait For Elements State    role=article >> text=/${title}/    visible    timeout=25s
    Click    role=link >> role=article >> text=/${title}/
    Wait For Load State    networkidle

Click Edit On Project Detail
    Click    role=link[name="${PROJECT_EDIT_LINK}"]
    Wait For Load State    networkidle

Fill Edit Form Title
    [Arguments]    ${new_title}
    Fill Text    id=edit-title    ${new_title}

Submit Edit Form
    Click    role=button[name="${PROJECT_EDIT_LINK}"]
    Wait For Load State    networkidle
    FOR    ${i}    IN RANGE    20
        ${url}=    Get Url
        Exit For Loop If    "/edit" not in "${url}" and "/project/" in "${url}"
        Sleep    0.5s
    END

Project Detail Shows Title
    [Arguments]    ${title}
    Get Element    role=article >> text=/${title}/

Click Delete And Confirm
    Handle Future Dialogs    action=accept
    Click    role=button[name="${PROJECT_DELETE_BUTTON}"]
    Wait For Load State    networkidle

Home Does Not Show Project
    [Arguments]    ${title}
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Run Keyword And Expect Error    *    Get Element    role=article >> text=/${title}/    timeout=3s
