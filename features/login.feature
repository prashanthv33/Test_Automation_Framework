@regression
Feature: Login
  As a registered shopper
  I want to sign in to the store
  So that I can browse and buy products

  Background:
    Given I am on the login page

  @smoke
  Scenario: Successful login with valid credentials
    When I log in with valid credentials
    Then I should see the products page

  Scenario Outline: Login is rejected for <case>
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "<error>"

    Examples:
      | case             | username        | password     | error                                 |
      | a locked account | locked_out_user | secret_sauce | Sorry, this user has been locked out. |
      | a wrong password | standard_user   | nope         | Username and password do not match    |
      | an empty form    |                 |              | Username is required                  |
