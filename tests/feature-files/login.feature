Feature: Octopus Energy Login

@login @positive
  Scenario: Successful login with valid credentials
    Given I am on the Octopus Energy login page
    When I click Login button
    When I enter valid credentials
    Then I should be redirected to the dashboard
  
@login @negative
  Scenario: Failed login with invalid credentials
    Given I am on the Octopus Energy login page
    When I click Login button
    When I enter invalid credentials
    Then I should see an error message