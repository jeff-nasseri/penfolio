Feature: Job-search analytics
    As a job seeker
    I want a report of my application activity and documents
    So that I can see how my search is really going

    Background:
        Given I am signed in

    Scenario: The report totals my tracked applications
        Given I have added 3 applications to the "Applied" column
        And I have added 1 application to the "Offer" column
        When I open the analytics report
        Then the total tracked applications is 4
        And the active pipeline is 4

    Scenario: The report counts my résumés and cover letters
        Given a résumé titled "CV One"
        And a cover letter titled "Letter One"
        When I open the analytics report
        Then the report shows 1 résumé and 1 cover letter

    Scenario: The funnel reflects applications that reached an interview
        Given I have added 2 applications to the "Applied" column
        And I have added 1 application to the "Interview" column
        When I open the analytics report
        Then the funnel shows 1 application reached the interview stage
