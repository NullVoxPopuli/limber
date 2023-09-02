import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import { ExternalLink } from 'limber-ui';

export const Footer = <template>
  <footer class="p-2 w-full grid shadow border-t">
    <nav class="mx-auto flex gap-4">
      <ExternalLink href="https://github.com/nullvoxpopuli/limber">
        <:custom as |DefaultContent|>
          <span class="hidden sm:block">
            <DefaultContent>
              GitHub
            </DefaultContent>
          </span>
          <span class="block sm:hidden px-2">
            <FaIcon @icon="github" @prefix="fab" />
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
