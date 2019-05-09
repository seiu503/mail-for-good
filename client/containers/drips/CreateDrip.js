import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { initialize } from "redux-form";
import CreateDripForm from "../../components/drips/CreateDripForm";
import PreviewDripForm from "../../components/drips/PreviewDripForm";
import { getTemplates } from "../../actions/campaignActions";
import { notify } from "../../actions/notificationActions";
import { getLists } from "../../actions/listActions";
import FontAwesome from "react-fontawesome";
import moment from "moment";
import {
  postCreateDrip,
  changeDripStatus,
  getDrips,
  getDripSequences
} from "../../actions/campaignActions";

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
    dripsequences: state.manageDrip.dripsequences
  };
}

const mapDispatchToProps = {
  initialize,
  notify,
  getLists,
  getTemplates,
  postCreateDrip,
  changeDripStatus,
  getDrips,
  getDripSequences
};

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
    drips: PropTypes.array.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

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
    this.handleKeypress = this.handleKeypress.bind(this);
  }

  state = {
    initialFormValues: {
      name: `Drip - ${moment().format("l, h:mm:ss")}`,
      startTime: new Date(),
      sequenceId: [0]
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
    listId: 0,
    lastAddedSequenceId: 0,
    deletedSequences: []
  };
  componentDidMount() {
    this.props.getDripSequences(0);
    const slug = this.props.params.slug;
    if (slug === undefined) {
      this.props.initialize("createDrip", this.state.initialFormValues);
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
        ["id"]: nextProps.dripId
      });
      this.props.initialize("createDrip", correctForm);
    }

    if (
      this.props.isDripSubmited === true &&
      nextProps.isDripSubmited === false &&
      this.state.submitDrip == true
    ) {
      this.setState({ submitDrip: false }, () => {
        this.context.router.push(`/drips/manage`);
      });
    }
  }

  getSingleDrip(props) {
    const slug = this.props.params.slug;

    if (slug) {
      const getDripBySlug = props.drips.find(drips => drips.slug === slug);
      if (getDripBySlug) {
        this.props.getDripSequences(getDripBySlug.id);
        if (
          getDripBySlug.status != "draft" &&
          getDripBySlug.status != "paused"
        ) {
          this.props.notify({
            message: "Your cannot edit the drip",
            colour: "red"
          });
          this.context.router.push(`/drips/manage`);
        }
        this.setState({ isEdit: true });
        const correctForm = Object.assign({}, getDripBySlug, {
          startTime: getDripBySlug.startdatetime,
          "sequenceday[0]": 3
        });
        delete correctForm["createdAt"];
        delete correctForm["updatedAt"];
        delete correctForm["sequenceCount"];
        delete correctForm["userId"];
        delete correctForm["startdatetime"];

        const listId = correctForm.listId;
        this.setState({ listId });
        delete correctForm["listId"];

        const sequences = JSON.parse(correctForm.sequences);
        const sequencesCount = sequences.length;
        this.setState({ indexNo: sequencesCount - 1 });
        let template_zero = this.props.templates.find(
          templates => templates.id == sequences[0].templateId
        );
        let selectedTemplates = this.state.selectedTemplates;
        selectedTemplates[0] = template_zero.name;
        this.setState({ selectedTemplates });

        setTimeout(() => {
          let sequencess = this.props.dripsequences;

          for (let index = 1; index < sequencess.length; index++) {
            let template = this.props.templates.find(
              templates => templates.id == sequencess[index].templateId
            );
            let selectedTemplates = this.state.selectedTemplates;
            selectedTemplates[index] = template.name;
            this.setState({ selectedTemplates });

            this.setState(prevState => ({
              inputs: prevState.inputs.concat([index])
            }));
          }

          let lastId = 0;
          let field_name = "sequenceday[0]";
          let ev1 = new Event("input", { bubbles: true });
          ev1.simulated = true;
          lastId = sequencess[0].id;
          document.querySelector("input[name='" + field_name + "']").value =
            sequencess[0].send_after_days;
          document
            .querySelector("input[name='" + field_name + "']")
            .dispatchEvent(ev1);
          for (let index = 1; index < sequencess.length; index++) {
            lastId = sequencess[index].id;
            let field_name = "sequenceday[" + index + "]";
            let ev1 = new Event("input", { bubbles: true });
            ev1.simulated = true;
            document.querySelector("input[name='" + field_name + "']").value =
              sequencess[index].send_after_days;
            document
              .querySelector("input[name='" + field_name + "']")
              .dispatchEvent(ev1);
          }
          this.setState({ lastAddedSequenceId: lastId });
          let fieldName = "sequenceId[0]";
          let ev2 = new Event("input", { bubbles: true });
          ev2.simulated = true;
          document.querySelector("input[name='" + fieldName + "']").value =
            sequencess[0].id;
          document
            .querySelector("input[name='" + fieldName + "']")
            .dispatchEvent(ev2);
          for (let index = 1; index < sequencess.length; index++) {
            let field_name = "sequenceId[" + index + "]";
            let ev1 = new Event("input", { bubbles: true });
            ev1.simulated = true;
            document.querySelector("input[name='" + field_name + "']").value =
              sequencess[index].id;
            document
              .querySelector("input[name='" + field_name + "']")
              .dispatchEvent(ev1);
          }
        }, 1000);
        delete correctForm["sequences"];
        this.props.initialize("createDrip", correctForm);

        setTimeout(() => {
          const formValues = this.props.form.values;
          const listIdName = this.props.lists.find(
            lists => lists.id === listId
          );

          if (listIdName) {
            const correctForm = Object.assign({}, formValues, {
              ["listName"]: listIdName.name
              /* "sequenceday[0]": 3 */
            });
            this.props.initialize("createDrip", correctForm);
          }
        }, 1000);
      }
    }
  }
  handleSubmit(status) {
    const formValues = this.props.form.values;
    this.setState({ submitDrip: true });
    let form = { id: formValues.id, status: status, submitType: "single" };
    //console.log(form);
    this.props.changeDripStatus(JSON.stringify(form));
  }
  nextPage() {
    let errorMsg = "Form is invalid, please fill out all the required fields";
    const formValues = this.props.form.values;
    let selectedTemplates = this.state.selectedTemplates;
    let sequencesday = formValues.sequenceday;
    let sequencesdIds = formValues.sequenceId;
    let seqCount = this.state.inputs.length;
    let showError = false;
    if (typeof sequencesday === "undefined") {
      showError = true;
    }
    if (!selectedTemplates.length) {
      showError = true;
    } else {
      let templateCount = 0;
      for (let i = 0; i <= selectedTemplates.length - 1; i++) {
        if (typeof selectedTemplates[i] !== "undefined") {
          templateCount++;
          if (
            typeof sequencesday === "undefined" ||
            typeof sequencesday[i] === "undefined"
          ) {
            showError = true;
          } else {
            if (sequencesday[i] < 0) {
              errorMsg = "send day should be postive number";
              showError = true;
            }
          }
          if (!selectedTemplates[i]) {
            showError = true;
          }
        }
      }
      if (seqCount != templateCount - 1) {
        showError = true;
      }
    }
    //console.log(showError);
    if (showError) {
      this.validationFailed(errorMsg);
      return;
    }
    let sequences = [];
    let previewSequences = [];
    let lastSequenceId = 0;
    // console.log(sequencesdIds);
    Object.keys(selectedTemplates).forEach(key => {
      if (
        typeof sequencesdIds !== "undefined" &&
        typeof sequencesdIds[key] !== "undefined"
      ) {
        lastSequenceId = sequencesdIds[key];
      } else {
        let newId = lastSequenceId;
        lastSequenceId = parseInt(newId) + 1;
      }
      let sequenceId = key;
      let templateIdName = this.props.templates.find(
        template => template.name === selectedTemplates[key]
      );
      sequences[sequences.length] = {
        sequenceId: lastSequenceId,
        sequenceday: sequencesday[key],
        templateId: templateIdName.id
      };
      previewSequences[previewSequences.length] = {
        sequenceday: sequencesday[key],
        templateName: selectedTemplates[key]
      };
    });
    let form = {
      id: formValues.id,
      listId: this.state.listId,
      name: formValues.name,
      listName: formValues.listName,
      startTime: formValues.startTime,
      sequences: sequences,
      deleted_sequence_ids: this.state.deletedSequences
    };
    let previewForm = {
      id: formValues.id,
      name: formValues.name,
      listName: formValues.listName,
      startTime: formValues.startTime,
      previewSequences: previewSequences
    };

    /* console.log(form);
        return; */
    this.props.postCreateDrip(JSON.stringify(form));
    this.setState({ previewForm: previewForm }, () => {
      this.setState({ page: this.state.page + 1 });
    });
  }

  lastPage() {
    this.setState({ page: this.state.page - 1 });
  }
  removeSequence(index) {
    const allsequences = this.props.dripsequences;
    var alldeletedsequences = this.state.deletedSequences;
    if (allsequences[index]) {
      alldeletedsequences.push(allsequences[index].id);
    }
    this.setState({ deletedSequences: alldeletedsequences });

    let newInput = this.state.inputs.filter(item => item != index);
    let newTemplate = this.state.selectedTemplates.filter((item, itemIndex) => {
      if (itemIndex != index) {
        return item;
      }
    });
    let selectedTemplates = this.state.selectedTemplates;
    delete selectedTemplates[index];
    this.setState({ inputs: newInput });
    this.setState({ selectedTemplates: selectedTemplates });
  }
  addSequence() {
    var newInput = this.state.indexNo;
    newInput++;
    this.setState(prevState => ({
      inputs: prevState.inputs.concat([newInput])
    }));
    this.setState({ indexNo: newInput });
    setTimeout(() => {
      let newSeqeunceId = this.state.lastAddedSequenceId;
      let field_name = "sequenceId[" + newInput + "]";
      let ev1 = new Event("input", { bubbles: true });
      ev1.simulated = true;
      document.querySelector("input[name='" + field_name + "']").value =
        parseInt(newSeqeunceId) + 1;
      document
        .querySelector("input[name='" + field_name + "']")
        .dispatchEvent(ev1);
      this.setState({ lastAddedSequenceId: parseInt(newSeqeunceId) + 1 });
    }, 200);
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

  applyTemplate(template, index) {
    let selectedTemplates = this.state.selectedTemplates;
    selectedTemplates[index] = template;
    this.setState({ selectedTemplates });
  }
  handleKeypress(e) {
    if (/^\+?(0|[1-9]\d*)$/.test(e.target.value)) {
      return;
    } else {
      e.preventDefault();
    }
    /* const characterCode = e.key
        console.log(characterCode);
        if (characterCode === 'Backspace') return

        const characterNumber = Number(characterCode)
        if (characterNumber >= 0 && characterNumber <= 9) {
            if (e.currentTarget.value && e.currentTarget.value.length) {
                return
            } else if (characterNumber === 0) {
                e.preventDefault()
            }
        } else {
            e.preventDefault()
        } */
  }
  render() {
    const { lists, templates, isGetting, form, dripsequences } = this.props;
    const {
      page,
      selectedTemplates,
      indexNo,
      inputs,
      previewForm,
      sequencedayError
    } = this.state;
    return (
      <div>
        <div className="content-header">
          <h1>
            Create Drip
            <small>Create a drip campaign</small>
          </h1>
        </div>

        <section className="content">
          <div className="box box-primary">
            <div className="box-body">
              {page === 1 && (
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
                  handleKeypress={this.handleKeypress}
                  dripSequences={dripsequences}
                  deletedSequences={this.state.deletedSequences}
                />
              )}
              {page === 2 && (
                <PreviewDripForm
                  form={form}
                  previewForm={previewForm}
                  lastPage={this.lastPage}
                  handleSubmit={this.handleSubmit}
                />
              )}
            </div>
            {isGetting && (
              <div className="overlay">
                <FontAwesome name="refresh" spin />
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  CreateDripComponent
);
