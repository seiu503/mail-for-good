import React, {Component, PropTypes} from 'react';
import 'react-quill/dist/quill.snow.css';

import TextEditorRich from '../../components/common/TextEditorRich';
import TextEditorPlain from '../../components/common/TextEditorPlain';
import TextEditorUnlayer from '../../components/common/TextEditorUnlayer';

export default class TextEditor extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    textEditorType: PropTypes.string,
    inputName: PropTypes.string
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    // Update redux form
    this.props.input.onChange(value);
  }

  render() {
    const {
      input: {
        value
      }
    } = this.props;

    //const isPlaintext = this.props.textEditorType === 'Plaintext';
    const editorType = this.props.textEditorType;
    const inputName = this.props.inputName;

    const textEditorProps = {
      value,
      inputName,
      onChange: this.onChange
    };

    // Render either a plaintext or html editor
    /* return (
      isPlaintext
        ? <TextEditorPlain {...textEditorProps} />
        : <TextEditorRich {...textEditorProps} />
    ); */    
    return (
      (editorType == 'Plaintext') ? <TextEditorPlain {...textEditorProps} /> : (editorType == 'HTML') ? <TextEditorRich {...textEditorProps} /> : <TextEditorUnlayer {...textEditorProps} />      
    );
  }

}
