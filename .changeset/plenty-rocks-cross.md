---
"ember-repl": patch
---

Fix an issue where hbs live blocks did not have scope properly forwarded to them and make errors about missing scope clearer, rather than 'tried to render undefined, how dare you'

Fix implemented here: https://github.com/NullVoxPopuli/limber/pull/1668
