export const TEST_ACTION = 'TEST_ACTION';

// campaignActions
export const REQUEST_POST_CREATECAMPAIGNSEQUENCE = 'REQUEST_POST_CREATECAMPAIGNSEQUENCE';
export const COMPLETE_POST_CREATECAMPAIGNSEQUENCE = 'COMPLETE_POST_CREATECAMPAIGNSEQUENCE';
export const REQUEST_GET_CAMPAIGNSSEQUENCE = 'REQUEST_GET_CAMPAIGNSSEQUENCE'
export const COMPLETE_GET_CAMPAIGNSSEQUENCE = 'COMPLETE_GET_CAMPAIGNSSEQUENCE'
export const COMPLETE_DELETE_CAMPAIGNSEQUENCE = 'COMPLETE_DELETE_CAMPAIGNSEQUENCE';

export const REQUEST_POST_CREATECAMPAIGN = 'REQUEST_POST_CREATECAMPAIGN';
export const COMPLETE_POST_CREATECAMPAIGN = 'COMPLETE_POST_CREATECAMPAIGN';
export const REQUEST_GET_CAMPAIGNS = 'REQUEST_GET_CAMPAIGNS';
export const COMPLETE_GET_CAMPAIGNS = 'COMPLETE_GET_CAMPAIGNS';
export const REQUEST_STOP_SENDING = 'REQUEST_STOP_SENDING';
export const COMPLETE_STOP_SENDING = 'COMPLETE_STOP_SENDING';

export const REQUEST_POST_CREATETEMPLATE = 'REQUEST_POST_CREATETEMPLATE';
export const COMPLETE_POST_CREATETEMPLATE = 'COMPLETE_POST_CREATETEMPLATE';
export const REQUEST_GET_TEMPLATES = 'REQUEST_GET_TEMPLATES';
export const COMPLETE_GET_TEMPLATES = 'COMPLETE_GET_TEMPLATES';

export const REQUEST_POST_SENDCAMPAIGN = 'REQUEST_POST_SENDCAMPAIGN';
export const COMPLETE_POST_SENDCAMPAIGN = 'COMPLETE_POST_SENDCAMPAIGN';
export const REQUEST_POST_SENDTESTEMAIL = 'REQUEST_POST_SENDTESTEMAIL';
export const COMPLETE_POST_SENDTESTEMAIL = 'COMPLETE_POST_SENDTESTEMAIL';

export const COMPLETE_DELETE_CAMPAIGNS = 'COMPLETE_DELETE_CAMPAIGNS';
export const COMPLETE_DELETE_TEMPLATES = 'COMPLETE_DELETE_TEMPLATES';

// listActions
export const REQUEST_ADD_SUBSCRIBERS = 'REQUEST_ADD_SUBSCRIBERS';
export const COMPLETE_ADD_SUBSCRIBERS = 'COMPLETE_ADD_SUBSCRIBERS';
export const REQUEST_GET_LISTS = 'REQUEST_GET_LISTS';
export const COMPLETE_GET_LISTS = 'COMPLETE_GET_LISTS';
export const REQUEST_GET_LIST_SUBSCRIBERS = 'REQUEST_GET_LIST_SUBSCRIBERS';
export const COMPLETE_GET_LIST_SUBSCRIBERS = 'COMPLETE_GET_LIST_SUBSCRIBERS';
export const COMPLETE_DELETE_LIST_SUBSCRIBERS = 'COMPLETE_DELETE_LIST_SUBSCRIBERS';
export const COMPLETE_DELETE_LISTS = 'COMPLETE_DELETE_LISTS';
export const COMPLETE_EDIT_LIST_NAME = 'COMPLETE_EDIT_LIST_NAME';

//SaleForce 
export const REQUEST_GET_SFREPORTS = 'REQUEST_GET_SFREPORTS';
export const COMPLETE_GET_SFREPORTS = 'COMPLETE_GET_SFREPORTS';
export const REQUEST_GET_SFREPORT_DETAILS = 'REQUEST_GET_SFREPORT_DETAILS';
export const COMPLETE_GET_SFREPORT_DETAILS = 'COMPLETE_GET_SFREPORT_DETAILS';

// permissionActions
// Granted permissions. Belong to the user offering another permissions
export const REQUEST_GET_GRANT_PERMISSION = 'REQUEST_GET_GRANT_PERMISSION';
export const COMPLETE_GET_GRANT_PERMISSION = 'COMPLETE_GET_GRANT_PERMISSION';
export const REQUEST_POST_GRANT_PERMISSION = 'REQUEST_POST_GRANT_PERMISSION';
export const COMPLETE_POST_GRANT_PERMISSION = 'COMPLETE_POST_GRANT_PERMISSION';
export const REQUEST_DELETE_GRANT_PERMISSION = 'REQUEST_DELETE_GRANT_PERMISSION';
export const COMPLETE_DELETE_GRANT_PERMISSION = 'COMPLETE_DELETE_GRANT_PERMISSION';

// Active permissions. Belong to  a user who has accepted permission offers from other users
export const REQUEST_GET_ACTIVE_PERMISSIONS = 'REQUEST_GET_ACTIVE_PERMISSIONS';
export const COMPLETE_GET_ACTIVE_PERMISSIONS = 'COMPLETE_GET_ACTIVE_PERMISSIONS';
export const REQUEST_DELETE_ACTIVE_PERMISSIONS = 'REQUEST_DELETE_ACTIVE_PERMISSIONS';
export const COMPLETE_DELETE_ACTIVE_PERMISSIONS = 'COMPLETE_DELETE_ACTIVE_PERMISSIONS';

// Received permissions. Belong to a user who has received permission offers from other users
export const REQUEST_GET_RECEIVED_PERMISSION_OFFERS = 'REQUEST_GET_RECEIVED_PERMISSION_OFFERS';
export const COMPLETE_GET_RECEIVED_PERMISSION_OFFERS = 'COMPLETE_GET_RECEIVED_PERMISSION_OFFERS';
export const REQUEST_POST_ACCEPT_RECEIVED_PERMISSION_OFFERS = 'REQUEST_POST_ACCEPT_RECEIVED_PERMISSION_OFFERS';
export const COMPLETE_POST_ACCEPT_RECEIVED_PERMISSION_OFFERS = 'COMPLETE_POST_ACCEPT_RECEIVED_PERMISSION_OFFERS';
export const REQUEST_DELETE_REJECT_RECEIVED_PERMISSION_OFFERS = 'REQUEST_DELETE_REJECT_RECEIVED_PERMISSION_OFFERS';
export const COMPLETE_DELETE_REJECT_RECEIVED_PERMISSION_OFFERS = 'COMPLETE_DELETE_REJECT_RECEIVED_PERMISSION_OFFERS';

// Active permissions. Belong to  a user who has offered another user permissions.
export const REQUEST_GET_GRANT_OFFERED_PERMISSIONS = 'REQUEST_GET_GRANT_OFFERED_PERMISSIONS';
export const COMPLETE_GET_GRANT_OFFERED_PERMISSIONS = 'COMPLETE_GET_GRANT_OFFERED_PERMISSIONS';
export const REQUEST_DELETE_GRANT_OFFERED_PERMISSIONS = 'REQUEST_DELETE_GRANT_OFFERED_PERMISSIONS';
export const COMPLETE_DELETE_GRANT_OFFERED_PERMISSIONS = 'COMPLETE_DELETE_GRANT_OFFERED_PERMISSIONS';

// Active acount
export const ACTIVATE_ACCOUNT = 'ACTIVATE_ACCOUNT';
export const DEACTIVATE_ACCOUNT = 'DEACTIVATE_ACCOUNT';

// settingsActions
export const SETTINGS_CHANGE_REQUEST = 'SETTINGS_CHANGE_REQUEST';
export const SETTINGS_CHANGE_RECEIVE = 'SETTINGS_CHANGE_RECEIVE';
export const SETTINGS_UPDATE_FIELDS_EXIST = 'SETTINGS_UPDATE_FIELDS_EXIST';

// notificationActions
export const RECEIVE_NOTIFICATION = 'RECEIVE_NOTIFICATION';
export const CONSUME_NOTIFICATION = 'CONSUME_NOTIFICATION';

// appActions
export const REQUEST_WS_PROFILE = 'REQUEST_WS_PROFILE';
export const COMPLETE_WS_PROFILE = 'COMPLETE_WS_PROFILE';
export const RECEIVE_WS_NOTIFICATION = 'RECEIVE_WS_NOTIFICATION';
export const CONSUME_WS_NOTIFICATION = 'CONSUME_WS_NOTIFICATION';
