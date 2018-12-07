import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';

import ManageDripsTable from '../../components/drips/ManageDripsTable';

import { getDrips, deleteDrips, postCreateDripCopy, changeDripStatus } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';

function mapStateToProps(state) {
    // State reducer @ state.manageDrips
    return {
        drips: state.manageDrip.drips,        
        isGetting: state.manageDrip.isGetting
    };
}

const mapDispatchToProps = { getDrips, deleteDrips, notify, postCreateDripCopy, changeDripStatus };

export class ManageDripsBoxComponent extends Component {

    static propTypes = {
        getDrips: PropTypes.func.isRequired,
        drips: PropTypes.array.isRequired,
        isGetting: PropTypes.bool.isRequired,        
        deleteDrips: PropTypes.func.isRequired,
        changeDripStatus: PropTypes.func.isRequired,
        postCreateDripCopy: PropTypes.func.isRequired,
        notify: PropTypes.func.isRequired,
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor() {
        super();
        this.deleteRows = this.deleteRows.bind(this);
        this.getDripView = this.getDripView.bind(this);
        this.editDrip = this.editDrip.bind(this);        
        this.duplicateDrip = this.duplicateDrip.bind(this);
        this.changeDripStatus = this.changeDripStatus.bind(this);
        this.onSelectAll = this.onSelectAll.bind(this);
        this.onRowSelect = this.onRowSelect.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.state = {
            selected: [],
            selectedTabKey: 0,
            filteredDrips: [],
            dripStatus: { 0: 'running', 1: 'paused', 2: 'draft', 3: 'archive', 4: 'archive' },
        };
    }
    handleTabChange(currentSelectedTab) {
        let dripStatus = this.state.dripStatus;
        let lastSelectedTab = this.state.selectedTabKey;
        if (currentSelectedTab != lastSelectedTab) {
            this.setState({ selected: [] });
            this.setState({ selectedTabKey: currentSelectedTab });
            const filteredDrips = this.props.drips.filter(drip => drip.status == dripStatus[currentSelectedTab]);
            this.setState({ filteredDrips });
        }
        
    }
    componentDidMount() {
        // Update drips only if we need to
        this.props.getDrips();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.drips && nextProps.drips.length && !this.props.drips.length) {            
            const filteredDrips = nextProps.drips.filter(drip => drip.status == 'running');
            this.setState({ filteredDrips });            
        }else{
            let dripStatus = this.state.dripStatus;
            let currentSelectedTab = this.state.selectedTabKey;
            const filteredDrips = nextProps.drips.filter(drip => drip.status == dripStatus[currentSelectedTab]);
            this.setState({ filteredDrips });
        }
        
    }

    deleteRows() { // dripds [...Numbers]    
        const dripIds = this.state.selected;
        if (dripIds.length > 0) {
            if (confirm('Are you sure that you want to delete the selected drip(s)?')) {
                this.props.deleteDrips(dripIds);
                this.setState({ selected: [] });
            }
        }
    }

    getDripView(row) {
        // Send user to the drip view container
        this.context.router.push(`/drips/manage/${row.slug}`);
    }    
    editDrip(row) {
        // Send user to the drip container
        this.context.router.push(`/drips/create/${row.slug}`);
    }    

    duplicateDrip() {
        // Copy the selected Drips
        const dripIds = this.state.selected;

        if (dripIds.length > 0) {
            //if (confirm('Are you sure that you want to copy the selected Drip(s)?')) {
            const drips = this.props.drips.filter(temp => ~dripIds.indexOf(temp.id));
            if (drips.length > 0) {
                //send request to copy Drips
                this.props.postCreateDripCopy(JSON.stringify(drips));
                this.props.notify({
                    message: 'Your drip(s) copied successfully',
                    colour: 'green'
                });
                this.setState({ selected: [] });
            }
            //}
        }
    }
    changeDripStatus(status) { // dripIds [...Numbers]        
        const dripIds = this.state.selected;
        if (dripIds.length > 0) {
            if (confirm('Are you sure that you want to ' + status +' the selected drips(s)?')) {
                let form = { 'ids': dripIds, 'status': status, submitType: 'multiple' };                
                this.props.changeDripStatus(JSON.stringify(form));
                this.setState({ selected: [] });
                this.props.notify({
                    message: 'Your drip(s) ' + status +' successfully',
                    colour: 'green'
                });                
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
            const drips = this.state.filteredDrips;
            Object.keys(drips).forEach(key => {
                selectedids.push(drips[key].id);
            });
            this.setState({ selected: selectedids });
        }
        return false;
    }

    render() {
        const { selected, selectedTabKey, filteredDrips} = this.state;
        return (
            <div className="box box-primary">
                <div className="box-header">
                    <h3 className="box-title">Your Drips</h3>
                </div>

                <div className="box-body">

                    <ManageDripsTable                        
                        data={filteredDrips}
                        deleteRows={this.deleteRows}
                        getDripView={this.getDripView}
                        editDrip={this.editDrip}                                           
                        duplicateDrip={this.duplicateDrip}
                        changeDripStatus={this.changeDripStatus}
                        selected={selected}
                        onSelectAll={this.onSelectAll}
                        onRowSelect={this.onRowSelect}
                        selectedTabKey={selectedTabKey}
                        handleTabChange={this.handleTabChange}
                    />
                    {this.props.isGetting && <div className="overlay">
                        <FontAwesome name="refresh" spin />
                    </div>}                    
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageDripsBoxComponent);
