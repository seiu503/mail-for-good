export const BASE_URL = window.location.origin;

// Dashboard

// Campaigns
export const API_CAMPAIGN_ENDPOINT = BASE_URL + '/api/campaign'; // REST (post = new campaign, get = get list of campaigns, put = update campaign, del = delete campaign)
export const API_CAMPAIGN_SEQUENCE_ENDPOINT = BASE_URL + '/api/campaignsequence'; // REST (post = new campaign, get = get list of campaigns, put = update campaign, del = delete campaign)
export const API_CAMPAIGN_SEQUENCE_LISTING_ENDPOINT = BASE_URL + '/api/campaignsequencelisting'; // REST (post = new campaign, get = get list of campaigns, put = update campaign, del = delete campaign)
export const API_SEND_CAMPAIGN_ENDPOINT = BASE_URL + '/api/send';
export const API_TEST_SEND_CAMPAIGN_ENDPOINT = BASE_URL + '/api/test';
export const API_TEMPLATE_ENDPOINT = BASE_URL + '/api/template';
export const API_STOP_SENDING = BASE_URL + '/api/stop';
export const API_CRON_CAMPAIGN_ENDPOINT = BASE_URL + '/api/allcampaign';
export const API_SEND_CRON_CAMPAIGN_ENDPOINT = BASE_URL + '/api/cronsend';
export const API_SEND_CRON_CAMPAIGN_SEQUENCE_ENDPOINT = BASE_URL + '/api/cronsendsequence';
export const API_TEMPLATE_COPY_ENDPOINT = BASE_URL + '/api/templatecopy';
export const API_CAMPAIGN_COPY_ENDPOINT = BASE_URL + '/api/campaigncopy';
export const API_CAMPAIGN_CHANGE_STATUS_ENDPOINT = BASE_URL + '/api/changecampaignstatus';

// Lists
// should refactor above variables for consistency (API_...)
export const API_SUBSCRIBERS_ENDPOINT = BASE_URL + '/api/list/add/subscribers';
export const API_IMPORTCSV_ENDPOINT = BASE_URL + '/api/list/add/csv';
export const API_MANAGELIST_ENDPOINT = BASE_URL + '/api/list/manage';
export const API_LISTSUBSCRIBERS_ENDPOINT = BASE_URL + '/api/list/subscribers';
export const API_LIST_ENDPOINT = BASE_URL + '/api/list';
//SaleForce 
export const API_SFREPORTSLIST_ENDPOINT = BASE_URL + '/api/salesforcereports';
export const API_SFREPORTDETAILS_ENDPOINT = BASE_URL + '/api/salesforcereportsdetails';

// Analytics

// Permissions
export const API_GRANT_PERMISSIONS_ENDPOINT = '/api/permissions';
export const API_ACTIVE_PERMISSIONS_ENDPOINT = '/api/active-permissions';
export const API_RECEIVED_PERMISSIONS_ENDPOINT = '/api/received-permissions';
export const API_GRANT_OFFERED_PERMISSIONS_ENDPOINT = '/api/grant-offered-permissions';

// Settings
export const SETTINGS_URL_RELATIVE = '/api/settings';
export const API_SETTINGS_ENDPOINT = BASE_URL + SETTINGS_URL_RELATIVE;
