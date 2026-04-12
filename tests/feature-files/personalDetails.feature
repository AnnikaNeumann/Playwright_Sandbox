@regression
Feature: Personal Details Page

Background:
  Given I am on the Octopus Energy login page
  When I click Login button
  When I enter valid credentials
  Then I should be redirected to the dashboard

@personalDetails
Scenario: Verify personal details are displayed
 When I click 'Personal details'
 Then I verify users contact details are displayed 
 Then I verify the users communication preferences are displayed on the personal details page
#  When I click Edit button on the communication pref card