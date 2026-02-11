*** Variables ***
# Override with: robot -v BASE_URL:http://localhost:5173 -v HEADLESS:False ...
${BASE_URL}                 http://localhost:5173
${API_URL}                  http://localhost:8030
${HEADLESS}                 True
${VALID_PASSWORD}           password1234
${MIN_PASSWORD_LENGTH}      12

# Selectors (EN locale)
${SIGNUP_EMAIL_ID}           signup-email
${SIGNUP_PASSWORD_ID}        signup-password
${SIGNUP_CONFIRM_ID}         signup-confirm
${SIGNUP_SUBMIT_TEXT}        Create account
${LOGIN_EMAIL_ID}            login-email
${LOGIN_PASSWORD_ID}         login-password
${LOGIN_SUBMIT_TEXT}         Log in
${HEADER_LOGIN_LINK}         Log in
${HEADER_CREATE_ACCOUNT}     Create account
${HEADER_LOGOUT}             Log out
${PUBLISH_CTA}               Publish a project
${BRAND_NAME}                ToolMe

# Publish form (EN)
${PUBLISH_TITLE_ID}          publish-title
${PUBLISH_DOMAIN_ID}         publish-domain
${PUBLISH_SHORT_ID}          publish-short
${PUBLISH_FULL_ID}           publish-full
${PUBLISH_DEADLINE_ID}       publish-deadline
${PUBLISH_DELIVERY_ID}       publish-delivery
${PUBLISH_SUBMIT_TEXT}       Publish project

# Project detail (EN)
${PROJECT_EDIT_LINK}         Edit
${PROJECT_DELETE_BUTTON}     Delete
${PROJECT_MY_AD_TAG}         My ad
${PROJECT_APPLY_CTA}         Propose a deliverable
${ACCOUNT_PAGE_TITLE}        My listings
${ACCOUNT_EMPTY_TEXT}        You haven't published any listing yet

# Apply / submission (EN)
${APPLY_MESSAGE_ID}          apply-message
${APPLY_LINK_ID}             apply-link
${APPLY_SUBMIT_TEXT}         Submit
${APPLY_SUCCESS_TITLE}       Submission sent
${MY_SUBMISSIONS_TITLE}      My submissions
${SUBMISSION_DETAIL_THREAD}  Message thread
${SUBMISSION_DETAIL_SEND}    Send
