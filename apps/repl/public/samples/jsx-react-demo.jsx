import React from 'react';
// NOTE: https://github.com/fkhadra/react-toastify/issues/1246
//       I had to disable shadowdom for this demo
//       You can, too, with &shadowdom=0 in the URL
import { ToastContainer, toast } from 'react-toastify';

function Demo() {
  const notify = () => toast("Wow so easy!");

  return (
    <div>
      <button onClick={notify}>
        Notify!
      </button>
      <ToastContainer />
    </div>
  );
}

export default <Demo />;
