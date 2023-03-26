Glimmer, by default, protects you against [Cross-Site-Scripting][xss] attacks, where an attack may try to get malicious code rendered on a page to scrape or send information from other user sessions.

The `htmlSafe` utility is used when you have input that either _know_ to be safe, or you can be reasonably certain that rendering untrusted input will have no negative consequence (for example, maybe untrusted input is ran through a sanitizer (such as [PurifyDOM](https://github.com/cure53/DOMPurify)).

```hbs
{{htmlSafe untrusted}}
```

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/functions/@ember%2Ftemplate/htmlSafe
[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting
