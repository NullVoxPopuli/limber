// https://github.com/FortAwesome/ember-fontawesome/tree/3.x?tab=readme-ov-file#using-in-projects-with-template-tag-gjs--gts---recommended
import '@fortawesome/fontawesome-svg-core/styles.css';

import { config } from '@fortawesome/fontawesome-svg-core';
// import '@fortawesome/free-brands-svg-icons/styles.css';
// import '@fortawesome/free-regular-svg-icons/styles.css';
// import '@fortawesome/free-solid-svg-icons/styles.css';

// Disable auto CSS import into head. It solved the side effect for jumping icon size.
// This is required for Fastboot apps, otherwise build fails
// It's the recommended way for setup Font Awesome in your app
config.autoAddCss = false;
