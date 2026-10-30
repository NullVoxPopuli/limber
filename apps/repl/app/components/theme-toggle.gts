import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { colorScheme } from 'ember-primitives/color-scheme';
import { Switch } from 'ember-primitives/components/switch';

import type { TOC } from '@ember/component/template-only';

const isDark = () => colorScheme.isDark;
const setDark = (dark: boolean) => colorScheme.update(dark ? 'dark' : 'light');

export const ThemeToggle: TOC<{ Element: HTMLDivElement }> = <template>
  <Switch
    class="limber__theme-toggle"
    @checked={{(isDark)}}
    @onChange={{setDark}}
    ...attributes
    as |s|
  >
    <s.Control name="color-scheme" data-test-theme-toggle />
    <s.Label title="Toggle dark mode">
      <span class="sr-only">Dark mode</span>
      <FaIcon @icon={{if (isDark) faMoon faSun}} />
    </s.Label>
  </Switch>

  <style>
    .limber__theme-toggle {
      position: relative;

      input {
        position: absolute;
        opacity: 0;
      }

      label {
        display: block;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        user-select: none;
      }

      input:focus-visible + label {
        outline: 2px solid var(--ember-brand);
      }
    }
  </style>
</template>;
