import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import * as RiskConfigUtil from "./util/RiskConfigUtil";
import testJson from "./util/test_data.json";

function App() {

  useEffect(() => {
    console.log("This is a test!");
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div style={{ paddingTop: "2em" }}>
          <button style={{ backgroundColor: "Yellow", borderColor: "Yellow", borderRadius: "3px", padding: "1em" }} onClick={() => {
            RiskConfigUtil.fixupRiskConfigData(testJson);
          }}>Try to set a breakpoint in the fixupRiskConfigData method (under util/RiskConfigUtil.tsx) and then Click here</button>
        </div>
      </header>
    </div>
  );
}

export default App;
