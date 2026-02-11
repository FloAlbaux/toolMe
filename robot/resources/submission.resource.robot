*** Settings ***
Library    Browser
Resource   variables.robot

*** Keywords ***
Click Propose Deliverable On Project Detail
    Wait For Elements State    role=link[name="${PROJECT_APPLY_CTA}"]    visible    timeout=10s
    Click    role=link[name="${PROJECT_APPLY_CTA}"]
    Wait For Load State    networkidle
    Wait For Elements State    [id="${APPLY_MESSAGE_ID}"]    visible    timeout=15s

Fill Apply Form
    [Arguments]    ${message}    ${link}=
    Wait For Elements State    [id="${APPLY_MESSAGE_ID}"]    visible    timeout=10s
    Fill Text    [id="${APPLY_MESSAGE_ID}"]    ${message}
    Run Keyword If    "${link}" != ""    Fill Text    [id="${APPLY_LINK_ID}"]    ${link}

Submit Apply Form
    Click    role=button[name="${APPLY_SUBMIT_TEXT}"]
    Wait For Load State    networkidle

Apply Page Shows Success
    Get Element    text=${APPLY_SUCCESS_TITLE}

Go To My Submissions Page
    Go To    ${BASE_URL}/my-submissions
    Wait For Load State    networkidle

Go To My Submissions Via Link
    # Prefer the link in main content (success page CTA); header also has "My submissions"
    Click    role=main >> role=link[name="${MY_SUBMISSIONS_TITLE}"]
    Wait For Load State    networkidle

My Submissions Page Shows Title
    Wait For Elements State    text=${MY_SUBMISSIONS_TITLE}    visible    timeout=15s

My Submissions Page Has At Least One Submission
    # Use CSS selector; role=link[href^=...] is invalid in Playwright (href not allowed on role locator)
    ${links}=    Get Elements    a[href^="/submission/"]
    ${count}=    Get Length    ${links}
    Should Be True    ${count} >= 1    msg=Expected at least one submission link on My submissions page

Click First Submission Link
    Click    a[href^="/submission/"] >> nth=0
    Wait For Load State    networkidle

Submission Detail Shows Thread Heading
    Wait For Elements State    text=${SUBMISSION_DETAIL_THREAD}    visible    timeout=15s

Submission Detail Shows Message
    [Arguments]    ${text}
    Get Element    text=${text}

Current Path Is My Submissions
    Current Path Is    /my-submissions

Current Path Is Submission Detail
    ${url}=    Get Url
    Should Contain    ${url}    /submission/
