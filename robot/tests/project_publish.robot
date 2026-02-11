*** Settings ***
Suite Teardown    Close Browser
Resource         ../resources/auth.resource.robot
Resource         ../resources/project.resource.robot
Resource         ../resources/variables.robot

*** Test Cases ***
Cannot Create Announcement Without Being Logged In
    Open App
    Go To Publish
    Wait For Load State    networkidle
    Current Path Is    /login

After Create Project As Owner See Project On Home With My Ad Tag
    Open App And Go To Signup
    ${email}=    Evaluate    "owner-home-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${email}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot Home Tag ${r}
    ${project_id}=    Create Project As User    ${project_title}
    Home Page Shows My Ad Tag    ${project_title}

After Create Project As Owner See Project In My Listings
    Open App And Go To Signup
    ${email}=    Evaluate    "owner-list-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${email}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot My List ${r}
    Create Project As User    ${project_title}
    Account Page Shows Project With Title    ${project_title}
