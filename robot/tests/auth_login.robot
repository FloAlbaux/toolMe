*** Settings ***
Suite Teardown    Close Browser
Resource         ../resources/auth.resource.robot
Resource         ../resources/variables.robot

*** Test Cases ***
Login Page Shows Form
    Open App And Go To Login
    Get Element    [id="${LOGIN_EMAIL_ID}"]
    Get Element    [id="${LOGIN_PASSWORD_ID}"]
    Current Path Is    /login

Login Success Redirects To Home
    Open App And Go To Signup
    ${email}=    Evaluate    "login-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Click Logout
    Wait For Load State    networkidle
    Header Shows Logged Out
    Go To    ${BASE_URL}/login
    Fill Login    ${email}    ${VALID_PASSWORD}
    Submit Login
    Wait For Load State    networkidle
    Current Path Is    /
    Header Shows Logged In    ${email}

Login Invalid Password Shows Error
    Open App And Go To Signup
    ${email}=    Evaluate    "badpass-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Click Logout
    Wait For Load State    networkidle
    Go To    ${BASE_URL}/login
    Fill Login    ${email}    wrongpassword
    Submit Login
    Wait For Load State    networkidle
    Page Shows Error    Invalid email or password

Logout Clears Session
    Open App And Go To Signup
    ${email}=    Evaluate    "logout-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${email}
    Click Logout
    Wait For Load State    networkidle
    Header Shows Logged Out
    Current Path Is    /
