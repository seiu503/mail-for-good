import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';

import ManageCampaignsTable from '../../components/campaigns/ManageCampaignsTable';
import ManageCampaignsGraph from '../../components/campaigns/ManageCampaignsGraph';

import { getCampaigns, deleteCampaigns, postCreateCampaignCopy } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';

function mapStateToProps(state) {
  // State reducer @ state.manageCampaign
  return {
    campaigns: state.manageCampaign.campaigns,
    isGetting: state.manageCampaign.isGetting
  };
}

const mapDispatchToProps = { getCampaigns, deleteCampaigns, notify, postCreateCampaignCopy };

export class ManageCampaignsBoxComponent extends Component {

  static propTypes = {
    campaigns: PropTypes.array.isRequired,
    isGetting: PropTypes.bool.isRequired,
    getCampaigns: PropTypes.func.isRequired,
    deleteCampaigns: PropTypes.func.isRequired,
    postCreateCampaignCopy: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  constructor() {
    super();
    this.deleteRows = this.deleteRows.bind(this);
    this.getCampaignView = this.getCampaignView.bind(this);
    this.duplicateTemplate = this.duplicateTemplate.bind(this);
    this.addCampaignSequence = this.addCampaignSequence.bind(this);
    this.ManageCampaignSequence = this.ManageCampaignSequence.bind(this);
    this.duplicateCampaigns = this.duplicateCampaigns.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.onRowSelect = this.onRowSelect.bind(this);
    this.state = {
      selected: []
    };
  }

  componentDidMount() {
    // Update campaigns only if we need to
    this.props.getCampaigns();
  }

  deleteRows() { // campaignIds [...Numbers]    
    const CampaginsIds = this.state.selected;
    if (CampaginsIds.length > 0) {
      if (confirm('Are you sure that you want to delete the selected campaigns(s)?')) {        
        this.props.deleteCampaigns(CampaginsIds, this.props.campaigns);
        this.setState({ selected: [] });
      }
    }
  }

  getCampaignView(row) {
    // Send user to the campaign view container
    this.context.router.push(`/campaigns/manage/${row.slug}`);
  }
  addCampaignSequence(row) {
    // Send user to the campaign sequence container
    this.context.router.push(`/campaigns/createsequence/${row.slug}`);
  }
  duplicateTemplate(row) {
    // Send user to the campaign sequence container
    this.context.router.push(`/campaigns/create/${row.slug}`);
  }
  ManageCampaignSequence(row) {    
    // Send user to the campaign sequence container
    this.context.router.push(`/campaigns/managesequence/${row.slug}`);
  }

  duplicateCampaigns() {
    // Copy the selected Campaigns
    const CampaginsIds = this.state.selected;

    if (CampaginsIds.length > 0) {
      if (confirm('Are you sure that you want to copy the selected campaigns(s)?')) {
        const campaigns = this.props.campaigns.filter(temp => ~CampaginsIds.indexOf(temp.id));
        if (campaigns.length > 0) {          
          //send request to copy campaigns          
          this.props.postCreateCampaignCopy(JSON.stringify(campaigns));
          this.props.notify({
            message: 'Your campaign(s) copied successfully',
            colour: 'green'
          });
          this.setState({ selected: [] });
        }
      }
    }
  }
  onRowSelect({ id }, isSelected) {
    if (isSelected) {
      this.setState({
        selected: [...this.state.selected, id].sort(),
      });
    } else {
      this.setState({ selected: this.state.selected.filter(it => it !== id) });
    }
    return false;
  }

  onSelectAll(isSelected) {
    if (!isSelected) {
      this.setState({ selected: [] });
    } else {
      const selectedids = [];
      const campaigns = this.props.campaigns;
      Object.keys(campaigns).forEach(key => {
        selectedids.push(campaigns[key].id);
      });
      this.setState({ selected: selectedids });
    }
    return false;
  }
  render() {
    const { selected } = this.state;   
    return (
      <div className="box box-primary">
        <div className="box-header">
          <h3 className="box-title">Your campaigns</h3>
        </div>

        <div className="box-body">

          <ManageCampaignsTable
            data={this.props.campaigns}
            deleteRows={this.deleteRows}
            getCampaignView={this.getCampaignView}
            duplicateTemplate={this.duplicateTemplate}
            addCampaignSequence={this.addCampaignSequence}
            ManageCampaignSequence={this.ManageCampaignSequence}
            duplicateCampaigns={this.duplicateCampaigns}
            selected={selected}
            onSelectAll={this.onSelectAll}
            onRowSelect={this.onRowSelect}
            />
          {this.props.isGetting && <div className="overlay">
            <FontAwesome name="refresh" spin/>
          </div>}

          <ManageCampaignsGraph data={this.props.campaigns} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageCampaignsBoxComponent);
