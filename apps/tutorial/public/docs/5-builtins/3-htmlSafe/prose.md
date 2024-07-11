Glimmer, by default, protects you against [Cross-Site-Scripting][xss] attacks, where an attack may try to get malicious code rendered on a page to scrape or send information from other user sessions.

The `htmlSafe` utility is used when you have an input that you either _know_ to be safe or are reasonably certain that rendering any malicious input will have no negative consequence (for example, maybe the untrusted input is already safely handled by running it through a sanitizer (such as [PurifyDOM](https://github.com/cure53/DOMPurify -- making the input trusted and safe)). `htmlSafe` does not make the string safe; in fact, it tells Handlebars to ignore the typical step of making the string safe. Use it only when you do not want the input to be HTML escaped.

```hbs
{{htmlSafe untrusted}}
```

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/functions/@ember%2Ftemplate/htmlSafe
[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting
