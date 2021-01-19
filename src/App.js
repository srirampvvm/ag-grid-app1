import React, { useState } from 'react';

import AG from "./AG"
import AG2 from "./AG2"
import AG3 from "./AG3"
import AG4 from "./AG4"
const App = () => {
  return (
    <table><tbody>
      <tr><td><AG2 /></td><td><AG3 /></td></tr>
      <tr><td><AG /></td><td><AG4/></td></tr>
    </tbody></table>
  )
};

export default App;