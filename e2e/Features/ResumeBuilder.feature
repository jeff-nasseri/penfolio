Feature: Building and managing résumés
    As a job seeker
    I want to create, copy and remove résumés
    So that I can tailor a version for every role and keep my library tidy

    Background:
        Given I am signed in

    Scenario: Creating a résumé
        When I create a résumé titled "Senior .NET Developer"
        Then my résumé library contains "Senior .NET Developer"

    Scenario: Duplicating a résumé keeps the original and adds a copy
        Given a résumé titled "Base CV"
        When I duplicate the résumé "Base CV"
        Then my résumé library contains "Base CV"
        And my résumé library contains "Base CV (copy)"

    Scenario: Editing a résumé title
        Given a résumé titled "Draft"
        When I rename the résumé "Draft" to "Polished CV"
        Then my résumé library contains "Polished CV"
        And my résumé library does not contain "Draft"

    Scenario: Deleting a résumé
        Given a résumé titled "Old CV"
        When I delete the résumé "Old CV"
        Then my résumé library does not contain "Old CV"
