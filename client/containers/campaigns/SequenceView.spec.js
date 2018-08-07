import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { SequenceViewComponent } from './CampaignView';

const mockProps = (overrides) => ({ // eslint-disable-line no-unused-vars
    postSendCampaign: () => { },
    postTestEmail: () => { },
    getCampaigns: () => { },
    stopSending: () => { },
    notify: () => { },
    campaigns: [{ slug: 'mockSlug', totalCampaignSubscribers: 0 }],
    isGetting: true,
    sendCampaign: () => { },
    isPostingSendCampaign: true,
    sendCampaignResponse: '',
    sendCampaignStatus: 0,
    isPostingSendTest: true,
    sendTestEmailResponse: '',
    sendTestEmailStatus: 0,
    params: { slug: 'mockSlug' },
    campaignsequences: []
});
const mockContext = {
    router: { isActive: (a, b) => true } // eslint-disable-line no-unused-vars
};
const wrapper = shallow(<SequenceViewComponent {...mockProps() } />, { context: mockContext });

describe('(Container) CampaignView', () => {
    it('renders without exploding', () => {
        expect(wrapper).to.have.lengthOf(1);
    });
});