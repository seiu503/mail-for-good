import React, { PropTypes } from 'react';
import { Field, FieldArray, reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';
import { Combobox } from 'react-widgets';
import _ from 'lodash';

import { renderCombobox, renderField, renderTextEditor, renderEditorTypeRadio, renderDatePicker } from '../common/FormRenderWrappers';

// Ref redux-form http://redux-form.com/6.0.5/docs/GettingStarted.md/
// Ref react-widgets https://jquense.github.io/react-widgets/ (for examples see https://github.com/erikras/redux-form/blob/master/examples/react-widgets/src/ReactWidgetsForm.js)
// Ref react-rte https://github.com/sstur/react-rte


const CreateCampaignSequenceForm = props => {

    const {
    touch,
        valid,
        invalid,
        pristine,
        submitting,
        nextPage,
        reset,
        applyTemplate,
        validationFailed,
        textEditorType,
        passResetToState,
  } = props;

    const lists = props.lists.map(x => x.name);
    const templates = props.templates.map(x => x.name);
    const CampaignDetails = props.CampaignDetails;
    const nameArray = [        
        'emailSubject',
        'emailBodyPlaintext',
        'emailBodyHTML',
        'emailBodyHTMLEditor',
        'type',
        'sequenceday',
        'campaignid',        
    ]; // A list of all fields that need to show errors/warnings

    const resetFormAndSubmit = (e) => {
        e.preventDefault();
        if (valid) {
            passResetToState(reset);
            nextPage();
        } else {
            touch(...nameArray);
            validationFailed('Form is invalid, please review fields with errors');
        }
    };

    const applyForm = (applyTemplateValue) => {
        const foundTemplate = props.templates.find(x => x.name === applyTemplateValue);
        applyTemplate(foundTemplate);
    };

    const resetForm = () => {
        reset();
    };  
        
    
    return (
        <div>
            <form onSubmit={resetFormAndSubmit}>                
                <h3>Campaign sequence details</h3>
                <h3>Apply template</h3>
                <Combobox id="templates" data={templates} suggest={true} onSelect={value => applyForm(value)} filter="contains" />
                <br /> 
                <Field name="sequenceday" type="number" component={renderField} label="Send after how many day" />         <hr/>     
                <h3>Create email</h3>
                <Field name="type" component={renderEditorTypeRadio} label="Type of email" />
                <Field name="emailSubject" component={renderField} label="Subject*" type="text" />
                <div hidden={true}><Field name="emailBodyDesign" component={renderField} label="emailBodyDesign" type="text" /></div>
                {/* We only want to render the textEditor that we are using, and we maintain state for each */}
                <Field name={`emailBody${textEditorType}`} emailBody={`emailBody${textEditorType}`} component={renderTextEditor} label="Write Email*" textEditorType={textEditorType} />
                
                <br />
                <div className="box-footer">
                    <div className="btn-group">
                        <button className="btn btn-success btn-lg btn-hug" type="submit" disabled={pristine || submitting}>Next Step</button>
                        <button className="btn btn-danger btn-lg btn-hug" type="button" disabled={pristine || submitting} onClick={resetForm}>Reset</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

CreateCampaignSequenceForm.propTypes = {
    ...reduxFormPropTypes,
    nextPage: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    templates: PropTypes.array.isRequired,
    applyTemplate: PropTypes.func.isRequired,
    validationFailed: PropTypes.func.isRequired,
    textEditorType: PropTypes.string.isRequired,
    passResetToState: PropTypes.func.isRequired,
    CampaignDetails: PropTypes.number.isRequired,
};

const validate = (values, props) => {
    const errors = {};    
    if (!values.sequenceday) {
        errors.sequenceday = 'Required';
    }else{        
        if (values.sequenceday<=0){
            errors.sequenceday = 'Sequence day should be grater then 0';
        }
        if (values.sequenceday > 1000) {
            errors.sequenceday = 'Sequence day should be less then 1000';
        }
    }
    if (!values.emailSubject) {
        errors.emailSubject = 'Required';
    }

    // For the fields below, bare in mind there is only ever one rendered email editor
    // But multiple state fields
    if (!values.emailBodyPlaintext && values.type === 'Plaintext') {
        errors.emailBodyPlaintext = 'Required';
    } else {
        if (values.emailBodyPlaintext && values.emailBodyPlaintext.indexOf('%%unsubscribe%%') == -1) {
            errors.emailBodyPlaintext = 'Please add unsubscribe link';
        }
    }
    // <div><br></div> is what an empty quill editor contains
    if (!values.emailBodyHTML && values.type === 'HTML') {
        errors.emailBodyHTML = 'Required';
    } else {
        if (values.emailBodyHTML && values.emailBodyHTML.indexOf('%%unsubscribe%%') == -1) {
            errors.emailBodyHTML = 'Please add unsubscribe link';
        }
    }
    if (!values.emailBodyHTMLEditor && values.type === 'HTMLEditor') {
        errors.emailBodyHTMLEditor = 'Required';
    } else {
        if (values.emailBodyHTMLEditor && values.emailBodyHTMLEditor.indexOf('%%unsubscribe%%') == -1) {
            errors.emailBodyHTMLEditor = 'Please add unsubscribe link';
        }
    }

    if (!values.type) {
        errors.type = 'Required';
    }

    return errors;
};

export default reduxForm({
    form: 'createCampaignSequence',    
    destroyOnUnmount: false,
    validate
})(CreateCampaignSequenceForm);
