import React, { Component, PropTypes } from 'react';
import { Editor } from '@tinymce/tinymce-react';

import { FormControl } from 'react-bootstrap';
import { Field } from 'redux-form';
import { renderField, renderHiddenField } from '../common/FormRenderWrappers';
// Change <p> tags to <div> tags as empty lines are rendered as <p><br></p> which is two spaces, <div><br></div> is one
// Adapted from https://codepen.io/alexkrolick/pen/PWrKdx?editors=0010 and https://codepen.io/quill/pen/VjgorV

export default class TextEditorRich extends Component {
    static propTypes = {
        value: PropTypes.string,
        inputName: PropTypes.string,
        onChange: PropTypes.func
    }
    onUpload(e) {
        const files = e.target.files;
        var file = files[0];
        var reader = new FileReader();
        var field_name=this.props.inputName;
        
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {            
            var ev1 = new Event('input', { bubbles: true });
            ev1.simulated = true;
            document.querySelector("input[name='" + field_name + "']").value = evt.target.result;
            document.querySelector("input[name='" + field_name + "']").dispatchEvent(ev1);

            $('#Plaintext').click();
            $('#HTML').click();
        }
        reader.onerror = function (evt) {
            console.log('error');
        }
    }
    handleEditorChange = (e) => {        
        var field_name = this.props.inputName;
        var ev1 = new Event('input', { bubbles: true });
        ev1.simulated = true;
        document.querySelector("input[name='" + field_name + "']").value = e.target.getContent();
        document.querySelector("input[name='" + field_name + "']").dispatchEvent(ev1);
    }
    render() {
        const { value, inputName, onChange } = this.props;
        const bounds='#'+this.props.inputName;
        return (
            <div>                
                <label htmlFor="fileInput" className="btn btn-success btn-lg import-html">Import HTML</label>
                <FormControl id="fileInput" accept=".html" style={{ display: "none" }} className="btn" type="file" onChange={this.onUpload.bind(this)} />                
                <div hidden={true}>
                    <Field name={inputName}  id={inputName} component={renderHiddenField} label="EmailBody" type="text"/>
                </div>
                <div>
                    <Editor                        
                        readOnly={false}
                        id={inputName}
                        bounds={bounds}
                        placeholder="Write your email ..."
                        /* apiKey='p7iq1nduof75r8nab8ofaaxpq7m368d4oagdq34zn3qxqjv5' */
                        initialValue={value}
                        init={{
                            plugins: 'link image code',
                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
                            height:"400"
                        }}
                        onChange={this.handleEditorChange}                        
                    />
                </div>
            </div>
        );
    }
}
