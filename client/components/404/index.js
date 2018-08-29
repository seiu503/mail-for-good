import React from 'react';

const NotFound = () => {
  return (
    <div>
      <section className="content-header" style={{display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", minHeight: "80vh"}}>
        <h1>Page not found</h1>
        <small>Please check the URL</small>
      </section>
    </div>
  );
};

export default NotFound;
