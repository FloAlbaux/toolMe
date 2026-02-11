*** Settings ***
Suite Setup       Create Owner And One Project
Suite Teardown    Close Browser
Resource         ../resources/auth.resource.robot
Resource         ../resources/project.resource.robot
Resource         ../resources/variables.robot

*** Keywords ***
Create Owner And One Project
    Open App And Go To Signup
    ${email}=    Evaluate    "owner-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Set Suite Variable    ${OWNER_EMAIL}    ${email}
    Fill Signup Email    ${OWNER_EMAIL}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${OWNER_EMAIL}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    Set Suite Variable    ${PROJECT_TITLE}    Robot Annonce ${r}
    ${project_id}=    Create Project    ${PROJECT_TITLE}
    Set Suite Variable    ${PROJECT_ID}    ${project_id}

*** Test Cases ***
Owner Sees My Ad Tag On Home Page
    Go To Home Via Header
    Current Page Shows Project With My Ad Tag    ${PROJECT_TITLE}

Owner Sees Project In My Listings
    Go To My Listings
    My Listings Shows Project    ${PROJECT_TITLE}

Owner Can Edit Announcement
    Go To Home Via Header
    Click Project Card By Title    ${PROJECT_TITLE}
    Click Edit On Project Detail
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${new_title}=    Set Variable    Robot Edit ${r}
    Fill Edit Form Title    ${new_title}
    Submit Edit Form
    Project Detail Shows Title    ${new_title}

Owner Can Delete Announcement
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${delete_title}=    Set Variable    Robot Delete ${r}
    Create Project    ${delete_title}
    Go To Home Via Header
    Click Project Card By Title    ${delete_title}
    Click Delete And Confirm
    Current Path Is    /
    Home Does Not Show Project    ${delete_title}
