import { service } from 'ember-primitives/helpers/service';

import { ExternalLink, Link } from '@nullvoxpopuli/limber-shared';

const ReportIssue = <template>
  If the tutorial navigated you here,
  <ExternalLink href="https://github.com/NullVoxPopuli/limber/issues">please report the issue</ExternalLink>.
  ❤️
</template>;
const CurrentPath = <template>
  {{#let (service "docs") as |docs|}}
    <code>{{docs.currentPath}}</code>
  {{/let}}
</template>;
const BackToStart = <template>
  You may also try going
  <Link href="/" style="width: max-content; display: inline-block;">back to the beginning</Link>
</template>;
export const NotFound = <template>
  Prose for the current tutorial,
  <CurrentPath />, could not be found. Please check the URL and try again, or navigate to a
  different tutorial chapter.

  <br /><br />
  <ReportIssue />

  <br /><br /><br />
  <BackToStart />
</template>;
