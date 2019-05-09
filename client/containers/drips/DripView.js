import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { initialize } from "redux-form";

import PreviewDripForm from "../../components/drips/PreviewDripForm";
import { getTemplates } from "../../actions/campaignActions";
import { notify } from "../../actions/notificationActions";
import { getLists } from "../../actions/listActions";
import FontAwesome from "react-fontawesome";
import moment from "moment";
import { getDrips } from "../../actions/campaignActions";

function mapStateToProps(state) {
  // State reducer @ state.form & state.createCampaign & state.manageLists
  return {
    lists: state.manageList.lists,
    isGetting: state.manageList.isGetting,
    templates: state.manageTemplates.templates,
    drips: state.manageDrip.drips
  };
}
const mapDispatchToProps = {
  initialize,
  notify,
  getLists,
  getTemplates,
  getDrips
};

export class DripViewComponent extends Component {
  static propTypes = {
    isGetting: PropTypes.bool.isRequired,
    getLists: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    getTemplates: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,

    initialize: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,

    getDrips: PropTypes.func.isRequired,
    drips: PropTypes.array.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
  }

  state = {
    thisDrip: {},
    listName: "",
    previewSequences: []
  };
  componentWillMount() {
    const slug = this.props.params.slug;
    this.props.getLists();
    this.props.getTemplates();
    this.props.getDrips();
    if (!this.props.drips.length) {
      this.props.getDrips();
    } else {
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
  }

  getSingleDrip(props) {
    const slug = this.props.params.slug;
    if (slug) {
      let getDripBySlug = props.drips.find(drips => drips.slug === slug);
      let listName = this.props.lists.find(
        lists => lists.id === getDripBySlug.listId
      );

      let sequences = JSON.parse(getDripBySlug.sequences);
      let previewSequences = [];
      Object.keys(sequences).forEach(key => {
        let templateName = this.props.templates.find(
          template => template.id === sequences[key].templateId
        );
        previewSequences[previewSequences.length] = {
          sequenceday: sequences[key].sequenceday,
          templateName: templateName.name
        };
      });
      //getDripBySlug.previewSequences = previewSequences;
      //getDripBySlug.previewSequences = JSON.parse(getDripBySlug.sequences);
      //console.log(getDripBySlug);
      this.setState({
        thisDrip: getDripBySlug,
        listName: listName.name,
        previewSequences: previewSequences
      });
    }
  }

  render() {
    const { isGetting } = this.props;
    const { thisDrip, listName, previewSequences } = this.state;
    const renderDripView = () => (
      <div>
        <div className="content-header">
          <h1>
            Your Campaign
            <small>View your campaign</small>
          </h1>
        </div>

        <section className="content">
          <div className="box box-primary">
            <div className="box-body">
              <PreviewDripForm
                dripView={thisDrip}
                dripViewListName={listName}
                dripViewPreviewSequences={previewSequences}
              />
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
    const canRender = !!thisDrip;

    return <div>{canRender && renderDripView()}</div>;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DripViewComponent);
