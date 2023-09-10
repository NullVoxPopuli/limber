import Route from 'ember-route-template';

import Output from 'limber/components/limber/output';
import FrameMessaging from 'limber/components/limber/output/frame-messaging';

export default Route(
  <template>
    <FrameMessaging as |api|>
      <Output @messagingAPI={{api}} />
    </FrameMessaging>
  </template>
);
