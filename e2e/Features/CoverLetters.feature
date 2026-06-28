Feature: Writing cover letters
    As a job seeker
    I want to create and manage cover letters
    So that I can send a tailored letter with each application

    Background:
        Given I am signed in

    Scenario: Creating a cover letter
        When I create a cover letter titled "Application for Booking.com"
        Then my cover letter library contains "Application for Booking.com"

    Scenario: Duplicating a cover letter
        Given a cover letter titled "Generic Letter"
        When I duplicate the cover letter "Generic Letter"
        Then my cover letter library contains "Generic Letter (copy)"

    Scenario: Deleting a cover letter
        Given a cover letter titled "Old Letter"
        When I delete the cover letter "Old Letter"
        Then my cover letter library does not contain "Old Letter"
