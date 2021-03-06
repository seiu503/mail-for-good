import initialState from './initialState';
import {
  REQUEST_POST_CREATECAMPAIGNSEQUENCE, COMPLETE_POST_CREATECAMPAIGNSEQUENCE, COMPLETE_DELETE_CAMPAIGNSEQUENCE,
  REQUEST_POST_CREATECAMPAIGN, COMPLETE_POST_CREATECAMPAIGN,
  REQUEST_POST_DRAFTCAMPAIGN, COMPLETE_POST_DRAFTCAMPAIGN,
  REQUEST_GET_CAMPAIGNS, COMPLETE_GET_CAMPAIGNS,
  REQUEST_POST_SENDCAMPAIGN, COMPLETE_POST_SENDCAMPAIGN,
  REQUEST_POST_SENDTESTEMAIL, COMPLETE_POST_SENDTESTEMAIL,
  REQUEST_POST_CREATETEMPLATE, COMPLETE_POST_CREATETEMPLATE,
  REQUEST_POST_PUBLISHTEMPLATE, COMPLETE_POST_PUBLISHTEMPLATE,
  REQUEST_GET_TEMPLATES, COMPLETE_GET_TEMPLATES,
  COMPLETE_DELETE_CAMPAIGNS, COMPLETE_DELETE_TEMPLATES, REQUEST_GET_CAMPAIGNSSEQUENCE, COMPLETE_GET_CAMPAIGNSSEQUENCE,  
} from '../constants/actionTypes';

export function createCampaign(state = initialState.createCampaign, action) {
  switch (action.type) {
    case REQUEST_POST_CREATECAMPAIGN: {
        return {...state,
          isPosting: true
        };
    }
    case COMPLETE_POST_CREATECAMPAIGN: {
        return {...state,
          isPosting: false
        };
    }
    case REQUEST_POST_DRAFTCAMPAIGN: {
        return {...state,
          campaignId: 0
        };
    }
    case COMPLETE_POST_DRAFTCAMPAIGN: {
        return {...state,
          campaignId: action.campaignId
        };
    }
    default:
      return state;
  }
}
export function createCampaignSequence(state = initialState.createCampaignSequence, action) {
  switch (action.type) {
    case REQUEST_POST_CREATECAMPAIGNSEQUENCE: {
        return {...state,
          isPosting: true
        };
    }
    case COMPLETE_POST_CREATECAMPAIGNSEQUENCE: {
        return {...state,
          isPosting: false
        };
    }
    default:
      return state;
  }
}

export function createTemplate(state = initialState.createTemplate, action) {
  switch (action.type) {
    case REQUEST_POST_CREATETEMPLATE: {
        return {...state,
          isPosting: true,
          templateId: 0
        };
    }
    case COMPLETE_POST_CREATETEMPLATE: {
        return {...state,
          isPosting: false,
          templateId: action.templateId
        };
    }
    case REQUEST_POST_PUBLISHTEMPLATE: {
      return {
        ...state,
        templatePublish: true
      };
    }
    case COMPLETE_POST_PUBLISHTEMPLATE: {
      return {
        ...state,
        templatePublish: false
      };
    }
    default:
      return state;
  }
}

export function manageCampaign(state = initialState.manageCampaign, action) {  
  switch (action.type) {
    case REQUEST_GET_CAMPAIGNS: {
        return {...state,
          isGetting: true
        };
    }
    case COMPLETE_GET_CAMPAIGNS: {
        return {...state,
          campaigns: action.campaigns,
          isGetting: false
        };
    }
    case COMPLETE_DELETE_CAMPAIGNS: {
      return {...state,
        campaigns: action.campaigns
      };
    }
    default:
      return state;
  }
}

export function manageTemplates(state = initialState.manageTemplates, action) {
  switch (action.type) {
    case REQUEST_GET_TEMPLATES: {
        return {...state,
          isGetting: true
        };
    }
    case COMPLETE_GET_TEMPLATES: {
        return {...state,
          templates: action.templates,
          isGetting: false
        };
    }
    case COMPLETE_DELETE_TEMPLATES: {
      return {...state,
        templates: action.templates
      };
    }
    default:
      return state;
  }
}

export function sendCampaign(state = initialState.sendCampaign, action) {
  switch (action.type) {
    case REQUEST_POST_SENDCAMPAIGN: {
        return {...state,
          isPosting: true
        };
    }
    case COMPLETE_POST_SENDCAMPAIGN: {
        return {...state,
          isPosting: false,
          sendCampaignResponse: action.sendCampaignResponse,
          sendCampaignStatus: action.sendCampaignStatus
        };
    }
    default:
      return state;
  }
}

export function sendTest(state = initialState.sendTest, action) {
  switch (action.type) {
    case REQUEST_POST_SENDTESTEMAIL: {
        return {...state,
          isPosting: true
        };
    }
    case COMPLETE_POST_SENDTESTEMAIL: {
        return {...state,
          isPosting: false,
          sendTestEmailResponse: action.sendTestEmailResponse,
          sendTestEmailStatus: action.sendTestEmailStatus
        };
    }
    default:
      return state;
  }
}
export function manageCampaignSequence(state = initialState.manageCampaignSequence, action) {  
  switch (action.type) {
    case REQUEST_GET_CAMPAIGNSSEQUENCE: {
      return {
        ...state,
        isGetting: true
      };
    }
    case COMPLETE_GET_CAMPAIGNSSEQUENCE: {      
      return {
        ...state,
        campaignsequences: action.campaignsequences,
        isGetting: false
      };
    }
    case COMPLETE_DELETE_CAMPAIGNSEQUENCE: {
      return {
        ...state,
        campaignsequences: action.campaignsequences
      };
    }
    default:
      return state;
  }
}
export default {
  createCampaign,
  createCampaignSequence,
  createTemplate,
  manageCampaign,
  sendCampaign,
  sendTest,
  manageTemplates,
  manageCampaignSequence
};
