import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import { ExternalLink } from '@nullvoxpopuli/limber-shared';

export const Footer = <template>
  <footer class="p-2 shadow grid w-full border-t">
    <nav class="gap-4 mx-auto flex">
      <ExternalLink href="https://github.com/nullvoxpopuli/limber">
        <:custom as |DefaultContent|>
          <span class="sm:block hidden">
            <DefaultContent>
              GitHub
            </DefaultContent>
          </span>
          <span class="px-2 sm:hidden block">
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
