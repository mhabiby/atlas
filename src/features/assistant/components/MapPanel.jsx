import React from 'react';

export default function MapPanel(){
  return (
    <div id="map" className="panel-section" aria-label="Location map">
      <h2 className="panel-title">Map - Fes, Morocco</h2>
      <div className="map-embed-wrapper mt-2" aria-label="Map showing Fes Morocco">
        <iframe
          title="Fes Morocco Map"
          className="map-embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13329.006887551772!2d-4.9988132!3d34.0332826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9f8b740ec7af6d%3A0x8ac0e58ddc3e39fb!2sFes%2C%20Morocco!5e0!3m2!1sen!2sma!4v1699999999999"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
