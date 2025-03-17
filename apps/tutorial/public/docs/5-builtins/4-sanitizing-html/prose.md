# Sanitizing HTML Content

When working with user-generated content or HTML from external sources, it's crucial to sanitize the HTML to prevent [Cross-Site Scripting (XSS)][xss] attacks. While Ember's `htmlSafe` tells the framework not to escape HTML content, it doesn't actually sanitize the content.

For proper sanitization, you need to use a dedicated HTML sanitizer like [DOMPurify][dompurify]. This library removes potentially dangerous content while preserving safe HTML elements and attributes.

The basic pattern for safely rendering user-generated HTML is:

1. Sanitize the HTML using DOMPurify
2. Mark the sanitized content as safe using `htmlSafe`
3. Render the safe content in your template

<p class="call-to-play">
  Complete the <code>SafeHtml</code> component to properly sanitize and render the HTML content.
</p>

[Documentation for htmlSafe][docs-htmlsafe]
[Documentation for DOMPurify][docs-dompurify]

[xss]: https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting
[dompurify]: https://github.com/cure53/DOMPurify
[docs-htmlsafe]: https://api.emberjs.com/ember/release/functions/@ember%2Ftemplate/htmlSafe
[docs-dompurify]: https://github.com/cure53/DOMPurify#readme
