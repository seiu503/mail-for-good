import axios from 'axios';
import {
  REQUEST_POST_CREATECAMPAIGNSEQUENCE, COMPLETE_POST_CREATECAMPAIGNSEQUENCE,
  REQUEST_GET_CAMPAIGNSSEQUENCE, COMPLETE_GET_CAMPAIGNSSEQUENCE, COMPLETE_DELETE_CAMPAIGNSEQUENCE,
  REQUEST_POST_CREATECAMPAIGN, COMPLETE_POST_CREATECAMPAIGN,
  REQUEST_GET_CAMPAIGNS, COMPLETE_GET_CAMPAIGNS,
  REQUEST_POST_SENDCAMPAIGN, COMPLETE_POST_SENDCAMPAIGN,
  REQUEST_POST_SENDTESTEMAIL, COMPLETE_POST_SENDTESTEMAIL,
  REQUEST_POST_CREATETEMPLATE, COMPLETE_POST_CREATETEMPLATE,
  REQUEST_GET_TEMPLATES, COMPLETE_GET_TEMPLATES,
  COMPLETE_DELETE_CAMPAIGNS, COMPLETE_DELETE_TEMPLATES,
  REQUEST_STOP_SENDING, COMPLETE_STOP_SENDING
} from '../constants/actionTypes';
import { API_CAMPAIGN_ENDPOINT, API_SEND_CAMPAIGN_ENDPOINT, API_TEMPLATE_ENDPOINT, API_TEST_SEND_CAMPAIGN_ENDPOINT, API_STOP_SENDING, API_CRON_CAMPAIGN_ENDPOINT, API_SEND_CRON_CAMPAIGN_ENDPOINT, API_CAMPAIGN_SEQUENCE_ENDPOINT, API_CAMPAIGN_SEQUENCE_LISTING_ENDPOINT, API_TEMPLATE_COPY_ENDPOINT, API_CAMPAIGN_COPY_ENDPOINT, API_CAMPAIGN_CHANGE_STATUS_ENDPOINT } from '../constants/endpoints';
import { notify } from './notificationActions';
import { destroy } from 'redux-form';

//Campaign seqeuences
export function requestGetCampaignSequence() {
  return { type: REQUEST_GET_CAMPAIGNSSEQUENCE };
}
export function completeGetCampaignSequence(campaignsequences) {
  return { type: COMPLETE_GET_CAMPAIGNSSEQUENCE, campaignsequences };
}
// Delete campaign sequence
export function completeDeleteCampaignSequence(campaignsequences) {
  return { type: COMPLETE_DELETE_CAMPAIGNSEQUENCE, campaignsequences };
}


// Create new campaign
export function requestPostCreateCampaign() {
  return { type: REQUEST_POST_CREATECAMPAIGN };
}
export function completePostCreateCampaign() {
  return { type: COMPLETE_POST_CREATECAMPAIGN };
}
// Create new campaign Sequence
export function requestPostCreateCampaignSequence() {
  return { type: REQUEST_POST_CREATECAMPAIGNSEQUENCE };
}
export function completePostCreateCampaignSequence() {
  return { type: COMPLETE_POST_CREATECAMPAIGNSEQUENCE };
}

// Create new template
export function requestPostCreateTemplate() {
  return { type: REQUEST_POST_CREATETEMPLATE };
}
export function completePostCreateTemplate() {
  return { type: COMPLETE_POST_CREATETEMPLATE };
}

// Get array of existing campaigns
export function requestGetCampaign() {
  return { type: REQUEST_GET_CAMPAIGNS };
}
export function completeGetCampaign(campaigns) {
  return { type: COMPLETE_GET_CAMPAIGNS, campaigns };
}

// Post new send campaign request
export function requestPostSendCampaign() {
  return { type: REQUEST_POST_SENDCAMPAIGN };
}
export function completePostSendCampaign(response, status) {
  return { type: COMPLETE_POST_SENDCAMPAIGN, sendCampaignResponse: response, sendCampaignStatus: status };
}

// Post send test email request
export function requestPostSendTestEmail() {
  return { type: REQUEST_POST_SENDTESTEMAIL };
}
export function completePostSendTestEmail(response, status) {
  return { type: COMPLETE_POST_SENDTESTEMAIL, sendTestEmailResponse: response, sendTestEmailStatus: status };
}

// Get templates
export function requestGetTemplates() {
  return { type: REQUEST_GET_TEMPLATES };
}
export function completeGetTemplates(templates) {
  return { type: COMPLETE_GET_TEMPLATES, templates };
}

// Delete campaign/template
export function completeDeleteCampaigns(campaigns) {
  return { type: COMPLETE_DELETE_CAMPAIGNS, campaigns };
}
export function completeDeleteTemplates(templates) {
  return { type: COMPLETE_DELETE_TEMPLATES, templates };
}

// Stop campaign sending
export function requestStopSending(campaignId) {
  return { type: REQUEST_STOP_SENDING, campaignId };
}
export function completeStopSending() {
  return { type: COMPLETE_STOP_SENDING };
}


export function postCreateCampaignSequence(form, reset) {
  return dispatch => {
    dispatch(requestPostCreateCampaignSequence());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_CAMPAIGN_SEQUENCE_ENDPOINT);
    xhr.onload = () => {
      dispatch(completePostCreateCampaignSequence());
      dispatch(getCampaigns());
      setTimeout(() => {
        dispatch(destroy('createCampaignSequence'));
      }, 2000);
      reset();
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(form);
  };
}
export function getCampaignSequence(campaignId) {  
  return dispatch => {
    dispatch(requestGetCampaignSequence());
    axios.post(API_CAMPAIGN_SEQUENCE_LISTING_ENDPOINT,
      { id: campaignId }
    ).then(response => {
      if (response.data){
        dispatch(completeGetCampaignSequence(response.data));
      }else{
        dispatch(completeGetCampaignSequence([]));
      }      
    });    
  };
}

export function deleteSequence(form, campaignSequences) {
  console.log(form);
  return dispatch => {    
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', API_CAMPAIGN_SEQUENCE_ENDPOINT);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(form);
    xhr.onload = () => {
      const formArray=JSON.parse(form);      
      const filterCampaignSequences = campaignSequences.filter(x => x.id != formArray.deleteid);
      dispatch(completeDeleteCampaignSequence(filterCampaignSequences));
    };
  };
}


export function stopSending(campaignId) {
  return dispatch => {
    dispatch(requestStopSending(campaignId));

    axios.post(API_STOP_SENDING,
      { id: campaignId }
    ).then(response => {
      dispatch(completeStopSending(response));
      dispatch(notify({
        message: 'Campaign sending stopped',
        colour: 'green'
      }));
    });
  };
}


export function getCampaigns() {
  return dispatch => {
    dispatch(requestGetCampaign());
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_CAMPAIGN_ENDPOINT);
    xhr.setRequestHeader('Accept', 'application/json, text/javascript');
    xhr.onload = () => {
      if (xhr.responseText) {
        // Convert response from JSON
        const campaignsArray = JSON.parse(xhr.responseText).map(x => {
          x.createdAt = new Date(x.createdAt);
          x.updatedAt = new Date(x.updatedAt);
          x.scheduledatetime = (x.scheduledatetime!==null)?new Date(x.scheduledatetime):'';
          return x;
        });
 
        dispatch(completeGetCampaign(campaignsArray));
      } else {
        dispatch(completeGetCampaign([]));
      }
    };
    xhr.send();
  };
}
export function getAllCampaigns() {
  return dispatch => {
    dispatch(requestGetCampaign());
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_CRON_CAMPAIGN_ENDPOINT);
    xhr.setRequestHeader('Accept', 'application/json, text/javascript');
    xhr.onload = () => {
      if (xhr.responseText) {
        // Convert response from JSON
        const campaignsArray = JSON.parse(xhr.responseText).map(x => {
          x.createdAt = new Date(x.createdAt);
          x.scheduledatetime = new Date(x.scheduledatetime);
          x.updatedAt = new Date(x.updatedAt);
          return x;
        });
        const currentDate = new Date();
        Object.keys(campaignsArray).forEach(function (key) {
          const row = campaignsArray[key];
          if (currentDate.getTime() >= row.scheduledatetime.getTime()) {
            if (row.status != 'done') {
              const form = { userId: row.userId, id: row.id };
              const xhr = new XMLHttpRequest();
              xhr.open('POST', API_SEND_CRON_CAMPAIGN_ENDPOINT);
              xhr.onload = () => {
                //console.log(form);
              };
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.send(JSON.stringify(form));
            }
          }
        });
        dispatch(completeGetCampaign(campaignsArray));
      } else {
        dispatch(completeGetCampaign([]));
      }
    };
    xhr.send();
  };
}

export function postCreateTemplate(form, reset) {
  return dispatch => {
    dispatch(requestPostCreateTemplate());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_TEMPLATE_ENDPOINT);
    xhr.onload = () => {
      dispatch(completePostCreateTemplate());
      dispatch(getTemplates());
      reset();
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(form);
  };
}

export function postCreateTemplateCopy(form)  {
  return dispatch => {
    dispatch(requestPostCreateTemplate());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_TEMPLATE_COPY_ENDPOINT);
    xhr.onload = () => {
      dispatch(completePostCreateTemplate());      
      dispatch(getTemplates());
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(form);
  };
}

export function archiveCampaigns(campaignIds) {
  return dispatch => {
    const jsonCampaignIds = JSON.stringify({ data: campaignIds });
    dispatch(requestPostCreateCampaign());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_CAMPAIGN_CHANGE_STATUS_ENDPOINT);
    xhr.onload = () => {
      dispatch(completePostCreateCampaign());
      dispatch(getCampaigns());
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(jsonCampaignIds);    
  };
}
export function postCreateCampaignCopy(form) {
  return dispatch => {
    dispatch(requestPostCreateCampaign());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_CAMPAIGN_COPY_ENDPOINT);
    xhr.onload = () => {
      dispatch(completePostCreateCampaign());
      dispatch(getCampaigns());      
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(form);
  };
}

export function postCreateCampaign(form, reset) {
  return dispatch => {
    dispatch(requestPostCreateCampaign());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_CAMPAIGN_ENDPOINT);
    xhr.onload = () => {
      if (xhr.responseText) {
        let response = JSON.parse(xhr.responseText);        
        if (response.campaignId){          
          const Campaignform = {
            id: response.campaignId
          };
          dispatch(postSendCampaign(JSON.stringify(Campaignform),'postCreateCampaign'));
        } else {
          setTimeout(() => {
            dispatch(destroy('createCampaign'));
          }, 50);
        }
      }else{
        setTimeout(() => {
          dispatch(destroy('createCampaign'));
        }, 50);
      }
      dispatch(completePostCreateCampaign());
      
      dispatch(getCampaigns());
      reset();
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(form);
  };
}

export function deleteCampaigns(campaignIds, campaigns) {
  return dispatch => {    
    const jsonCampaignIds = JSON.stringify({ data: campaignIds });
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', API_CAMPAIGN_ENDPOINT);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(jsonCampaignIds);
    xhr.onload = () => {
      const filterCampaigns = campaigns.filter(camp => !~campaignIds.indexOf(camp.id));
      dispatch(completeDeleteCampaigns(filterCampaigns));
    };
  };
}

export function postSendCampaign(campaign, action='') {
  return dispatch => {
    dispatch(requestPostSendCampaign());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_SEND_CAMPAIGN_ENDPOINT);
    xhr.onload = () => {
      const sendCampaignResponse = JSON.parse(xhr.responseText);
      dispatch(completePostSendCampaign(sendCampaignResponse.message, xhr.status));      
      if (action =='postCreateCampaign'){
        setTimeout(() => {
          dispatch(destroy('createCampaign'));
        }, 1500);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(campaign);
  };
}

export function postTestEmail(form) {
  return dispatch => {
    dispatch(requestPostSendTestEmail());

    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_TEST_SEND_CAMPAIGN_ENDPOINT);
    xhr.onload = () => {
      const sendTestEmailResponse = JSON.parse(xhr.responseText);
      dispatch(completePostSendTestEmail(sendTestEmailResponse.message, xhr.status));
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(form);
  };
}

export function getTemplates() {
  return dispatch => {
    dispatch(requestGetTemplates());
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_TEMPLATE_ENDPOINT);
    xhr.setRequestHeader('Accept', 'application/json, text/javascript');
    xhr.onload = () => {
      // Convert response from JSON
      const templatesArray = JSON.parse(xhr.responseText);
      dispatch(completeGetTemplates(templatesArray));
    };
    xhr.send();
  };
}

export function deleteTemplates(templateIds, templates) {
  return dispatch => {
    const jsonCampaignIds = JSON.stringify({ data: templateIds });
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', API_TEMPLATE_ENDPOINT);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(jsonCampaignIds);
    xhr.onload = () => {
      const filterTemplates = templates.filter(temp => !~templateIds.indexOf(temp.id));
      dispatch(completeDeleteTemplates(filterTemplates));
    };
  };
}
