Feature: Signing in to PenFolio
    As the owner of a self-hosted PenFolio workspace
    I want to sign in securely with my credentials
    So that only I can manage my résumés, cover letters and job applications

    Scenario: Signing in with the default credentials
        When I sign in with username "admin" and password "admin123"
        Then I am granted an access token
        And my profile shows the username "admin"

    Scenario: A wrong password is rejected
        When I sign in with username "admin" and password "not-my-password"
        Then sign in is refused

    Scenario: Protected data cannot be read without signing in
        When I request the job board without a token
        Then access is denied
