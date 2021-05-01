# Custom Monaco build for Limber

This package pre-builds Monaco so that
 - actual Limber code can be focused on Limber
 - keep package.json files concise
 - easy `await import(...)`(s)
 - it's clear which of the _many_ files we're using from the Monaco package

Output from `dist/` will be copied into the Limber app's `public` folder
