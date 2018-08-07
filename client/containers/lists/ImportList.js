import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { Combobox } from 'react-widgets';
import { Table } from 'react-bootstrap';

import ImportCSV from './ImportCSV';

import { submitCSV, getSalesForceReports, getReportDetails } from '../../actions/listActions';
import { notify } from '../../actions/notificationActions';
import { getBooleanForAssignedSettings } from '../../actions/settingsActions';

function mapStateToProps(state) {
    // State reducer @ state.manageList
    return {
        user: state.profile.user,
        lists: state.manageList.lists,
        isGetting: state.manageList.isGetting,
        fieldsExist: state.settings.fieldsExist,
        isReportGetting: state.manageSFReport.isReportGetting,
        reports: state.manageSFReport.reports,
        isReportDetailsGetting: state.manageSFReport.isReportDetailsGetting,
        reportDetails: state.manageSFReport.reportDetails,
    };
}

const mapDispatchToProps = { submitCSV, notify, getSalesForceReports, getReportDetails, getBooleanForAssignedSettings };

export class ImportListComponent extends Component {

    static propTypes = {
        user: PropTypes.object,
        submitCSV: PropTypes.func.isRequired,
        notify: PropTypes.func.isRequired,
        lists: PropTypes.array.isRequired,
        isGetting: PropTypes.bool.isRequired,
        getBooleanForAssignedSettings: PropTypes.func.isRequired,
        getSalesForceReports: PropTypes.func.isRequired,
        isReportGetting: PropTypes.bool.isRequired,
        reports: PropTypes.array.isRequired,
        getReportDetails: PropTypes.func.isRequired,
        isReportDetailsGetting: PropTypes.bool.isRequired,
        reportDetails: PropTypes.array.isRequired,
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor() {
        super();
        this.handleCSVSubmit = this.handleCSVSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.notification = this.notification.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);        
        this.seletReport = this.seletReport.bind(this);        
        this.getReportDetails = this.getReportDetails.bind(this);        
    }

    state = {
        title: '',        
        result: '',
        SFToken: false,
        reportsList:[],
        seletedReport:''
    }
    componentDidMount() {
        this.props.getBooleanForAssignedSettings();
        this.props.getSalesForceReports();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fieldsExist){
            if(nextProps.fieldsExist.salesforceAccessToken){                
                this.setState({ SFToken: true});
            }
        }
        if (nextProps.reports){
            if (nextProps.reports.length) {
                const reportsnameList = nextProps.reports.map(x => x.Name);
                this.setState({ reportsList: reportsnameList });
            }
        }        
    }



    notification(notification) {
        this.props.notify(notification);
    }

    handleFormSubmit(e) {
        e.preventDefault();
    }

    handleCSVSubmit(file, headers) {
        const { title } = this.state;
        // List title should not be empty
        if (title === '') {
            this.props.notify({ message: 'Please provide a name for this list' });
        }
        else if (this.props.lists.some(x => x.name === title)) {
            // Notify if list name exists
            this.props.notify({ message: 'This list already exists, please provide a unique name' });
        }
        else {
            this.props.submitCSV(file, headers, title);
            this.props.notify({
                message: 'Uploaded initiated - check notifications for progress',
                colour: 'green'
            });
            this.context.router.push(`/lists/manage`);
        }
    }

    handleChange(e) {
        this.setState({
            [e.target.id]: e.target.value
        });
    }        
    seletReport (reportName) {        
        this.setState({ seletedReport: reportName});
    }
    getReportDetails () {        
        const foundReport = this.props.reports.find(x => x.Name === this.state.seletedReport);        
        const form = { query: 'analytics/reports/' + foundReport.Id +'?includeDetails=true'};
        this.props.getReportDetails(JSON.stringify(form));
    }
    render() {
        const { user, reports, reportDetails } = this.props;
        const { SFToken, reportsList, seletedReport } = this.state; 
        console.log(reportDetails);       
        return (
            <div>
                <div className="content-header">
                    <h1>Import List </h1>
                </div>

                <section className="content">

                    <Row>
                        <Col xs={12} md={12}>

                            <div className="box box-primary">
                                <Row>
                                    <Col md={12}>
                                        {SFToken ? 
                                        <div>                                       
                                            <h3>Select Report</h3>
                                            <Combobox data={reportsList} suggest={true} onSelect={this.seletReport} filter="contains" />
                                            <br />
                                            <button disabled={(seletedReport=='')?true:false} className="btn pull-left btn-lg btn-primary" onClick={this.getReportDetails}>Import Report</button>
                                        </div>
                                        :
                                            <a href="/salesforcelogin" className="btn pull-left btn-lg btn-primary">SalesForces Login</a>
                                        }
                                        <br /> 
                                        <br /> 
                                        <br />                                        
                                        {reportDetails.length ?
                                            <Table bordered striped>
                                                <thead>
                                                    <tr>
                                                        {reportDetails[0] && reportDetails[0].map((field, rowIndex) => {
                                                            //console.log(row);
                                                            return (
                                                                <th>
                                                                    {field}
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {reportDetails[1] &&reportDetails[1].map((row, rowIndex) => {
                                                        //console.log(row);
                                                        return (
                                                            <tr key={rowIndex}>
                                                                {reportDetails[0].map((field) => {
                                                                    return (
                                                                        <td>{row[field]}</td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>                                            
                                            : null
                                        }
                                        <br/>
                                        {/* <div className="box-header">
                                            <h3 className="box-title">List name</h3>
                                        </div>
                                        <div className="box-body">

                                            <div className="nav-tabs-custom">
                                                <ul className="nav nav-tabs pull-right">                                                    
                                                    <li className="pull-left header">
                                                        <i className="fa fa-th" />
                                                        Import a list
                                                    </li>
                                                </ul>


                                                <form role="form" onSubmit={this.handleFormSubmit}>
                                                    <div className="form-group">
                                                        <input className="form-control" id="title" placeholder="The name of this list" type="text" value={this.state.title} onChange={this.handleChange} />
                                                    </div>
                                                </form>
                                                <ImportCSV handleCSVSubmit={this.handleCSVSubmit} notification={this.notification} />
                                            </div>

                                        </div> */}
                                    </Col>
                                </Row>

                                {(this.props.isGetting || this.props.isReportGetting || this.props.isReportDetailsGetting) && <div className="overlay">
                                    <FontAwesome name="refresh" spin />
                                </div>}
                            </div>

                        </Col>
                    </Row>
                </section>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportListComponent);
