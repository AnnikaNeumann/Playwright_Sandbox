@smoke
Feature: Smoke Tests

  Scenario: Login path works for valid user
    Given I am on the Octopus Energy login page
    When I click Login button
    When I enter valid credentials
    Then I should be redirected to the dashboard

  Scenario: Dashboard energy balance is visible
    Given I am on the Octopus Energy login page
    When I click Login button
    When I enter valid credentials
    Then I should be redirected to the dashboard
    Then I verify the users energy balance '£55.59' is displayed on the dashboard
