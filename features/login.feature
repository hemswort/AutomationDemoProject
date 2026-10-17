@smoke @chromium
Feature: Login functionality on OrangeHRM

  Background:
    Given I am on the OrangeHRM login page

  Scenario: Admin can log in successfully
    When I login as "Admin" with password "admin123"
    Then I should see the OrangeHRM dashboard

  Scenario: Invalid credentials are rejected
    When I login as "invalid_user" with password "wrong_password"
    Then I should see the login error "Invalid credentials"