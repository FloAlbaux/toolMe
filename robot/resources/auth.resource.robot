*** Settings ***
Library    Browser
Resource   variables.robot

*** Keywords ***
Open App
    New Browser    chromium    headless=${HEADLESS}
    New Page       ${BASE_URL}

Open App And Go To Signup
    Open App
    Go To    ${BASE_URL}/signup

Open App And Go To Login
    Open App
    Go To    ${BASE_URL}/login

Signup Form Is Visible
    Get Element    [id="${SIGNUP_EMAIL_ID}"]
    Get Element    [id="${SIGNUP_PASSWORD_ID}"]
    Get Element    [id="${SIGNUP_CONFIRM_ID}"]

Fill Signup Email
    [Arguments]    ${email}
    Wait For Elements State    [id="${SIGNUP_EMAIL_ID}"]    visible    timeout=15s
    Fill Text    [id="${SIGNUP_EMAIL_ID}"]    ${email}

Fill Signup Passwords
    [Arguments]    ${password}    ${confirm}=${password}
    Fill Text    [id="${SIGNUP_PASSWORD_ID}"]    ${password}
    Fill Text    [id="${SIGNUP_CONFIRM_ID}"]    ${confirm}

Submit Signup
    Wait For Elements State    role=button[name="${SIGNUP_SUBMIT_TEXT}"]    enabled    timeout=5s
    Click    role=button[name="${SIGNUP_SUBMIT_TEXT}"]

Signup Submit Button Is Disabled
    ${disabled}=    Get Property    role=button[name="${SIGNUP_SUBMIT_TEXT}"]    disabled
    Should Be True    ${disabled}    msg=Expected submit button to be disabled

Signup Submit Button Is Enabled
    Wait For Elements State    role=button[name="${SIGNUP_SUBMIT_TEXT}"]    enabled    timeout=3s
    ${disabled}=    Get Property    role=button[name="${SIGNUP_SUBMIT_TEXT}"]    disabled
    Should Not Be True    ${disabled}    msg=Expected submit button to be enabled

Fill Login
    [Arguments]    ${email}    ${password}
    Fill Text    [id="${LOGIN_EMAIL_ID}"]    ${email}
    Fill Text    [id="${LOGIN_PASSWORD_ID}"]    ${password}

Submit Login
    Click    role=button[name="${LOGIN_SUBMIT_TEXT}"]

Header Shows Logged Out
    Get Element    role=link[name="${HEADER_LOGIN_LINK}"]
    Get Element    role=link[name="${HEADER_CREATE_ACCOUNT}"]

Header Shows Logged In
    [Arguments]    ${email}
    Get Element    role=banner >> text=/${email}/
    Get Element    role=button[name="${HEADER_LOGOUT}"]

Click Logout
    Click    role=button[name="${HEADER_LOGOUT}"]

Current Path Is
    [Arguments]    ${path}
    ${url}=    Get Url
    ${expected}=    Set Variable If    "${path}"=="/"    ${BASE_URL}/    ${BASE_URL}${path}
    Should Be Equal    ${url}    ${expected}

Page Contains Text
    [Arguments]    ${text}
    Get Element    text=${text}

Page Shows Error
    [Arguments]    ${text}
    ${content}=    Get Text    role=alert
    Should Contain    ${content}    ${text}

Go To Publish
    Go To    ${BASE_URL}/publish

Go To Home
    Go To    ${BASE_URL}/

Go To Signup Via Header
    Click    role=banner >> role=link[name="${HEADER_CREATE_ACCOUNT}"]
    Wait For Elements State    [id="${SIGNUP_EMAIL_ID}"]    visible    timeout=15s

Go To Signup With Full Reload
    New Page    ${BASE_URL}/signup
    Wait For Load State    networkidle
    Wait For Elements State    [id="${SIGNUP_EMAIL_ID}"]    visible    timeout=15s
