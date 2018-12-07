import initialState from './initialState';
import {    
    REQUEST_POST_CREATEDRIP, COMPLETE_POST_CREATEDRIP,
    REQUEST_POST_SUBMITDRIP, COMPLETE_POST_SUBMITDRIP,
    REQUEST_GET_DRIPS, COMPLETE_GET_DRIPS, COMPLETE_DELETE_DRIPS,
} from '../constants/actionTypes';

export function createDrip(state = initialState.createDrip, action) {
    switch (action.type) {
        case REQUEST_POST_CREATEDRIP: {
            return {
                ...state,
                isPosting: true
            };
        }
        case COMPLETE_POST_CREATEDRIP: {
            return {
                ...state,
                isPosting: false,
                sendDripStatus: action.sendDripStatus,
                dripId: action.dripId
            };
        }
        default:
            return state;
    }
}
export function submitDrip(state = initialState.submitDrip, action) {
    switch (action.type) {
        case REQUEST_POST_SUBMITDRIP: {
            return {
                ...state,
                isDripSubmited: true
            };
        }
        case COMPLETE_POST_SUBMITDRIP: {
            return {
                ...state,
                isDripSubmited: false,                
            };
        }
        default:
            return state;
    }
}
export function manageDrip(state = initialState.manageDrip, action) {
    switch (action.type) {
        case REQUEST_GET_DRIPS: {
            return {
                ...state,
                isGetting: true
            };
        }
        case COMPLETE_GET_DRIPS: {
            return {
                ...state,
                drips: action.drips,
                isGetting: false
            };
        }
        case COMPLETE_DELETE_DRIPS: {
            return {
                ...state,
                drips: action.drips
            };
        }
        default:
            return state;
    }
}

export default {
    createDrip ,
    submitDrip,
    manageDrip
};
