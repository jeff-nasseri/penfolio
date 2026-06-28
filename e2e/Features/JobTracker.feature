Feature: Tracking job applications on a board
    As a job seeker
    I want a kanban board of my applications with columns I control
    So that I always know where every application stands

    Background:
        Given I am signed in

    Scenario: The board starts with the default pipeline
        When I open the job board
        Then the board has the columns "Saved, Applied, Interview, Offer, Rejected"

    Scenario: Adding an application and moving it through the pipeline
        When I add the application "Booking.com" for the role "Backend Engineer" to the "Applied" column
        Then the "Applied" column contains "Booking.com"
        When I move "Booking.com" to the "Interview" column
        Then the "Interview" column contains "Booking.com"
        And the "Applied" column does not contain "Booking.com"

    Scenario: Creating, renaming and deleting my own column
        When I create a column named "Waiting"
        Then the board has a column named "Waiting"
        When I rename the column "Waiting" to "On hold"
        Then the board has a column named "On hold"
        And the board has no column named "Waiting"
        When I delete the column "On hold"
        Then the board has no column named "On hold"

    Scenario: Deleting a column removes its applications
        Given a column named "Waiting"
        And the application "Mollie" in the "Waiting" column
        When I delete the column "Waiting"
        Then the board has no application "Mollie"
