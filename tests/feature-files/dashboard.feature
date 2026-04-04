@regression
Feature: Octopus Energy Dashboard

Background:
  Given I am on the Octopus Energy login page
  When I click Login button
  When I enter valid credentials
  Then I should be redirected to the dashboard

@dashboard
Scenario: Verify energy balance is displayed on the dashboard
 Then I verify the users energy balance '£55.59' is displayed on the dashboard