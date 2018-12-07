import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { initialize } from 'redux-form';
import FontAwesome from 'react-fontawesome';
import CreateTemplateForm from '../../components/templates/CreateTemplateForm';
import PreviewTemplateForm from '../../components/templates/PreviewTemplateForm';
import { postCreateTemplate, postPublishTemplate, getTemplates } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';
import moment from 'moment';

function mapStateToProps(state) {
  // State reducer @ state.form.createTemplate & state.createTemplate
  return {
    form: state.form.createTemplate,
    isPosting: state.createTemplate.isPosting,
    templateId: state.createTemplate.templateId,
    templatePublish: state.createTemplate.templatePublish,
    templates: state.manageTemplates.templates,
    isGetting: state.manageTemplates.isGetting
  };
}

const mapDispatchToProps = { postCreateTemplate, postPublishTemplate, notify, getTemplates, initialize };

export class CreateTemplateComponent extends Component {

  static propTypes = {
    form: PropTypes.object,
    isPosting: PropTypes.bool.isRequired,
    templateId: PropTypes.number.isRequired,
    templatePublish: PropTypes.bool.isRequired,
    postCreateTemplate: PropTypes.func.isRequired,
    postPublishTemplate: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    isGetting: PropTypes.bool.isRequired,
    notify: PropTypes.func.isRequired,
    getTemplates: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.lastPage = this.lastPage.bind(this);
    this.validationFailed = this.validationFailed.bind(this);
    this.passResetToState = this.passResetToState.bind(this);
  }

  state = {
    page: 1,
    initialFormValues: {
      templateName: `Template - ${moment().format('l, h:mm:ss')}`,
      type: 'Plaintext',
      unsubscribeLinkEnabled: true
    },
    editor: '',
    reset: null,
    isEdit:false
  }

  componentWillMount() {
    this.props.getTemplates();
    this.getSingleTemplate(this.props);
  }

  componentWillReceiveProps(props) {    
    
    if (this.props.templatePublish === true && props.templatePublish === false) { // Fires when template has been successfully publish
      this.setState({ page: 1 });
      this.props.notify({
        message: (this.state.isEdit == false) ? 'Your template published successfully' : 'Your template updated successfully',
        colour: 'green'
      });
      this.context.router.push(`/templates/manage`);
    }
    if (this.props.isPosting === true && props.isPosting === false) { // Fires when template has been successfully created
      if (props.templateId > 0) {
        this.setState({ templateId: props.templateId});
        const correctForm = Object.assign({}, this.props.form.values, {
          ['id']: props.templateId
        });        
        this.props.initialize('createTemplate', correctForm);
      }      
    }    
    if (props.templates && props.templates.length && !this.props.templates.length) { // Guarded and statement that confirms campaigns is in the new props, confirms the array isn't empty, and then confirms that current props do not exist
      this.getSingleTemplate(props);
    }
  }
  getSingleTemplate(props) {
    // This method retrieves a single campaign from this.props.campaigns based on the parameter in the url
    const slug = this.props.params.slug;    
    if (slug){
      const getTemplateBySlug = props.templates.find(template => template.slug === slug);      
      if (getTemplateBySlug){
        const correctForm = Object.assign({}, getTemplateBySlug, {
          ['templateName']: getTemplateBySlug.name
        });
        //delete correctForm['id'];
        delete correctForm['createdAt'];
        delete correctForm['updatedAt'];
        delete correctForm['userId'];
        delete correctForm['name'];
        delete correctForm['slug'];
        delete correctForm['status'];
        
        this.props.initialize('createTemplate', correctForm);
        this.setState({ isEdit: true});
      }
    }else{
      const correctForm = Object.assign({}, this.state.initialFormValues);
      this.props.initialize('createTemplate', correctForm);
    }
  }
  handleSubmit() {    
    if (confirm('Are you sure that you want to publishing this template. It will update this template for any campaigns or drips currently using this template?')){
      let form = { id: this.state.templateId, status: 'publish', emailBody: this.props.form.values.emailBody};
      this.props.postPublishTemplate(JSON.stringify(form), this.state.reset);
    }
  }

  nextPage() {    
    const correctForm = Object.assign({}, this.props.form.values, {
      ['status']: 'draft'
    });
    this.props.initialize('createTemplate', correctForm);        
    this.props.postCreateTemplate(JSON.stringify(correctForm), this.state.reset);
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
    const { page, isEdit } = this.state;
    const type = (this.props.form && this.props.form.values.type) || this.state.initialFormValues.type;

    return (
      <div>
        <div className="content-header">
          <h1>Templates
            <small>{(isEdit == false) ? 'Create and manage your templates' :'Update and manage your templates'}</small>
          </h1>
        </div>

        <section className="content">
          <div className="box box-primary">
            <div className="box-body">
              {page === 1 && <CreateTemplateForm passResetToState={this.passResetToState} textEditorType={type} validationFailed={this.validationFailed} nextPage={this.nextPage} initialValues={this.state.initialFormValues} />}
              {page === 2 && <PreviewTemplateForm form={this.props.form} lastPage={this.lastPage} handleSubmit={this.handleSubmit} submitting={this.props.isPosting} />}
            </div>
            {this.props.isPosting || this.props.isGetting && <div className="overlay">
              <FontAwesome name="refresh" spin/>
            </div>}
          </div>
        </section>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTemplateComponent);
