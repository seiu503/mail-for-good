import initialState from './initialState';
import {
  COMPLETE_ADD_SUBSCRIBERS, REQUEST_ADD_SUBSCRIBERS,
  REQUEST_GET_LISTS, COMPLETE_GET_LISTS,
  REQUEST_GET_LIST_SUBSCRIBERS, COMPLETE_GET_LIST_SUBSCRIBERS,
  COMPLETE_DELETE_LIST_SUBSCRIBERS, COMPLETE_DELETE_LISTS, COMPLETE_EDIT_LIST_NAME,
  REQUEST_GET_SFREPORTS, COMPLETE_GET_SFREPORTS,
  REQUEST_GET_SFREPORT_DETAILS, COMPLETE_GET_SFREPORT_DETAILS
} from '../constants/actionTypes';

export function manageListSubscribers(state = initialState.manageListSubscribers, action) {
  switch(action.type) {
    case REQUEST_GET_LIST_SUBSCRIBERS: {
      return {...state,
        isGetting: true,
        listId: action.listId
      };
    }
    case COMPLETE_GET_LIST_SUBSCRIBERS: {
      return {
        ...state,
        isGetting: false,
        subscribers: action.subscribers,
        totalListSubscribers: action.totalListSubscribers,
        additionalFields: action.additionalFields
      };
    }
    case COMPLETE_DELETE_LIST_SUBSCRIBERS: {
      return {...state,
        subscribers: action.subscribers
      };
    }
    default:
      return state;
  }
}

export function createList(state = initialState.createList, action) {
  switch (action.type) {
    case REQUEST_ADD_SUBSCRIBERS: {
      return {...state,
        isPosting: true,
        upload: action.upload
      };
    }
    case COMPLETE_ADD_SUBSCRIBERS: {
      return {...state,
        isPosting: false,
        upload: null
      };
    }
    default:
      return state;
  }
}

export function manageList(state = initialState.manageList, action) {
  switch (action.type) {
    case REQUEST_GET_LISTS: {
      return {...state,
        isGetting: true
      };
    }
    case COMPLETE_GET_LISTS: {
      return {...state,
        lists: action.lists,
        isGetting: false
      };
    }
    case COMPLETE_DELETE_LISTS: {
      return {...state,
        lists: action.lists
      };
    }
    case COMPLETE_EDIT_LIST_NAME: {
      return {...state,
        lists: action.lists
      };
    }
    default:
      return state;
  }
}
export function manageSFReport(state = initialState.manageSFReport, action) {  
  switch (action.type) {
    case REQUEST_GET_SFREPORTS: {
      return {
        ...state,
        isReportGetting: true
      };
    }    
    case COMPLETE_GET_SFREPORTS: {
      return {
        ...state,
        reports: action.reports,
        isReportGetting: false
      };
    }
    case REQUEST_GET_SFREPORT_DETAILS: {
      return {
        ...state,
        isReportDetailsGetting: true
      };
    }    
    case COMPLETE_GET_SFREPORT_DETAILS: {
      return {
        ...state,
        reportDetails: action.reportDetails,
        isReportDetailsGetting: false
      };
    }    
    default:
      return state;
  }
}
export default {
  createList,
  manageList,
  manageSFReport
};
