import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { initialize } from 'redux-form';
import CreateCampaignSequenceForm from '../../components/campaigns/CreateCampaignSequenceForm';
import PreviewCampaignSequenceForm from '../../components/campaigns/PreviewCampaignSequenceForm';
import { getCampaigns, getCampaignSequence, postCreateCampaignSequence, getTemplates } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';
import { getLists } from '../../actions/listActions';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';

function mapStateToProps(state) {
    // State reducer @ state.form & state.createCampaignSequence & state.manageLists
    return {
        form: state.form.createCampaignSequence,
        isPosting: state.createCampaignSequence.isPosting,
        lists: state.manageList.lists,
        isGetting: state.manageList.isGetting,
        templates: state.manageTemplates.templates,
        campaigns: state.manageCampaign.campaigns,
        campaignsequences: state.manageCampaignSequence.campaignsequences,
        /* thisCampaign: state.manageTemplates.templates, */
    };
}

const mapDispatchToProps = { getCampaigns, getCampaignSequence, postCreateCampaignSequence, getLists, getTemplates, initialize, notify };

export class CreateCampaignSequenceComponent extends Component {

    static propTypes = {
        form: PropTypes.object,
        isPosting: PropTypes.bool.isRequired,
        postCreateCampaignSequence: PropTypes.func.isRequired,
        getLists: PropTypes.func.isRequired,
        lists: PropTypes.array.isRequired,
        isGetting: PropTypes.bool.isRequired,
        getTemplates: PropTypes.func.isRequired,
        templates: PropTypes.array.isRequired,
        initialize: PropTypes.func.isRequired,
        notify: PropTypes.func.isRequired,
        getCampaigns: PropTypes.func.isRequired,
        campaigns: PropTypes.array.isRequired,
        getCampaignSequence: PropTypes.func.isRequired,
        /* thisCampaign: PropTypes.array.isRequired */
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
            type: 'Plaintext',
            campaignid:0,
            id:0
        },
        reset: null,        
        thisCampaign: 0,
        sequenceSetStatus:false
       
    }

    componentDidMount() {
        this.props.getLists();
        this.props.getTemplates();
    }
    componentWillMount() {
        // Update campaigns only if we need to
        if (!this.props.campaigns.length) {
            this.props.getCampaigns();
        } else {
            this.getSingleCampaign(this.props);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.isPosting === true && nextProps.isPosting === false) { // Fires when campaign has been successfully created
            this.context.router.push(`/campaigns/manage`);
        }
        if (nextProps.campaigns && nextProps.campaigns.length && !this.props.campaigns.length) { // Guarded and statement that confirms campaigns is in the new props, confirms the array isn't empty, and then confirms that current props do not exist
            this.getSingleCampaign(nextProps);
        }        
        if (this.props.params.sequenceid && this.props.params.sequenceid !=''){
            if (nextProps.campaignsequences.length > 0 && this.state.sequenceSetStatus==false) {
                this.setState({
                    sequenceSetStatus: true
                });
                //console.log(nextProps.campaignsequences);
                const getCampaignSequence = nextProps.campaignsequences.find(seq => seq.id == this.props.params.sequenceid);                
                if (getCampaignSequence && !getCampaignSequence.length){                    
                    const updatesequence = Object.assign({}, getCampaignSequence, {                        
                        [`emailBody${getCampaignSequence.type}`]: getCampaignSequence.emailBody
                    });
                    delete updatesequence.emailBody;                    
                    const updateCampaignSequenceValues = Object.assign({}, updatesequence);
                    this.props.initialize('createCampaignSequence', updateCampaignSequenceValues);
                }
            }
        }
    }
    getSingleCampaign(props) {
        // This method retrieves a single campaign from this.props.campaigns based on the parameter in the url
        const slug = this.props.params.slug;
        const getCampaignBySlug = props.campaigns.find(campaign => campaign.slug === slug);
        this.setState({
            thisCampaign: getCampaignBySlug.id
        });
        this.props.getCampaignSequence(getCampaignBySlug.id);

        const updatecampaignid = Object.assign({}, this.state.initialFormValues, {
            ['campaignid']: getCampaignBySlug.id,
            ['sequenceCount']: getCampaignBySlug.sequenceCount
        });
        const updateCampaignIdOnTopOfCurrentValues = Object.assign({}, updatecampaignid);
        this.props.initialize('createCampaignSequence', updateCampaignIdOnTopOfCurrentValues);
    }
    handleSubmit() {
        const formValues = this.props.form.values;
        // Extract emailBodyPlaintext or emailBodyHTML as our emailBody
        const correctForm = Object.assign({}, formValues, {
            emailBody: formValues[`emailBody${formValues.type}`],
        });

        delete correctForm[`emailBody${formValues.type}`];

        this.props.postCreateCampaignSequence(JSON.stringify(correctForm), this.state.reset);
        if (correctForm.id>0){
            this.props.notify({
                message: 'Campaign Sequence Updated',
                colour: 'green'
            });
        }else{
            this.props.notify({
                message: 'Campaign Sequence is being created - it will be ready to send soon.',
                colour: 'green'
            });
        }
    }

    applyTemplate(template) {
        if (template) {
            // Set the template's emailBody prop to emailBodyPlaintext or emailBodyHTML
            //console.log(template);
            const correctTemplate = Object.assign({}, {
                ['type']: template.type,
                ['emailSubject']: template.emailSubject,
                [`emailBody${template.type}`]: template.emailBody,
                ['emailBodyDesign']: template.emailBodyDesign
            });

            delete correctTemplate.emailBody;
            //console.log(correctTemplate);
            const applyTemplateOnTopOfCurrentValues = Object.assign({}, this.props.form.values, correctTemplate);
            this.props.initialize('createCampaignSequence', applyTemplateOnTopOfCurrentValues);
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
        const { thisCampaign, page, initialFormValues } = this.state;
        const { lists, templates, form, isGetting, isPosting } = this.props;

        const type = (this.props.form && this.props.form.values.type) ? this.props.form.values.type : this.state.initialFormValues.type;
        return (
            <div>
                <div className="content-header">
                    <h1>Create Campaign Sequence
                        <small>Create a new sequence</small>
                    </h1>
                </div>

                <section className="content">
                    <div className="box box-primary">
                        <div className="box-body">
                            {page === 1 &&
                                <CreateCampaignSequenceForm
                                    passResetToState={this.passResetToState}
                                    textEditorType={type}
                                    applyTemplate={this.applyTemplate}
                                    templates={templates}
                                    lists={lists}
                                    validationFailed={this.validationFailed}
                                    nextPage={this.nextPage}
                                    initialValues={initialFormValues}
                                    CampaignDetails={thisCampaign} />}
                            {page === 2 &&
                                <PreviewCampaignSequenceForm
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateCampaignSequenceComponent);
