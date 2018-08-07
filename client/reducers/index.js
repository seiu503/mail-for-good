import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import { createCampaign, createCampaignSequence, createTemplate, manageCampaign, manageTemplates, sendCampaign, sendTest, manageCampaignSequence } from './campaignReducer';
import { createList, manageList, manageListSubscribers, manageSFReport } from './listReducer';
import { profile } from './appReducer';
import settings from './settingsReducer';
import notifications from './notificationsReducer';
import { grantPermissions, receivedPermissionOffers, activePermissions, grantOfferedPermissions, activeAccount } from './permissionReducer';

const rootReducer = combineReducers({
  createCampaign,
  createCampaignSequence,
  createTemplate,
  manageCampaign,
  manageTemplates,
  sendCampaign,
  sendTest,
  createList,
  manageList,
  manageListSubscribers,
  settings,
  notifications,
  profile,
  grantPermissions,
  receivedPermissionOffers,
  activePermissions,
  grantOfferedPermissions,
  activeAccount,
  routing: routerReducer,
  form: formReducer,
  manageCampaignSequence,
  manageSFReport
});

export default rootReducer;
