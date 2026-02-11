*** Settings ***
Library    Browser
Resource   variables.robot

*** Keywords ***
Go To Publish Page
    # Use in-app link to avoid full reload and preserve auth state (cross-origin cookie)
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Click    role=link[name="${PUBLISH_CTA}"]
    Wait For Load State    networkidle
    Wait For Elements State    [id="${PUBLISH_TITLE_ID}"]    visible    timeout=15s

Fill Publish Form
    [Arguments]    ${title}    ${domain}    ${short_desc}    ${full_desc}    ${deadline}    ${delivery}=
    Wait For Elements State    [id="${PUBLISH_TITLE_ID}"]    visible    timeout=25s
    Fill Text    [id="${PUBLISH_TITLE_ID}"]    ${title}
    Fill Text    [id="${PUBLISH_DOMAIN_ID}"]    ${domain}
    Fill Text    [id="${PUBLISH_SHORT_ID}"]    ${short_desc}
    Fill Text    [id="${PUBLISH_FULL_ID}"]    ${full_desc}
    Fill Text    [id="${PUBLISH_DEADLINE_ID}"]    ${deadline}
    Run Keyword If    "${delivery}" != ""    Fill Text    [id="${PUBLISH_DELIVERY_ID}"]    ${delivery}

Submit Publish Form
    Click    role=button[name="${PUBLISH_SUBMIT_TEXT}"]
    Wait For Load State    networkidle
    # Client-side navigation: wait for URL to contain /project/
    FOR    ${i}    IN RANGE    30
        ${url}=    Get Url
        Exit For Loop If    "/project/" in "${url}"
        Sleep    0.5s
    END
    Wait For Load State    networkidle

Create Project As User
    [Arguments]    ${title}    ${domain}=Web    ${short_desc}=Short    ${full_desc}=Full description    ${deadline}=2030-12-31
    Go To Publish Page
    Fill Publish Form    ${title}    ${domain}    ${short_desc}    ${full_desc}    ${deadline}
    Submit Publish Form
    ${url}=    Get Url
    Should Start With    ${url}    ${BASE_URL}/project/    msg=Expected redirect to project detail after publish
    ${project_id}=    Evaluate    "${url}".split("/project/")[1].split("/")[0].split("?")[0]
    RETURN    ${project_id}

Go To Project Detail
    [Arguments]    ${project_id}
    Go To    ${BASE_URL}/project/${project_id}
    Wait For Load State    networkidle

Go To Project Detail From Home By Title
    [Arguments]    ${title}
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Click    role=link >> role=article >> text=/${title}/
    Wait For Load State    networkidle

Go To Project Edit
    [Arguments]    ${project_id}
    Go To    ${BASE_URL}/project/${project_id}/edit
    Wait For Load State    networkidle

Edit Link Should Be Visible
    Get Element    role=link[name="${PROJECT_EDIT_LINK}"]

Edit Link Should Not Be Visible
    Run Keyword And Expect Error    *    Get Element    role=link[name="${PROJECT_EDIT_LINK}"]    timeout=2s

Delete Button Should Be Visible
    Get Element    role=button[name="${PROJECT_DELETE_BUTTON}"]

Delete Button Should Not Be Visible
    Run Keyword And Expect Error    *    Get Element    role=button[name="${PROJECT_DELETE_BUTTON}"]    timeout=2s

Click Edit Project
    Click    role=link[name="${PROJECT_EDIT_LINK}"]
    Wait For Load State    networkidle

Click Delete Project And Confirm
    Handle Future Dialogs    action=accept
    Click    role=button[name="${PROJECT_DELETE_BUTTON}"]
    Wait For Load State    networkidle

Project Detail Shows Title
    [Arguments]    ${title}
    Get Element    role=article >> text=/${title}/

Home Page Shows Project With Title
    [Arguments]    ${title}
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Get Element    role=article >> text=/${title}/

Home Page Shows My Ad Tag
    [Arguments]    ${title}
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Get Element    role=article >> text=/${title}/
    Get Element    text=${PROJECT_MY_AD_TAG}

Home Page Does Not Show Project With Title
    [Arguments]    ${title}
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Run Keyword And Expect Error    *    Get Element    role=article >> text=/${title}/    timeout=3s

Go To Account Page
    Go To    ${BASE_URL}/account
    Wait For Load State    networkidle

Go To Account Page Via Header
    Click    role=link[name="${ACCOUNT_PAGE_TITLE}"]
    Wait For Load State    networkidle

Account Page Shows Project With Title
    [Arguments]    ${title}
    Go To Account Page Via Header
    Wait For Elements State    role=article >> text=/${title}/    visible    timeout=15s

Account Page Shows My Listings Heading
    Go To Account Page
    Get Element    role=heading[name="${ACCOUNT_PAGE_TITLE}"]

Edit Page Shows Form
    Get Element    id=edit-title
    Get Element    role=button[name="Edit"]

Current Path Is Project Detail
    [Arguments]    ${project_id}
    Current Path Is    /project/${project_id}

Current Path Is Project Edit
    [Arguments]    ${project_id}
    Current Path Is    /project/${project_id}/edit

Fill Edit Form Title
    [Arguments]    ${new_title}
    Fill Text    id=edit-title    ${new_title}

Submit Edit Form
    Click    role=button[name="Edit"]
    Wait For Load State    networkidle
    # Client-side redirect to project detail (URL loses /edit)
    FOR    ${i}    IN RANGE    20
        ${url}=    Get Url
        Exit For Loop If    "/edit" not in "${url}" and "/project/" in "${url}"
        Sleep    0.5s
    END
