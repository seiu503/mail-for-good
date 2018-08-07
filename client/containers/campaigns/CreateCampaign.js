import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { initialize } from 'redux-form';
import CreateCampaignForm from '../../components/campaigns/CreateCampaignForm';
import PreviewCampaignForm from '../../components/campaigns/PreviewCampaignForm';
import { postCreateCampaign, getTemplates, getCampaigns, getAllCampaigns } from '../../actions/campaignActions';
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
  };
}

const mapDispatchToProps = { postCreateCampaign, getLists, getTemplates, initialize, notify, getCampaigns };

export class CreateCampaignComponent extends Component {

  static propTypes = {
    form: PropTypes.object,
    isPosting: PropTypes.bool.isRequired,
    postCreateCampaign: PropTypes.func.isRequired,
    getLists: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    isGetting: PropTypes.bool.isRequired,
    getTemplates: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    initialize: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
    campaigns: PropTypes.array.isRequired,
    getCampaigns: PropTypes.func.isRequired,
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
  }

  state = {
    page: 1,
    initialFormValues: {
      campaignName: `Campaign - ${moment().format('l, h:mm:ss')}`,
      type: 'Plaintext'
    },
    reset: null
  }

  componentWillMount() {
    this.props.getLists();
    this.props.getTemplates();
    //this.props.getCampaigns();
    //this.getSingleCampaign(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPosting === true && nextProps.isPosting === false) { // Fires when campaign has been successfully created
      this.context.router.push(`/campaigns/manage`);
    }

    /* if (nextProps.campaigns && nextProps.campaigns.length && !this.props.campaigns.length) { // Guarded and statement that confirms campaigns is in the new props, confirms the array isn't empty, and then confirms that current props do not exist
      this.getSingleCampaign(nextProps);
    } */
  }
  getSingleCampaign(props) {
    const slug = this.props.params.slug;
    if (slug) {
      const getCampaignBySlug = props.campaigns.find(campaigns => campaigns.slug === slug);
      if (getCampaignBySlug) {

        const listId = getCampaignBySlug.listId;
        const listIdName = props.lists.find(lists => lists.id === listId);

        const correctForm = Object.assign({}, getCampaignBySlug, {
          ['campaignName']: this.state.initialFormValues.campaignName,
          [`emailBody${getCampaignBySlug.type}`]: getCampaignBySlug.emailBody,
          ['listName']: listIdName.name
        });
        delete correctForm['campaignanalytic.clickthroughCount'];
        delete correctForm['campaignanalytic.complaintCount'];
        delete correctForm['campaignanalytic.openCount'];
        delete correctForm['campaignanalytic.permanentBounceCount'];
        delete correctForm['campaignanalytic.totalSentCount'];
        delete correctForm['campaignanalytic.transientBounceCount'];
        delete correctForm['campaignanalytic.undeterminedBounceCount'];
        delete correctForm['emailBody'];
        delete correctForm['createdAt'];
        delete correctForm['updatedAt'];
        //console.log(correctForm);
        this.props.initialize('createCampaign', correctForm);
      }
    }
  }
  handleSubmit() {
    const formValues = this.props.form.values;
    // Extract emailBodyPlaintext or emailBodyHTML as our emailBody
    const correctForm = Object.assign({}, formValues, {
      emailBody: formValues[`emailBody${formValues.type}`],
    });

    delete correctForm[`emailBody${formValues.type}`];

    this.props.postCreateCampaign(JSON.stringify(correctForm), this.state.reset);
    this.props.notify({
      message: 'Campaign is being created - it will be ready to send soon.',
      colour: 'green'
    });
  }

  applyTemplate(template) {
    if (template) {
      // Set the template's emailBody prop to emailBodyPlaintext or emailBodyHTML
      const correctTemplate = Object.assign({}, template, {
        [`emailBody${template.type}`]: template.emailBody,
      });

      delete correctTemplate.emailBody;

      const applyTemplateOnTopOfCurrentValues = Object.assign({}, this.props.form.values, correctTemplate);
      this.props.initialize('createCampaign', applyTemplateOnTopOfCurrentValues);
    } else {
      this.props.notify({ message: 'You have not selected a valid template' });
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

  render() {
    const { page, initialFormValues } = this.state;
    const { lists, templates, form, isGetting, isPosting } = this.props;

    const type = (this.props.form && this.props.form.values.type) ? this.props.form.values.type : this.state.initialFormValues.type;

    return (
      <div>
        <div className="content-header">
          <h1>Create Campaign
            <small>Create a new campaign</small>
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
                  initialValues={initialFormValues} />}
              {page === 2 &&
                <PreviewCampaignForm
                  form={form}
                  lastPage={this.lastPage}
                  handleSubmit={this.handleSubmit} />}
            </div>

            {isGetting || isPosting && <div className="overlay">
              <FontAwesome name="refresh" spin />
            </div>}
          </div>
        </section>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCampaignComponent);
