*** Settings ***
Suite Setup       Open App And Go To Signup
Suite Teardown    Close Browser
Library          Collections
Resource         ../resources/auth.resource.robot
Resource         ../resources/variables.robot

*** Test Cases ***
Signup Form Shows All Fields
    Signup Form Is Visible
    Current Path Is    /signup

Signup Button Disabled When Email Invalid
    Reload
    Fill Signup Email    toto
    Fill Signup Passwords    ${VALID_PASSWORD}
    Signup Submit Button Is Disabled

Signup Button Disabled When Password Too Short
    Reload
    Fill Signup Email    test@example.com
    Fill Signup Passwords    short
    Signup Submit Button Is Disabled

Signup Button Disabled When Passwords Do Not Match
    Reload
    Fill Signup Email    test@example.com
    Fill Signup Passwords    ${VALID_PASSWORD}    otherpass99
    Signup Submit Button Is Disabled

Signup Button Enabled When All Valid
    Reload
    Fill Signup Email    test@example.com
    Fill Signup Passwords    ${VALID_PASSWORD}
    Signup Submit Button Is Enabled

Signup Success Redirects To Home And User Is Logged In
    ${email}=    Evaluate    "robot-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Reload
    Fill Signup Email    ${email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Current Path Is    /
    Header Shows Logged In    ${email}
