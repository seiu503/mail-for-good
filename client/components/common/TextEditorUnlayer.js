import React, { Component, PropTypes } from 'react';
import EmailEditor from 'react-email-editor';
import { Field } from 'redux-form';
import { renderField } from '../common/FormRenderWrappers';


// Change <p> tags to <div> tags as empty lines are rendered as <p><br></p> which is two spaces, <div><br></div> is one
// Adapted from https://codepen.io/alexkrolick/pen/PWrKdx?editors=0010 and https://codepen.io/quill/pen/VjgorV

export default class TextEditorUnlayer extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
  }

  render() {
    const { value, onChange } = this.props;
    return (
      <div>
        <div>
          <label className="red-lable">After editing email design click on 'Save Email Design' to reflect changes!</label>
          <br/>
          <button type="button" id="exporthtml" onClick={this.exportHtml} className="btn btn-success btn-lg">Save Email Design</button>
        </div>
        <div hidden={true}>
          <Field name={($('#page_name').text() == '/campaigns/create') ? 'emailBodyHTMLEditor' : 'emailBody'} component={renderField} label="EmailBody" type="text" />                    
        </div>
        <EmailEditor
          ref={editor => this.editor = editor}
          onLoad={this.onLoad}
        />
      </div>
    );
  }
  onLoad = () => {
    // this.editor.addEventListener('onDesignLoad', this.onDesignLoad)    
    //console.log(document.querySelector("input[name='emailBodyDesign']").value);
    if (document.querySelector("input[name='emailBodyDesign']").value != '') {
      setTimeout(() => {
        this.editor.loadDesign(JSON.parse(document.querySelector("input[name='emailBodyDesign']").value));
      }, 2000);
    }
  }
  exportHtml = () => {
    this.editor.exportHtml(data => {
      const { design, html } = data;

      var field_name = ($('#page_name').text() == '/campaigns/create') ? 'emailBodyHTMLEditor' : 'emailBody';            
      var ev1 = new Event('input', { bubbles: true });
      ev1.simulated = true;
      document.querySelector("input[name='" + field_name + "']").value = html;
      document.querySelector("input[name='" + field_name + "']").dispatchEvent(ev1);

      var ev2 = new Event('input', { bubbles: true });
      ev2.simulated = true;
      document.querySelector("input[name='emailBodyDesign']").value = JSON.stringify(design);
      document.querySelector("input[name='emailBodyDesign']").dispatchEvent(ev2);

    })
  }
}