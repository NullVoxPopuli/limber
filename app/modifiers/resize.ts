import { modifier } from 'ember-could-get-used-to-this';
import Split from 'split-grid';

export default modifier((element) => {
  let splitter = Split({
    columnGutters: [
      {
        track: 1,
        element,
      },
    ],
  });

  return () => splitter.destroy();
});
