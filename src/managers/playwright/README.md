# Playwright Utility Class

This is a utility class for working with Playwright, a Node library that provides a high-level API to control headless Chrome or Chromium browsers. The class is designed to simplify common tasks when interacting with web pages using Playwright.

## Class: `PlaywrightManager`

### Constructor

* Initializes an instance of the `PlaywrightManager` class with a Playwright `Browser` object.

### Method: `getAllPages()`

* Retrieves all currently open browser pages.
* Returns an array of Playwright `Page` objects.

### Method: `openPage(browser: Browser, url: string)`

* Opens a new browser page with the provided URL.
* Returns a Playwright `Page` object.

### Method: `getElementWithRetry(page: Page, locator: string, max_attempts: number = 3)`

* Attempts to locate an element on the page using a CSS selector with retries.
* Parameters:
  * `page`: Playwright `Page` object on which to perform the search.
  * `locator`: CSS selector for the element.
  * `max_attempts` (optional): Maximum number of retry attempts (default is 3).
* Returns a Playwright `ElementHandle` representing the located element.

### Method: `clearBrowser()`

* Closes all open browser pages, ensuring that no unused pages are left open.

### Method: `closePage(page: Page)`

* Closes a specific browser page.
* Parameters:
  * `page`: Playwright `Page` object to close.

### Method: `closeUnusedPages(pages: Page[])`

* Closes all browser pages except the first one in the provided array.
* Parameters:
  * `pages`: An array of Playwright `Page` objects to manage.

### Method: `findPageByValue(value: string, type: 'url' | 'title')`

* Searches for a browser page based on a value (URL or title) and ensures that only one matching page is open.
* Parameters:
  * `value`: The value to search for (either a URL or title).
  * `type`: Specifies whether to search by 'url' or 'title'.
* Returns the found Playwright `Page` object.

### Method: `clearInput(page: Page, locator: string)`

* Clears the input field of a form element located by a CSS selector.
* Parameters:
  * `page`: Playwright `Page` object containing the element.
  * `locator`: CSS selector of the input element.

### Method: `typeInElement(page: Page, locator: string = '', value: string = '')`

* Types a specified value into an input element located by a CSS selector.
* Parameters:
  * `page`: Playwright `Page` object containing the element.
  * `locator`: CSS selector of the input element.
  * `value`: The value to type into the input element.

### Method: `clickOnElement(page: Page, locator: string)`

* Clicks on an element located by a CSS selector.
* Parameters:
  * `page`: Playwright `Page` object containing the element.
  * `locator`: CSS selector of the element to click on.

### Method: `switchToPage(page: Page)`

* Switches to a specific browser page, bringing it to the front.
* Parameters:
  * `page`: Playwright `Page` object to switch to.

### Method: `waitFor(page: Page, time: number = 2000)`

* Pauses execution and waits for a specified duration in milliseconds.
* Parameters:
  * `page`: Playwright `Page` object to wait on.
  * `time`: The duration to wait in milliseconds (default is 2000 ms).
