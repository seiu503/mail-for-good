import React from 'react';
import CronJobCampaignsCont from '../../containers/campaigns/CronJobCampaignsCont';

const CronJobCampaigns = () => {
    return (
        <div>
            <div className="content-header">
                <h1 >Cron Job Campaigns
                    <small></small>
                </h1>
            </div>

            <section className="content" >
                <CronJobCampaignsCont />
            </section>
        </div>
    );
};

export default CronJobCampaigns;
