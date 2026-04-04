Feature: Octopus Energy Login

@login
  Scenario: Successful login and logout with valid credentials
    Given I am on the Octopus Energy login page
    When I click Login button
    When I enter valid credentials
    Then I should be redirected to the dashboard
    When I click Logout button
    Then I am on the Octopus Energy login page

  @login
  Scenario: Successful logout
    Given I am on the Octopus Energy login page
    When I click Login button
    When I enter valid credentials
    Then I should be redirected to the dashboard
    When I click Logout button
    Then I am on the Octopus Energy login page
  
@login
  Scenario: Failed login with invalid credentials
    Given I am on the Octopus Energy login page
    When I click Login button
    When I enter invalid credentials
    Then I should see an error message