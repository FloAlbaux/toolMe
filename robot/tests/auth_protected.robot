*** Settings ***
Suite Teardown    Close Browser
Resource         ../resources/auth.resource.robot
Resource         ../resources/variables.robot

*** Test Cases ***
Publish Redirects To Login When Not Authenticated
    Open App
    Go To Publish
    Wait For Load State    networkidle
    Current Path Is    /login

After Login From Publish Redirect User Returns To Publish
    Open App
    Go To Publish
    Wait For Load State    networkidle
    Current Path Is    /login
    ${email}=    Evaluate    "publish-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    # Create account first
    Go To    ${BASE_URL}/signup
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Click Logout
    # Now go to publish -> login -> fill and submit -> should land on /publish
    Go To Publish
    Wait For Load State    networkidle
    Fill Login    ${email}    ${VALID_PASSWORD}
    Submit Login
    Wait For Load State    networkidle
    Sleep    2s
    Current Path Is    /publish
    Header Shows Logged In    ${email}

Home Accessible Without Auth
    Open App
    Go To Home
    Wait For Load State    networkidle
    Current Path Is    /
    Get Element    role=banner >> text=/${BRAND_NAME}/
    Header Shows Logged Out
