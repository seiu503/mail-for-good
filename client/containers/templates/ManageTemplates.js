import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import ManageTemplatesTable from '../../components/templates/ManageTemplatesTable';
import { getTemplates, deleteTemplates, postCreateTemplateCopy } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';

function mapStateToProps(state) {
  // State reducer @ state.form.createTemplate & state.createTemplate
  return {
    form: state.form.createTemplate,
    isPosting: state.createTemplate.isPosting,
    templates: state.manageTemplates.templates,
    isGetting: state.manageTemplates.isGetting
  };
}

const mapDispatchToProps = { getTemplates, deleteTemplates, notify, postCreateTemplateCopy };

export class ManageTemplatesComponent extends Component {

  static propTypes = {
    form: PropTypes.object,
    getTemplates: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    isGetting: PropTypes.bool.isRequired,
    deleteTemplates: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
    postCreateTemplateCopy: PropTypes.func.isRequired,
  }
  
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  constructor() {
    super();
    this.deleteRows = this.deleteRows.bind(this);
    this.getTemplateView = this.getTemplateView.bind(this);
    this.duplicateTemplate = this.duplicateTemplate.bind(this);
    this.duplicateTemplates = this.duplicateTemplates.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.onRowSelect = this.onRowSelect.bind(this);
    this.state = {
      selected: []          
    };
  }

  componentDidMount() {
    this.props.getTemplates();
  }
  
  deleteRows() { // templateIds [...Numbers]
    const TemplatesIds = this.state.selected;
    if (TemplatesIds.length>0){
      if (confirm('Are you sure that you want to delete the selected template(s)?')){            
        this.props.deleteTemplates(TemplatesIds, this.props.templates);
        this.setState({ selected: [] });
      }
    }
  }

  getTemplateView(row) {
    // Send user to the campaign view container
    this.context.router.push(`/templates/manage/${row.slug}`);
  }
  duplicateTemplate(row) {
    // Send user to the create template container
    this.context.router.push(`/templates/create/${row.slug}`);
  }
  duplicateTemplates() {
    // Copy the select templates
    const TemplatesIds = this.state.selected;
    
    if (TemplatesIds.length > 0) {
      //if (confirm('Are you sure that you want to copy the selected template(s)?')) {        
        const templates = this.props.templates.filter(temp => ~TemplatesIds.indexOf(temp.id));
        if(templates.length>0){
          //send request to copy templates
          this.props.postCreateTemplateCopy(JSON.stringify(templates));
          this.props.notify({
            message: 'Your template(s) copied successfully and saved as drafts',
            colour: 'green'
          });
          this.setState({ selected: [] });
        }
      //}
    }    
  }
  onRowSelect({ id }, isSelected) {      
    if (isSelected) {
      this.setState({
        selected: [...this.state.selected, id].sort(),        
      });      
    } else {
      this.setState({ selected: this.state.selected.filter(it => it !== id) });
    }    
    return false;
  }

  onSelectAll(isSelected) {    
    if (!isSelected) {
      this.setState({ selected: [] });
    }else{
      const selectedids=[];
      const templates = this.props.templates;
      Object.keys(templates).forEach(key => {        
        selectedids.push(templates[key].id);        
      }); 
      this.setState({ selected: selectedids });      
    }
    return false;
  }
  render() {
    const { selected } = this.state;
    return (
      <div>
        <div className="content-header">
          <h1>Templates
            <small>Create and manage your templates</small>
          </h1>
        </div>

        <section className="content">
          <div className="box box-primary">
            <div className="box-body">
              <ManageTemplatesTable
                data={this.props.templates}
                deleteRows={this.deleteRows}
                getTemplateView={this.getTemplateView}
                duplicateTemplate={this.duplicateTemplate}
                duplicateTemplates={this.duplicateTemplates}
                selected={selected}
                onSelectAll={this.onSelectAll}
                onRowSelect={this.onRowSelect}
              />
            </div>
            {this.props.isGetting && <div className="overlay">
              <FontAwesome name="refresh" spin/>
            </div>}
          </div>
        </section>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageTemplatesComponent);