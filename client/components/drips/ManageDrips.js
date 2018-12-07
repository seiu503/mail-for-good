import React from 'react';
import ManageDripsBox from '../../containers/drips/ManageDripsBox';

const ManageDrips = () => {
    return (
        <div>
            <div className="content-header">
                <h1>Manage drips
          <small>Edit or delete your drips here</small>
                </h1>
            </div>

            <section className="content">
                <ManageDripsBox />
            </section>
        </div>
    );
};

export default ManageDrips;
