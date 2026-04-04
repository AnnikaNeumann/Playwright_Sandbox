@regression
Feature: Login Page

Background:
  Given I am on the Octopus Energy login page
  When I click Login button
  When I enter valid credentials
  Then I should be redirected to the dashboard

@login
Scenario: Successful login and logout with valid credentials
  # Verifies that user can login with valid credentials
  Given I am on the Octopus Energy login page
  When I click Login button
  When I enter valid credentials
  Then I should be redirected to the dashboard

@login
Scenario: Successful logout
  # Verifies that user can logout successfully
  When I click Logout button
  Then I should be on the Octopus Energy login page

@login @negative
Scenario: Failed login with invalid credentials
  # Verifies that user cannot login with invalid credentials
  Given I am on the Octopus Energy login page
  When I click Login button
  When I enter invalid credentials
  Then I should see an error message