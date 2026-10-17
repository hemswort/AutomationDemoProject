@regression @site
Feature: OrangeHRM site modules

  Background:
    Given I am logged in as the OrangeHRM admin

  Scenario Outline: Admin can open the <module> module
    When I open the "<module>" module
    Then I should see the "<module>" module's primary page and control

    Examples:
      | module       |
      | Admin        |
      | PIM          |
      | Leave        |
      | Time         |
      | Recruitment  |
      | My Info      |
      | Performance  |
      | Dashboard    |
      | Directory    |
      | Maintenance  |
      | Claim        |
      | Buzz         |
