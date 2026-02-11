*** Settings ***
Suite Teardown    Close Browser
Resource         ../resources/auth.resource.robot
Resource         ../resources/project.resource.robot
Resource         ../resources/variables.robot

*** Test Cases ***
Non Owner Cannot See Edit And Delete On Project Detail
    # Owner creates project
    Open App And Go To Signup
    ${owner_email}=    Evaluate    "owner-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${owner_email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${owner_email}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot NonOwner View ${r}
    ${project_id}=    Create Project As User    ${project_title}
    Click Logout
    Wait For Load State    networkidle
    # Other user signs up and goes to project detail
    Go To    ${BASE_URL}/signup
    ${other_email}=    Evaluate    "other-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${other_email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Sleep    1s
    Header Shows Logged In    ${other_email}
    Go To Project Detail From Home By Title    ${project_title}
    Edit Link Should Not Be Visible
    Delete Button Should Not Be Visible

Non Owner Redirected When Accessing Project Edit Url
    Open App And Go To Signup
    ${owner_email}=    Evaluate    "owner-edit-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${owner_email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${owner_email}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot Edit Redirect ${r}
    ${project_id}=    Create Project As User    ${project_title}
    Click Logout
    Wait For Load State    networkidle
    Go To    ${BASE_URL}/signup
    ${other_email}=    Evaluate    "other-edit-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${other_email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${other_email}
    Go To Project Edit    ${project_id}
    Sleep    2s
    ${url}=    Get Url
    # Non-owner must be redirected to project detail or (if session lost on full load) to login
    ${on_detail}=    Evaluate    "/project/" in "${url}" and "/edit" not in "${url}"
    ${on_login}=    Evaluate    "/login" in "${url}"
    Should Be True    ${on_detail} or ${on_login}    msg=Non-owner should be redirected to detail or login, got ${url}

Owner Can See Edit And Delete On Project Detail
    Open App And Go To Signup
    ${email}=    Evaluate    "owner-actions-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${email}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot Owner Actions ${r}
    ${project_id}=    Create Project As User    ${project_title}
    Go To Project Detail    ${project_id}
    Edit Link Should Be Visible
    Delete Button Should Be Visible

Owner Can Edit Project
    Open App And Go To Signup
    ${email}=    Evaluate    "owner-edit-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${email}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot Edit Original ${r}
    ${project_id}=    Create Project As User    ${project_title}
    Go To Project Detail    ${project_id}
    Click Edit Project
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${new_title}=    Set Variable    Robot Edit Updated ${r}
    Fill Edit Form Title    ${new_title}
    Submit Edit Form
    Current Path Is Project Detail    ${project_id}
    Project Detail Shows Title    ${new_title}

Owner Can Delete Project
    Open App And Go To Signup
    ${email}=    Evaluate    "owner-del-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${email}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot Delete Me ${r}
    ${project_id}=    Create Project As User    ${project_title}
    Go To Project Detail    ${project_id}
    Click Delete Project And Confirm
    Current Path Is    /
    Home Page Does Not Show Project With Title    ${project_title}
