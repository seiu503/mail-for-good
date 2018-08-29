import React, { PropTypes } from 'react';
import DOMPurify from 'dompurify';
import { Modal, Button } from 'react-bootstrap';
const PreviewCampaignForm = props => {
  const { handleSubmit, lastPage, testEmail, handleChange, showTestSendModal, openTestSendModal, closeTestSendModal, sendTestEmail, showScheduleDate } = props;
  const isCreateCampaignPreview = !!props.form;
  let text;
  let form;
  let type;
  if (isCreateCampaignPreview) {
    // form = { listName, campaignName, fromName, fromEmail, emailSubject, emailBodyPlaintext OR emailBodyHTML, type }
    form = props.form.values;
    type = form.type;
    if (type === 'Plaintext') {
      text = form.emailBody ? form.emailBody : form[`emailBody${form.type}`];
    } else {
      text = DOMPurify.sanitize(form.emailBody ? form.emailBody : form[`emailBody${form.type}`]); // Purify to prevent xss attacks
    }
  } else {
    // In this case, the preview is rendered within the CampaignView container
    // We may receive plaintext or html from the server.
    if (props.campaignView === undefined){
      form={
        type: '',
        listName: '',
        campaignName: '',
        name: '',
        fromName: '',
        emailSubject: '',
        emailBody: ''
      };
      type = '';
      text = '';
    }else{
      form = props.campaignView;
      type = form.type;
      text = props.campaignView.emailBody;
    }

  }

  return (
    <div>
      {form.listName && <h3><i className="fa fa-list text-green" aria-hidden="true" /> - {form.listName}</h3>}
      <h3><i className="fa fa-flag text-green" aria-hidden="true" /> - {form.campaignName || form.name}</h3>

      <hr />

      <h4><strong>From: {`${form.fromName} <${form.fromEmail}>`}</strong></h4>
      <h4><strong>Subject: {`${form.emailSubject}`}</strong></h4>
      {type === 'HTML' || type === 'HTMLEditor'
      ?

      <blockquote>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </blockquote>

      :

      <textarea
        className="form-control"
        disabled
        style={{ width: "100%", minHeight: "60vh" }}
        value={text} />
      }

      {!isCreateCampaignPreview && <hr />}
      {(lastPage && handleSubmit) &&
      <div className="box-footer">
        <div className="btn-group">
          <button style={{ margin: "1em", width: "170px" }} className="btn btn-lg btn-primary" type="button" onClick={lastPage}>Edit</button>
          <button style={{ margin: "1em", width: "170px" }} className="btn btn-lg btn-success" type="button" onClick={handleSubmit.bind(this, 'ready')}>{(showScheduleDate) ? 'Schedule Message' : 'Send Now'}</button>
          <button style={{ margin: "1em", width: "170px" }} className="btn btn-lg btn-warning" type="button" onClick={handleSubmit.bind(this, 'draft')}>Save as Draft</button>
          <button style={{ margin: "1em", width: "170px" }} className="btn btn-lg btn-info" type="button" onClick={openTestSendModal}>Send a test email</button>
        </div>
      </div>}
      {/* Modal for sending test emails */}
      <Modal show={showTestSendModal} onHide={closeTestSendModal}>
        <Modal.Header closeButton>
          <Modal.Title>Send a test email</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <input className="form-control" style={{ "marginLeft": "1rem" }} id="testEmail" placeholder="Send a test email to:" type="email" value={testEmail} onChange={handleChange} />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={closeTestSendModal}>Cancel</Button>
          <Button bsStyle="primary" onClick={sendTestEmail}>Send Test Email</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

PreviewCampaignForm.propTypes = {
  handleSubmit: PropTypes.func,
  lastPage: PropTypes.func,
  form: PropTypes.object,
  campaignView: PropTypes.object,
  showTestSendModal: PropTypes.bool,
  testEmail: PropTypes.string,
  openTestSendModal: PropTypes.func,
  closeTestSendModal: PropTypes.func,
  sendTestEmail: PropTypes.func,
  handleChange: PropTypes.func,
  showScheduleDate: PropTypes.bool
};

export default PreviewCampaignForm;
