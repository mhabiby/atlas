import React from "react";
import "./App.css";
// import custom bootstrap (builds bootstrap with your theme colors)
// Temporarily use prebuilt Bootstrap CSS while SASS preprocessor issue is resolved
import "bootstrap/dist/css/bootstrap.min.css";
import GptAssistant from "./GptAssistant";

export default function App() {
  return (
    <div className="gpt-app-root">
      <div className="inner">
        <header style={{display:'flex',alignItems:'center',gap:'16px',padding:'12px 4px 18px'}}>
          <img src="/atlas-mountain.svg" width="56" height="56" alt="Atlas Portal logo" style={{borderRadius:'18px',boxShadow:'0 4px 14px -4px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.08)'}} />
          <h1 style={{fontSize:'30px',margin:0,color:'#facc15',fontWeight:700,letterSpacing:'.6px',textShadow:'0 2px 6px rgba(0,0,0,0.55)'}}>Atlas Portal</h1>
        </header>
  <GptAssistant lang="en" />
      </div>
    </div>
  );
}