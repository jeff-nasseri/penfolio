Feature: Managing my workspace and account
    As the owner of the workspace
    I want to manage my data, version and password
    So that I stay in control of my self-hosted instance

    Background:
        Given I am signed in

    Scenario: The About information reports the build version
        When I open the About information
        Then a software version is reported

    Scenario: Exporting and re-importing my workspace restores my data
        Given a résumé titled "Export Me"
        When I export my workspace
        And I purge all data
        Then my résumé library is empty
        When I import the previously exported workspace
        Then my résumé library contains "Export Me"

    Scenario: Purging data clears my documents but keeps my account
        Given a résumé titled "Temporary"
        When I purge all data
        Then my résumé library is empty
        And I can still sign in with username "admin" and password "admin123"

    Scenario: Changing my password
        When I change my password to "newpass123"
        Then I can sign in with the new password "newpass123"
        And I change my password back to "admin123"
