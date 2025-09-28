import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import { ExternalLink } from '@nullvoxpopuli/limber-shared';

export const Footer = <template>
  <footer class="grid w-full border-t p-2 shadow">
    <nav class="mx-auto flex gap-4">
      <ExternalLink href="https://github.com/nullvoxpopuli/limber">
        <:custom as |DefaultContent|>
          <span class="hidden sm:block">
            <DefaultContent>
              GitHub
            </DefaultContent>
          </span>
          <span class="block px-2 sm:hidden">
            <FaIcon @icon={{faGithub}} />
          </span>
        </:custom>
      </ExternalLink>
      <ExternalLink href="https://guides.emberjs.com/">
        Guides
      </ExternalLink>
      <ExternalLink href="https://api.emberjs.com">
        API Reference
      </ExternalLink>
      <ExternalLink href="http://new.emberjs.com">
        Blitz
      </ExternalLink>
    </nav>
  </footer>
</template>;
