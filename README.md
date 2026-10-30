# Bookshelf Improved

A restoration of our GoIT team book catalog, based on the original Bookshelf design.

**[Before — original personal version](https://valeriy-zinkovskyi.github.io/team-my--project/index.html)** · **[Original team repository](https://github.com/Darjetii-Dooku/project-group-13)**

## Original contribution

This project began as a team assignment. My original work included the category list with scrolling, the Support Ukraine section, and work integrating the team's components.

This repository preserves the imported Git history. It is a separate continuation of [team-my--project](https://github.com/Valeriy-Zinkovskyi/team-my--project), which remains the unchanged before version.

## Restoration

- Cache successful API responses across navigation, share simultaneous requests, and pause after rate limits.
- Fall back to explicitly labeled saved results during service outages.
- Restore bestseller loading, category filtering, and See More navigation.
- Arrange the category list and charity block beside the desktop catalog, with responsive tablet and mobile layouts.
- Remove duplicate categories and book entries returned by the external service.
- Add loading, retry, empty, and unavailable-cover states.
- Fix asset paths and the build base path for this repository.
- Repair the book details dialog, keyboard dismissal, and saved-list persistence.
- Keep navigation and light/dark theme consistent across both pages.

## Project status

Work in progress. The first restoration pass targets the catalog and basic book-list interaction. Authentication, pagination, exact design matching, and the full course acceptance audit are not yet implemented or verified.

Book records and covers are loaded from an external API. Unavailable covers use a labeled placeholder; external data may differ from the sample books in the design.

## Technologies

HTML, CSS, JavaScript, Vite, Axios, browser localStorage, GitHub Actions, and GitHub Pages.
