# Bookshelf Improved

**After — personal restoration of a GoIT team learning project.** Based on the original Bookshelf design.

**[After — improved website](https://valeriy-zinkovskyi.github.io/bookshelf-improved/)** · **[Before — original learning project](https://valeriy-zinkovskyi.github.io/bookshelf-original/index.html)** · **[Before repository](https://github.com/Valeriy-Zinkovskyi/bookshelf-original)**

## Original contribution

This project began as a team assignment. My original work included the category list with scrolling, the Support Ukraine section, and work integrating the team's components.

This repository preserves the imported Git history. It is a separate continuation of [the original learning project](https://github.com/Valeriy-Zinkovskyi/bookshelf-original). Its original application behavior remains the before baseline; only presentation and publication paths are maintained there.

## Features

- Reserve cover loading by ISBN through Open Library when the primary image is unavailable.
- Search the loaded selection by title or author, sort alphabetically, and filter saved books.
- Save books directly from catalog cards; the navigation counter updates immediately.
- Manage a personal collection with an undo option after removing a book.
- Responsive layouts, collapsible mobile categories, keyboard search shortcut (`/`), and persistent themes.
- Smooth scrolling, reading progress, loading skeletons, subtle card and dialog transitions, and reduced-motion support.

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

## Technologies

HTML, CSS, JavaScript, Vite, Axios, browser localStorage, GitHub Actions, and GitHub Pages.
