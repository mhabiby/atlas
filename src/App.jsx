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
  <GptAssistant lang="en" />
      </div>
    </div>
  );
}