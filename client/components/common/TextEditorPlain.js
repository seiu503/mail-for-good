import React, { Component, PropTypes } from 'react';

export default class TextEditorPlain extends Component {
  static propTypes = {
    value: PropTypes.string,
    inputName: PropTypes.string,
    onChange: PropTypes.func
  }
  
  render() {
    const { value, inputName, onChange } = this.props;
    return (
      <div>
        <label className="red-lable">NOTE: To add unsubscribe link paste the '&lt;a href="unsubscribe_url"&gt;unsubscribe&lt;/a&gt;' into your editor.</label>
        <br />
        <textarea
        name={inputName}
        className="form-control"
        style={{ width: "100%", minHeight: "60vh" }}
        value={value}
        onChange={onChange}
        />     
      </div>  
    );
  }
}
