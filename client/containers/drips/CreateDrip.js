import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { initialize } from 'redux-form';
import CreateDripForm from '../../components/drips/CreateDripForm';
import PreviewDripForm from '../../components/drips/PreviewDripForm';
import { getTemplates } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';
import { getLists } from '../../actions/listActions';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
import { postCreateDrip, changeDripStatus, getDrips } from '../../actions/campaignActions';

function mapStateToProps(state) {
    // State reducer @ state.form & state.createCampaign & state.manageLists
    return {        
        lists: state.manageList.lists,
        isGetting: state.manageList.isGetting,
        templates: state.manageTemplates.templates,
        form: state.form.createDrip,
        isPosting: state.createDrip.isPosting,
        sendDripStatus: state.createDrip.sendDripStatus,
        dripId: state.createDrip.dripId,
        isDripSubmited: state.submitDrip.isDripSubmited,
        drips: state.manageDrip.drips,
    };
}
const mapDispatchToProps = { initialize, notify, getLists, getTemplates, postCreateDrip, changeDripStatus, getDrips };

export class CreateDripComponent extends Component {
    static propTypes = {
        isGetting: PropTypes.bool.isRequired,
        getLists: PropTypes.func.isRequired,
        lists: PropTypes.array.isRequired,
        getTemplates: PropTypes.func.isRequired,
        templates: PropTypes.array.isRequired,

        initialize: PropTypes.func.isRequired,
        notify: PropTypes.func.isRequired,                                          
        
        form: PropTypes.object,
        postCreateDrip: PropTypes.func.isRequired,
        isPosting: PropTypes.bool.isRequired,
        sendDripStatus: PropTypes.number.isRequired,
        dripId: PropTypes.number.isRequired,
        
        changeDripStatus: PropTypes.func.isRequired,
        isDripSubmited: PropTypes.bool.isRequired,
        
        getDrips: PropTypes.func.isRequired,
        drips: PropTypes.array.isRequired,
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor() {
        super();
        this.nextPage = this.nextPage.bind(this);
        this.lastPage = this.lastPage.bind(this);
        this.passResetToState = this.passResetToState.bind(this);
        this.validationFailed = this.validationFailed.bind(this); 
        this.applyTemplate = this.applyTemplate.bind(this);   
        this.addSequence = this.addSequence.bind(this);   
        this.removeSequence = this.removeSequence.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this); 

    }   
     
    state = {
        initialFormValues: {
            name: `Drip - ${moment().format('l, h:mm:ss')}`,            
        },
        submitDrip: false,
        page: 1,
        reset: null,
        selectedTemplates: [],        
        indexNo: 0,
        inputs: [],
        previewForm: [],
        isEdit: false,
        sequencedayError: [],
        listId: 0
    }
    componentDidMount() {
        const slug = this.props.params.slug;
        if (slug === undefined) {
            this.props.initialize('createDrip', this.state.initialFormValues);
        }
        this.props.getLists();
        this.props.getTemplates();
        this.props.getDrips();
        if (this.props.drips.length) {
            setTimeout(() => {
                this.getSingleDrip(this.props);                
            }, 100);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.drips && nextProps.drips.length && !this.props.drips.length) { 
            setTimeout(() => {
                this.getSingleDrip(nextProps);                
            }, 100);
        }
        //console.log('State ' + this.props.dripId + ' ----props ' + nextProps.dripId);
        if (nextProps.dripId > 0 && this.props.dripId != nextProps.dripId) {
            const correctForm = Object.assign({}, this.props.form.values, {
                ['id']: nextProps.dripId
            });
            this.props.initialize('createDrip', correctForm);
        }
        //console.log(this.props.isDripSubmited + ' nextProps--- ' + nextProps.isDripSubmited + ' submitDrip--- ' + this.state.submitDrip);
        if (this.props.isDripSubmited === true && nextProps.isDripSubmited === false && this.state.submitDrip == true) {
            this.setState({ submitDrip: false }, () =>{
                this.context.router.push(`/drips/manage`);
            });
        }
    }

    getSingleDrip(props) {
        const slug = this.props.params.slug;
        
        if (slug) {
            const getDripBySlug = props.drips.find(drips => drips.slug === slug);            
            if (getDripBySlug) {
                if (getDripBySlug.status != 'draft' && getDripBySlug.status != 'paused') {
                    this.props.notify({
                        message: 'Your cannot edit the drip',
                        colour: 'red'
                    });
                    this.context.router.push(`/drips/manage`);
                }
                this.setState({ isEdit: true });
                const correctForm = Object.assign({}, getDripBySlug, {
                    startTime: getDripBySlug.startdatetime,
                    "sequenceday[0]": 3
                });
                delete correctForm['createdAt'];
                delete correctForm['updatedAt'];
                delete correctForm['sequenceCount'];
                delete correctForm['userId'];
                delete correctForm['startdatetime'];
                
                const listId = correctForm.listId;
                this.setState({ listId });
                delete correctForm['listId'];

                const sequences = JSON.parse(correctForm.sequences);
                const sequencesCount = sequences.length;
                this.setState({ indexNo: (sequencesCount-1) });
                let template_zero = this.props.templates.find(templates => templates.id == sequences[0].templateId);
                let selectedTemplates = this.state.selectedTemplates;
                selectedTemplates[0] = template_zero.name;
                this.setState({ selectedTemplates });                
                

                for (let index = 1; index < sequences.length; index++) {
                    let template = this.props.templates.find(templates => templates.id == sequences[index].templateId);
                    let selectedTemplates = this.state.selectedTemplates;
                    selectedTemplates[index] = template.name;
                    this.setState({ selectedTemplates });

                    this.setState(prevState => ({ inputs: prevState.inputs.concat([index]) }));                    
                }
                setTimeout(() => {
                    let field_name = 'sequenceday[0]';
                    let ev1 = new Event('input', { bubbles: true });
                    ev1.simulated = true;
                    document.querySelector("input[name='" + field_name + "']").value = sequences[0].sequenceday;
                    document.querySelector("input[name='" + field_name + "']").dispatchEvent(ev1);    
                    for (let index = 1; index < sequences.length; index++) {                    
                        let field_name = 'sequenceday[' + index + ']';
                        let ev1 = new Event('input', { bubbles: true });
                        ev1.simulated = true;
                        document.querySelector("input[name='" + field_name + "']").value = sequences[index].sequenceday;
                        document.querySelector("input[name='" + field_name + "']").dispatchEvent(ev1);
                    }                
                }, 1000);
                delete correctForm['sequences'];
                this.props.initialize('createDrip', correctForm);
                

                setTimeout(() => {
                    const formValues = this.props.form.values;                    
                    const listIdName = this.props.lists.find(lists => lists.id === listId);
                    
                    if (listIdName) {
                        const correctForm = Object.assign({}, formValues, {
                            ['listName']: listIdName.name,
                            "sequenceday[0]": 3
                        });
                        this.props.initialize('createDrip', correctForm);
                    }
                }, 1000);     
            }    
        }
    }
    handleSubmit(status) {
        const formValues = this.props.form.values;
        this.setState({ submitDrip: true });
        let form = { 'id': formValues.id, 'status': status, submitType: 'single' };
        //console.log(form);
        this.props.changeDripStatus(JSON.stringify(form));
    }
    nextPage() {
        let errorMsg ='Form is invalid, please fill out all the required fields';
        const formValues = this.props.form.values;
        let selectedTemplates = this.state.selectedTemplates;
        let sequencesday = formValues.sequenceday;
        //console.log(sequencesday);       
        let seqCount = this.state.inputs.length;
        let showError = false;
        if (typeof sequencesday === 'undefined'){
            showError = true;
        }
        if (!selectedTemplates.length){
            showError =true;
        }else{
            let templateCount = 0;
            for (let i = 0; i <= selectedTemplates.length - 1; i++) {
                if (typeof selectedTemplates[i] !== 'undefined') {
                    templateCount++;
                    //console.log(sequencesday[i]);
                    if (typeof sequencesday[i] === 'undefined'){
                        showError = true;
                    }else{
                        if (sequencesday[i] < 0){
                            //console.log('number less then 0');
                            errorMsg ="send day should be postive number";
                            showError = true;
                        }
                    }
                    //console.log(selectedTemplates[i]);
                    if (!selectedTemplates[i]) {
                        showError = true;
                    }
                }
            } 
            if (seqCount != (templateCount - 1) ){
                showError = true;
            }            
        }
        console.log(showError);
        if (showError){
            this.validationFailed(errorMsg);  
        }
        /* let seqCount = this.state.inputs.length;
        console.log(seqCount);
        console.log(formValues);
        let sequencedayError = this.state.sequencedayError;
        if (formValues.sequenceday){
            formValues.sequenceday
        }else{                    
            for (let i = 0; i <= seqCount; i++) {
                sequencedayError[i] = 1;                
            }  
            this.setState({ sequencedayError },()=>{
                console.log(sequencedayError);
            });
        }
        return; */
        //const listIdName = this.props.lists.find(lists => lists.name === formValues.listName);

        let sequences = [];
        let previewSequences = [];
        Object.keys(selectedTemplates).forEach(key => {
            let templateIdName = this.props.templates.find(template => template.name === selectedTemplates[key]);
            sequences[sequences.length] = { sequenceday : sequencesday[key], templateId: templateIdName.id };
            previewSequences[previewSequences.length] = { sequenceday: sequencesday[key], templateName: selectedTemplates[key]};
        });
        let form = { id: formValues.id, listId: this.state.listId , name: formValues.name, listName: formValues.listName, startTime: formValues.startTime, sequences: sequences };
        let previewForm = { id: formValues.id, name: formValues.name, listName: formValues.listName, startTime: formValues.startTime, previewSequences: previewSequences };
        //console.log(form);
        this.props.postCreateDrip(JSON.stringify(form));
        this.setState({ previewForm: previewForm }, () => {            
            this.setState({ page: this.state.page + 1 });
        });
    }

    lastPage() {
        this.setState({ page: this.state.page - 1 });
    }
    removeSequence (index) {
        let newInput = this.state.inputs.filter(item =>item!=index);        
        let newTemplate = this.state.selectedTemplates.filter((item, itemIndex) =>{            
            if (itemIndex != index) {
                return item;
            }
        });
        let selectedTemplates= this.state.selectedTemplates;
        delete selectedTemplates[index];        
        this.setState({ inputs: newInput });
        this.setState({ selectedTemplates: selectedTemplates });
    }
    addSequence () {   
        var newInput = this.state.indexNo;
        newInput++;        
        this.setState(prevState => ({ inputs: prevState.inputs.concat([newInput]) }));
        this.setState({ indexNo: newInput });
       // console.log(this.state.inputs);
    }
    
    
    validationFailed(reason) {
        this.props.notify({
            message: reason
        });
    }

    passResetToState(reset) {
        this.setState({ reset });        
    }

    applyTemplate(template,index) {        
        let selectedTemplates = this.state.selectedTemplates;
        selectedTemplates[index] = template;
        this.setState({ selectedTemplates });
    }

    render() {
        const { lists, templates, isGetting, form } = this.props; 
        const { page, selectedTemplates, indexNo, inputs, previewForm, sequencedayError} = this.state;
        return (
            <div>
                <div className="content-header">
                    <h1>Create Drip
                        <small>Create a drip campaign</small>
                    </h1>
                </div>

                <section className="content">
                    <div className="box box-primary">
                        <div className="box-body">
                            {page === 1 &&
                            <CreateDripForm    
                                nextPage={this.nextPage}                           
                                passResetToState={this.passResetToState}
                                validationFailed={this.validationFailed}
                                applyTemplate={this.applyTemplate}
                                templates={templates}
                                lists={lists}
                                selectedTemplates={selectedTemplates}                                
                                indexNo={indexNo}
                                addSequence={this.addSequence}
                                removeSequence={this.removeSequence}
                                inputs={inputs}
                                sequencedayError={sequencedayError}
                            />}
                            {page === 2 &&
                            <PreviewDripForm 
                                form={form}
                                previewForm={previewForm}
                                lastPage={this.lastPage}
                                handleSubmit={this.handleSubmit}
                            />}
                        </div>
                        {isGetting && <div className="overlay">
                            <FontAwesome name="refresh" spin />
                        </div>}
                    </div>
                </section>

            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateDripComponent);
