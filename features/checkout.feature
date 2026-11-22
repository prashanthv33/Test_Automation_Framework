@regression
Feature: Checkout
  As a logged-in shopper
  I want to purchase the products in my cart
  So that they are shipped to me

  Background:
    Given I am logged in as the standard user

  @smoke
  Scenario: Purchase several products
    When I add the following products to the cart:
      | product                  |
      | Sauce Labs Backpack      |
      | Sauce Labs Fleece Jacket |
    Then the cart badge should show 2
    When I proceed to checkout
    And I enter valid customer details
    Then the item total should be "79.98"
    And tax and total should be calculated correctly
    When I finish the order
    Then I should see the order confirmation

  Scenario Outline: Customer details are validated (<missing>)
    When I add "Sauce Labs Onesie" to the cart
    And I proceed to checkout
    And I enter first name "<first>", last name "<last>" and postal code "<zip>"
    Then the checkout error should be "<error>"

    Examples:
      | missing     | first | last | zip   | error                   |
      | first name  |       | Doe  | 10001 | First Name is required  |
      | last name   | Jane  |      | 10001 | Last Name is required   |
      | postal code | Jane  | Doe  |       | Postal Code is required |
