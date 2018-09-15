import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { initialize } from 'redux-form';
import CreateCampaignForm from '../../components/campaigns/CreateCampaignForm';
import PreviewCampaignForm from '../../components/campaigns/PreviewCampaignForm';
import { postCreateCampaign, getTemplates, getCampaigns, postTestEmail } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';
import { getLists } from '../../actions/listActions';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';

function mapStateToProps(state) {
  // State reducer @ state.form & state.createCampaign & state.manageLists
  return {
    form: state.form.createCampaign,
    isPosting: state.createCampaign.isPosting,
    lists: state.manageList.lists,
    isGetting: state.manageList.isGetting,
    templates: state.manageTemplates.templates,    
    campaigns: state.manageCampaign.campaigns,
    isGettingCampaigns: state.manageCampaign.isGetting,

    // SendCampaign state
    isPostingSendCampaign: state.sendCampaign.isPosting,
    sendCampaignResponse: state.sendCampaign.sendCampaignResponse,
    sendCampaignStatus: state.sendCampaign.sendCampaignStatus,
    // SendTest state
    isPostingSendTest: state.sendTest.isPosting,
    sendTestEmailResponse: state.sendTest.sendTestEmailResponse,
    sendTestEmailStatus: state.sendTest.sendTestEmailStatus
  };
}

const mapDispatchToProps = { postCreateCampaign, getLists, getTemplates, initialize, notify, getCampaigns, postTestEmail };

export class CreateCampaignComponent extends Component {

  static propTypes = {
    form: PropTypes.object,
    isPosting: PropTypes.bool.isRequired,
    postCreateCampaign: PropTypes.func.isRequired,
    postTestEmail: PropTypes.func.isRequired,
    getLists: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    isGetting: PropTypes.bool.isRequired,
    getTemplates: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    initialize: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
    getCampaigns: PropTypes.func.isRequired,
    campaigns: PropTypes.array.isRequired,
    isGettingCampaigns: PropTypes.bool.isRequired,

    isPostingSendCampaign: PropTypes.bool.isRequired,
    sendCampaignResponse: PropTypes.string.isRequired,
    sendCampaignStatus: PropTypes.number.isRequired,

    isPostingSendTest: PropTypes.bool.isRequired,
    sendTestEmailResponse: PropTypes.string.isRequired,
    sendTestEmailStatus: PropTypes.number.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.lastPage = this.lastPage.bind(this);
    this.applyTemplate = this.applyTemplate.bind(this);
    this.validationFailed = this.validationFailed.bind(this);
    this.passResetToState = this.passResetToState.bind(this);
    this.openTestSendModal = this.openTestSendModal.bind(this);
    this.closeTestSendModal = this.closeTestSendModal.bind(this);
    this.sendTestEmail = this.sendTestEmail.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.scheduleCampaign = this.scheduleCampaign.bind(this);
  }

  state = {
    page: 1,
    initialFormValues: {
      campaignName: `Campaign - ${moment().format('l, h:mm:ss')}`,
      type: 'Plaintext',
      unsubscribeLinkEnabled: true
    },
    reset: null,
    showTestSendModal: false,
    testEmail: '',
    isEdit: false,
    showScheduleDate: false,
    sendCampaign: false,
  }

  componentDidMount() {
    const slug = this.props.params.slug;
    if(slug=== undefined){      
      this.props.initialize('createCampaign', this.state.initialFormValues);
    }
    this.props.getLists();
    this.props.getTemplates();
    this.props.getCampaigns();
    if (this.props.campaigns.length){
      this.getSingleCampaign(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.campaigns && nextProps.campaigns.length && !this.props.campaigns.length) { // Guarded and statement that confirms campaigns is in the new props, confirms the array isn't empty, and then confirms that current props do not exist    
      this.getSingleCampaign(nextProps);
    }

    // Show success/failure toast for send campaign
    const sendCampaignResponseExists = !!nextProps.sendCampaignResponse;
    const justSentCampaign = !nextProps.isPostingSendCampaign && this.props.isPostingSendCampaign;
    if (sendCampaignResponseExists && justSentCampaign) {
      this.setState({ haveShownMessage: true });
      if (nextProps.sendCampaignStatus === 200) {
        this.props.notify({
          message: 'Your campaign is being sent',
          colour: 'green'
        });
      } else {
        this.props.notify({
          message: 'There was an error sending your campaign'
        });
      }
      this.context.router.push(`/campaigns/manage`);
    }else{
      // Fires when campaign has been successfully created
      if (this.props.isPosting === true && nextProps.isPosting === false && this.state.sendCampaign==false) {
        this.context.router.push(`/campaigns/manage`);
      }
    }
    // Test email response
    const sendTestEmailResponseExists = !!nextProps.sendTestEmailResponse;
    const justSentTestEmail = !nextProps.isPostingSendTest && this.props.isPostingSendTest;
    if (sendTestEmailResponseExists && justSentTestEmail) {
      this.setState({ haveShownMessage: true });
      if (nextProps.sendTestEmailStatus === 200) {
        this.props.notify({
          message: 'Your test email is being sent',
          colour: 'green'
        });
      } else {
        this.props.notify({
          message: nextProps.sendTestEmailResponse
        });
      }
    }
    
  }
  getSingleCampaign(props) {
    const slug = this.props.params.slug;
    if (slug) {      
      const getCampaignBySlug = props.campaigns.find(campaigns => campaigns.slug === slug);      
      if (getCampaignBySlug) {
        if(getCampaignBySlug.status=='done'){
          this.props.notify({
            message: 'Your cannot edit the campaign',
            colour: 'red'
          });
          this.context.router.push(`/campaigns/manage`);
        }
        this.setState({ isEdit: true });
        const correctForm = Object.assign({}, getCampaignBySlug, {
          ['campaignName']: getCampaignBySlug.name,
          [`emailBody${getCampaignBySlug.type}`]: getCampaignBySlug.emailBody,
          ['scheduleDateEnabled']: (getCampaignBySlug.scheduledatetime !='')?true:false,
          ['unsubscribeLinkEnabled'] : true
        });
        
        delete correctForm['campaignanalytic.clickthroughCount'];
        delete correctForm['campaignanalytic.complaintCount'];
        delete correctForm['campaignanalytic.openCount'];
        delete correctForm['campaignanalytic.permanentBounceCount'];
        delete correctForm['campaignanalytic.totalSentCount'];
        delete correctForm['campaignanalytic.transientBounceCount'];
        delete correctForm['campaignanalytic.undeterminedBounceCount'];
        delete correctForm['status'];
        delete correctForm['sequenceCount'];
        delete correctForm['emailBody'];
        delete correctForm['createdAt'];
        delete correctForm['updatedAt'];

        this.props.initialize('createCampaign', correctForm);
        
        //show/hide schedule date 
        (getCampaignBySlug.scheduledatetime !='') ? this.setState({ showScheduleDate: true}) : '';
        
        setTimeout(() => {          
          const formValues = this.props.form.values;
          const listId = getCampaignBySlug.listId;          
          const listIdName = this.props.lists.find(lists => lists.id === listId);          
          if (listIdName){            
            const correctForm = Object.assign({}, formValues, {
              ['listName']: listIdName.name
            });
            this.props.initialize('createCampaign', correctForm);
          }
        }, 1000);      
      }
    }
  }
  handleSubmit(status) {
    const formValues = this.props.form.values;
    // Extract emailBodyPlaintext or emailBodyHTML as our emailBody
    const correctForm = Object.assign({}, formValues, {
      emailBody: formValues[`emailBody${formValues.type}`],
      status: status,
      scheduledatetime: (this.state.showScheduleDate == false) ? '' : formValues.scheduledatetime
    });
    if (this.state.showScheduleDate == false){
      delete correctForm['scheduledatetime'];
    }
    if (status == 'ready' && this.state.showScheduleDate ==false){
      this.setState({ sendCampaign: true});
    }
    delete correctForm[`emailBody${formValues.type}`];    
    
    this.props.postCreateCampaign(JSON.stringify(correctForm), this.state.reset);
    let message='';
    if (this.state.isEdit && status !='ready'){
      message='Campaign is being updated.'
      this.props.notify({
        message: message,
        colour: 'green'
      });
    }else{
      if (status == 'draft' || this.state.showScheduleDate == true){
        if(status == 'draft'){
          message = 'Campaign is being drafted.';
        }else{
          message = 'Campaign is being created - it will be ready to send soon.';
        }
        this.props.notify({
          message: message,
          colour: 'green'
        });
      }
    }
    
  }

  applyTemplate(template) {
    if (template) {
      // Set the template's emailBody prop to emailBodyPlaintext or emailBodyHTML
      const FilterTemplate = Object.assign({}, template);      
      delete FilterTemplate.id;
      delete FilterTemplate.unsubscribeLinkEnabled;      
      const correctTemplate = Object.assign({}, FilterTemplate, {
        [`emailBody${template.type}`]: template.emailBody,
      });

      delete correctTemplate.emailBody;

      const applyTemplateOnTopOfCurrentValues = Object.assign({}, this.props.form.values, correctTemplate);
      this.props.initialize('createCampaign', applyTemplateOnTopOfCurrentValues);
    } else {
      this.props.notify({ message: 'You have not selected a valid template' });
    }
  }


  scheduleCampaign(test){
    if (this.state.showScheduleDate == false) {      
      this.setState({ showScheduleDate: true });
    } else {      
      this.setState({ showScheduleDate: false });
    }
  }

  nextPage() {
    this.setState({ page: this.state.page + 1 });
  }

  lastPage() {
    this.setState({ page: this.state.page - 1 });
  }

  validationFailed(reason) {
    this.props.notify({
      message: reason
    });
  }

  passResetToState(reset) {
    this.setState({ reset });
  }
  openTestSendModal() {    
    this.setState({
      showTestSendModal: true
    });
  }
  closeTestSendModal() {
    this.setState({
      showTestSendModal: false
    });
  }
  handleChange(e) {    
    this.setState({
      [e.target.id]: e.target.value
    });
  }
  sendTestEmail() {
    // Get the test email & campaignId then dispatch to the action controller
    const { testEmail } = this.state;
    if (!testEmail) {
      this.props.notify({ message: 'Please provide an email' });
      return;
    }
    
    const formValues = this.props.form.values;
    const listIdName = this.props.lists.find(lists => lists.name === formValues.listName);
    
    const correctForm = Object.assign({}, formValues, {
      ['name']: formValues.campaignName,
      ['emailBody']: formValues[`emailBody${formValues.type}`],
      ['listId']: listIdName.id
    });
    
    const campaignId='';
    const form = { testEmail, campaignId, correctForm};
    this.props.postTestEmail(JSON.stringify(form));
    this.setState({
      testEmail: ''
    });
    this.closeTestSendModal();
  }
  render() {
    const { page, initialFormValues, showTestSendModal, testEmail, isEdit, showScheduleDate } = this.state;
    const { lists, templates, form, isGetting, isPosting, isGettingCampaigns, isPostingSendTest, isPostingSendCampaign } = this.props;    
    const type = (this.props.form && this.props.form.values.type) ? this.props.form.values.type : this.state.initialFormValues.type;    
    return (
      <div>
        <div className="content-header">
          <h1>{(isEdit) ? 'Edit Campaign' :'Create Campaign'}
            <small>{(isEdit) ? 'Update campaign' :'Create a new campaign'}</small>
          </h1>
        </div>

        <section className="content">
          <div className="box box-primary">
            <div className="box-body">
              {page === 1 &&
                <CreateCampaignForm
                  passResetToState={this.passResetToState}
                  textEditorType={type}
                  applyTemplate={this.applyTemplate}
                  templates={templates}
                  lists={lists}
                  validationFailed={this.validationFailed}
                  nextPage={this.nextPage}
                  showScheduleDate={showScheduleDate}
                  scheduleCampaign={this.scheduleCampaign}
                  initialValues={initialFormValues} />}
              {page === 2 &&
                <PreviewCampaignForm
                  form={form}
                  lastPage={this.lastPage}
                  handleSubmit={this.handleSubmit}
                  testEmail={testEmail}
                  handleChange={this.handleChange}
                  showTestSendModal={showTestSendModal}
                  openTestSendModal={this.openTestSendModal}
                  closeTestSendModal={this.closeTestSendModal}
                  sendTestEmail={this.sendTestEmail}
                  showScheduleDate={showScheduleDate}
                  />}
            </div>

            {isGetting || isPosting || isGettingCampaigns || isPostingSendTest || isPostingSendCampaign && <div className="overlay">
              <FontAwesome name="refresh" spin />
            </div>}
          </div>
        </section>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCampaignComponent);
