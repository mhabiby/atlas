import React from 'react';

export default function AdsPanel(){
  return (
    <div id="ads" className="panel-section" aria-label="Advertisements">
      <h2 className="panel-title">Ads</h2>
      <div className="ad-placeholder" role="img" aria-label="Generic laptop opening advertisement">
        <div className="ad-graphic">
          <div className="lid" />
          <div className="base" />
        </div>
        <div className="ad-text mt-3">Power up your workflow with the new UltraBook Pro. Faster starts. Brighter ideas.</div>
      </div>
    </div>
  );
}
