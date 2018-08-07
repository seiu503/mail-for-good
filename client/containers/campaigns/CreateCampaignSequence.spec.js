import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { CreateCampaignSequenceComponent } from './CreateCampaignSequence';

const mockProps = (overrides) => ({ // eslint-disable-line no-unused-vars
    form: { values: {} },
    isPosting: true,
    postCreateCampaignSequence: () => { },
    getLists: () => { },
    lists: [],
    isGetting: true,
    getTemplates: () => { },
    templates: [],
    initialize: () => { },
    notify: () => { }
});

const mockContext = {
    router: { isActive: (a, b) => true } // eslint-disable-line no-unused-vars
};

const wrapper = shallow(<CreateCampaignSequenceComponent {...mockProps() } />, { context: mockContext });

describe('(Container) CreateCampaign', () => {
    it('renders without exploding', () => {
        expect(wrapper).to.have.lengthOf(1);
    });
});