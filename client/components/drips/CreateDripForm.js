import React, { PropTypes } from "react";
import { Field, reduxForm, propTypes as reduxFormPropTypes } from "redux-form";
import { Combobox } from "react-widgets";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import _ from "lodash";

import {
  renderCombobox,
  renderField,
  renderDatePicker
} from "../common/FormRenderWrappers";

// Ref redux-form http://redux-form.com/6.0.5/docs/GettingStarted.md/
// Ref react-widgets https://jquense.github.io/react-widgets/ (for examples see https://github.com/erikras/redux-form/blob/master/examples/react-widgets/src/ReactWidgetsForm.js)
// Ref react-rte https://github.com/sstur/react-rte

const CreateDripForm = props => {
  const {
    touch,
    valid,
    invalid,
    pristine,
    submitting,
    reset,
    validationFailed,
    textEditorType,
    passResetToState,
    scheduleCampaign,
    showScheduleDate,
    applyTemplate,
    selectedTemplates,
    indexNo,
    addSequence,
    removeSequence,
    inputs,
    nextPage,
    sequencedayError,
    handleKeypress,
    changeInputes
  } = props;
  const lists = props.lists.map(x => x.name);
  const publishTemplates = props.templates.filter(x => x.status == "publish");
  const templates = publishTemplates.map(x => x.name);
  const nameArray = [
    "id",
    "name",
    "listName",
    "startTime",
    "sequenceId[]",
    "sequenceday[]",
    "template[]"
  ]; // A list of all fields that need to show errors/warnings

  const resetFormAndSubmit = e => {
    e.preventDefault();
    if (valid) {
      passResetToState(reset);
      nextPage();
    } else {
      touch(...nameArray);
      validationFailed("Form is invalid, please review fields with errors");
    }
  };

  const applyForm = (applyTemplateValue, index) => {
    applyTemplate(applyTemplateValue, index);
    /* const foundTemplate = props.templates.find(x => x.name === applyTemplateValue);
        applyTemplate(foundTemplate); */
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Function to Set Order After Drag and Drop Task
  const DragDrop = (result) => {
      const data = inputs;
      // dropped outside the list
      if (!result.destination) {
          return;
      }
      const res = reorder(
          data,
          result.source.index,
          result.destination.index
      );
      changeInputes(res);
  }

  const resetForm = () => {
    reset();
  };
  return (
    <div>
      <form onSubmit={resetFormAndSubmit}>
        <h3>Drip Details</h3>
        <div style={{ display: "none" }}>
          <Field name="id" component={renderField} label="id" type="text" />
        </div>
        <Field
          name="name"
          component={renderField}
          label="Drip Name*"
          type="text"
        />
        <Field
          name="startTime"
          dateFormat="YYYY-MM-DD"
          component={renderDatePicker}
          label="Drip Start Date*"
          type="text"
        />
        <Field
          name="listName"
          label="Select a List*"
          component={renderCombobox}
          data={lists}
        />
        <hr />
        <h3>Drip Steps</h3>
        <br />
        <div className="sequence-section seq_0">
          {/* <a href="javascript:;" onClick={addSequence.bind(this)} title="Add Sequence"><i className="glyphicon glyphicon-plus"></i></a> */}
          <div hidden={true}>
            <Field
              name={"sequenceId[0]"}
              type="number"
              component={renderField}
              label="sequenceId"
            />
          </div>
          <Field
            name={"sequenceday[0]"}
            type="number"
            component={renderField}
            onChange={handleKeypress.bind(this)}
            label="Wait how many days after previous step?*"
          />
          {sequencedayError[0] == 1 && (
            <span className="text-red">
              <i className="fa fa-exclamation" />Required<br />
            </span>
          )}
          <label>Select template*</label>
          <Combobox
            id={"template[0]"}
            name={"template[0]"}
            value={selectedTemplates[0]}
            data={templates}
            suggest={true}
            onChange={value => applyForm(value, 0)}
            filter="contains"
          />
          <br />
        </div>
         <DragDropContext onDragEnd={DragDrop.bind(this)}>
              <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div id="sequences_section" data-scrollable="true" ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                    {inputs.map((indexNo,ind) => (
                      <Draggable key={indexNo} draggableId={indexNo} index={ind}>
                        {(provided, snapshot) => (
                          <div className={"sequence-section seq_" + indexNo} ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}>
                            <hr />
                            <a
                              href="javascript:;"
                              onClick={removeSequence.bind(this, indexNo)}
                              title="Remove Step"
                            >
                              <i className="glyphicon glyphicon-remove" />
                            </a>
                            <div style={{ display: "none" }}>
                              <Field
                                name={"sequenceId[" + indexNo + "]"}
                                type="number"
                                component={renderField}
                                label="sequenceId"
                              />
                            </div>
                            <Field
                              name={"sequenceday[" + indexNo + "]"}
                              type="number"
                              onChange={handleKeypress.bind(this)}
                              component={renderField}
                              label="Wait how many days after previous step?*"
                            />
                            {sequencedayError[indexNo] == 1 && (
                              <span className="text-red">
                                <i className="fa fa-exclamation" />Required<br />
                              </span>
                            )}
                            <label>Select template*</label>
                            <Combobox
                              id={"template[" + indexNo + "]"}
                              name={"template[" + indexNo + "]"}
                              value={selectedTemplates[indexNo]}
                              data={templates}
                              suggest={true}
                              onChange={value => applyForm(value, indexNo)}
                              filter="contains"
                            />
                            <br />
                          </div>
                         )}
                        </Draggable>
                    ))}
                     {provided.placeholder}
                  </div>
                  )}
               </Droppable>
          </DragDropContext>
        <hr />
        <button
          style={{ width: "183px" }}
          className="btn btn-success btn-lg btn-hug"
          type="button"
          onClick={addSequence.bind(this)}
        >
          Add New Step
        </button>
        <div className="box-footer">
          <div className="btn-group">
            <button
              style={{ width: "150px" }}
              className="btn btn-success btn-lg btn-hug"
              type="submit"
            >
              Preview Drip
            </button>
            <button
              className="btn btn-danger btn-lg btn-hug"
              type="button"
              disabled={pristine || submitting}
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

CreateDripForm.propTypes = {
  ...reduxFormPropTypes,
  nextPage: PropTypes.func.isRequired,
  lists: PropTypes.array.isRequired,
  templates: PropTypes.array.isRequired,
  passResetToState: PropTypes.func.isRequired,
  validationFailed: PropTypes.func.isRequired,
  applyTemplate: PropTypes.func.isRequired,
  selectedTemplates: PropTypes.array.isRequired,
  indexNo: PropTypes.number.isRequired,
  addSequence: PropTypes.func.isRequired,
  removeSequence: PropTypes.func.isRequired,
  inputs: PropTypes.array,
  sequencedayError: PropTypes.array,
  handleKeypress: PropTypes.func.isRequired
};

const validate = (values, props) => {
  const errors = {};

  if (!values.name) {
    errors.name = "Required";
  }
  if (!values.listName) {
    errors.listName = "Required";
  }
  if (!values.startTime) {
    errors.startTime = "Required";
  }

  return errors;
};

export default reduxForm({
  form: "createDrip",
  destroyOnUnmount: false,
  validate
})(CreateDripForm);
