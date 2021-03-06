import React, { PropTypes } from 'react';
import DOMPurify from 'dompurify';
import { Modal, Button } from 'react-bootstrap';
const PreviewDripForm = props => {
    const { lastPage, handleSubmit } = props;
    const isCreateDripPreview = !!props.previewForm;
    let text;
    let form;
    let type;
    let viewDrip = false;
    if (isCreateDripPreview) {        
        form = props.previewForm; 
       // console.log(form);      
    } else {
        viewDrip = true;
        // In this case, the preview is rendered within the dripView container
        if (props.dripView === undefined) {
            form = {
                name: '',
                listName: '',
                startTime: '',
                previewSequences: [],            
            };
        }else{
            form = props.dripView;
            /* form.listName = props.dripViewListName;
            form.previewSequences = props.dripViewPreviewSequences; */
        }
    }

    return (
        <div>
            {form.listName && <h3><i className="fa fa-list text-green" aria-hidden="true" /> List - {form.listName}</h3>}
            {props.dripViewListName && <h3><i className="fa fa-list text-green" aria-hidden="true" /> List - {props.dripViewListName}</h3>}
            <h3><i className="fa fa-flag text-green" aria-hidden="true" /> Drip - {form.name}</h3>            
            <hr />
            <h3>Drip Sequences</h3> 
            {form.previewSequences && form.previewSequences.map(sequence =>
                <div className="drip-sequences-preview" key={sequence.sequenceday + sequence.templateName}>
                    <label>Send after how many day - {sequence.sequenceday}</label><br />
                    <label>Template - {sequence.templateName}</label>
                    <br />
                    <br />
                </div>
            )} 
            {props.dripViewPreviewSequences && props.dripViewPreviewSequences.map(sequence =>
                <div className="drip-sequences-preview" key={sequence.sequenceday + sequence.templateName}>
                    <label>Send after how many day - {sequence.sequenceday}</label><br />
                    <label>Template - {sequence.templateName}</label>
                    <br />
                    <br />
                </div>
            )}          
            {viewDrip == false && <div className="box-footer">
                <div className="btn-group">
                    <button style={{ margin: "1em", width: "170px" }} className="btn btn-lg btn-primary" type="button" onClick={lastPage}>Edit</button>
                    <button style={{ margin: "1em", width: "170px" }} className="btn btn-lg btn-success" type="button" onClick={handleSubmit.bind(this, 'running')}>Start Drip</button>
                    <button style={{ margin: "1em", width: "170px" }} className="btn btn-lg btn-warning" type="button" onClick={handleSubmit.bind(this, 'draft')}>Save as Draft</button>                    
                </div>
            </div>}
        </div>
    );
};

PreviewDripForm.propTypes = {
    lastPage: PropTypes.func,
    form: PropTypes.object,    
    previewForm: PropTypes.object,
    handleSubmit: PropTypes.func,
    dripView: PropTypes.object,
    dripViewListName: PropTypes.string ,
    dripViewPreviewSequences: PropTypes.array,
};

export default PreviewDripForm;
