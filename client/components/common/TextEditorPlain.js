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
