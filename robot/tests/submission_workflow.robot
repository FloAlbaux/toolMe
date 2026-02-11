*** Settings ***
Suite Setup       Create Owner Project And Applicant
Suite Teardown    Close Browser
Resource         ../resources/auth.resource.robot
Resource         ../resources/project.resource.robot
Resource         ../resources/submission.resource.robot
Resource         ../resources/variables.robot

*** Keywords ***
Create Owner Project And Applicant
    # Owner: signup and create two projects (one for apply flow, one for form-display test)
    Open App And Go To Signup
    ${owner_email}=    Evaluate    "owner-sub-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Set Suite Variable    ${OWNER_EMAIL}    ${owner_email}
    Fill Signup Email    ${OWNER_EMAIL}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${OWNER_EMAIL}
    ${r}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title}=    Set Variable    Robot Submission ${r}
    Set Suite Variable    ${PROJECT_TITLE}    ${project_title}
    ${project_id}=    Create Project As User    ${project_title}
    Set Suite Variable    ${PROJECT_ID}    ${project_id}
    ${r2}=    Evaluate    str(__import__("random").randint(10000, 99999))
    ${project_title_2}=    Set Variable    Robot Apply Form ${r2}
    Set Suite Variable    ${PROJECT_TITLE_2}    ${project_title_2}
    ${project_id_2}=    Create Project As User    ${project_title_2}
    Set Suite Variable    ${PROJECT_ID_2}    ${project_id_2}
    # Applicant: logout, then signup as different user
    Click Logout
    Wait For Load State    networkidle
    Go To    ${BASE_URL}/signup
    Wait For Load State    networkidle
    Wait For Elements State    [id="${SIGNUP_EMAIL_ID}"]    visible    timeout=15s
    ${applicant_email}=    Evaluate    "applicant-" + str(__import__("random").randint(100000, 999999)) + "@example.com"
    Set Suite Variable    ${APPLICANT_EMAIL}    ${applicant_email}
    Fill Signup Email    ${applicant_email}
    Fill Signup Passwords    ${VALID_PASSWORD}
    Submit Signup
    Wait For Load State    networkidle
    Header Shows Logged In    ${applicant_email}
    # Store a unique message so we can assert it on the thread page
    ${apply_message}=    Set Variable    Robot apply message ${r}
    Set Suite Variable    ${APPLY_MESSAGE}    ${apply_message}

*** Test Cases ***
Applicant Can Submit Solution And See It In My Submissions
    # Go to home, open project, click "Propose a deliverable"
    Go To    ${BASE_URL}/
    Wait For Load State    networkidle
    Go To Project Detail From Home By Title    ${PROJECT_TITLE}
    Click Propose Deliverable On Project Detail
    # Fill and submit apply form
    Fill Apply Form    ${APPLY_MESSAGE}
    Submit Apply Form
    # Success screen
    Apply Page Shows Success
    # Go to My submissions via the link on success page
    Go To My Submissions Via Link
    My Submissions Page Shows Title
    My Submissions Page Has At Least One Submission
    # Open first submission (our thread)
    Click First Submission Link
    # Submission detail: thread heading and our message visible
    Submission Detail Shows Thread Heading
    Submission Detail Shows Message    ${APPLY_MESSAGE}
    Current Path Is Submission Detail

Applicant Sees Apply Form With Project Title
    # Use second project so applicant has not submitted yet (first test already applied to PROJECT_ID)
    Go To    ${BASE_URL}/project/${PROJECT_ID_2}
    Wait For Load State    networkidle
    Click Propose Deliverable On Project Detail
    # Form title is "Submit a solution: <project title>"
    Get Element    text=/Submit a solution/
    Get Element    text=${PROJECT_TITLE_2}
