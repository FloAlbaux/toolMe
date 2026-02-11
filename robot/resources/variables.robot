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
