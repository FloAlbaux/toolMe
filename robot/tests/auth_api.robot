*** Settings ***
Library          RequestsLibrary
Resource         ../resources/variables.robot

*** Test Cases ***
Signup Duplicate Email Returns 400
    [Documentation]    Backend must reject second signup with same email (400).
    ${email}=    Evaluate    "api-dup-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Create Session    api    ${API_URL}
    ${body}=    Create Dictionary    email=${email}    password=${VALID_PASSWORD}    password_confirm=${VALID_PASSWORD}
    ${r1}=    POST On Session    api    /auth/signup    json=${body}
    Should Be Equal As Numbers    ${r1.status_code}    201
    ${r2}=    POST On Session    api    /auth/signup    json=${body}    expected_status=any
    Should Be Equal As Numbers    ${r2.status_code}    400
    Should Contain    ${r2.json()}[detail]    already registered    ignore_case=True
