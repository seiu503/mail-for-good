import React, { PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import moment from 'moment';

// Ref: https://allenfang.github.io/react-bootstrap-table/docs.html
const ManageDripsTable = ({ data, deleteRows, getDripView, editDrip, duplicateDrip, changeDripStatus, onSelectAll, onRowSelect, selected, selectedTabKey, handleTabChange }) => {
    const selectRowProp = {
        mode: "checkbox",
        bgColor: "rgb(176, 224, 230)",
        clickToSelect: true,
        onSelect: onRowSelect.bind(this),
        onSelectAll: onSelectAll.bind(this),
        selected: selected
    };
    const createCustomButtonGroup = props => {
        return (
            <ButtonGroup className='my-custom-class' sizeClass='btn-group-md'>
                <button type='button' className={`btn btn-warning react-bs-table-del-btn`} onClick={deleteRows.bind(this)}>
                    <i className="glyphicon glyphicon-trash"></i>&nbsp;Delete
        </button>
                <button type='button' className={`btn btn-primary react-bs-table-pri-btn action-btn`} onClick={duplicateDrip.bind(this)}>
                    <i className="glyphicon glyphicon-duplicate"></i>&nbsp;Copy
        </button>
                {(selectedTabKey == 1 ) &&
                    <button type='button' className={`btn btn-success react-bs-table-pri-btn action-btn`} onClick={changeDripStatus.bind(this, 'running')}>
                        <i className="glyphicon glyphicon-play"></i>&nbsp;Start
        </button>}
                {(selectedTabKey == 0) &&
                    <button type='button' className={`btn btn-default react-bs-table-pri-btn action-btn`} onClick={changeDripStatus.bind(this,'paused')}>
                    <i className="glyphicon glyphicon-pause"></i>&nbsp;Pause
        </button>}
                {(selectedTabKey != 0 && selectedTabKey != 2) &&
                    <button type='button' className={`btn btn-warning react-bs-table-pri-btn action-btn`} onClick={changeDripStatus.bind(this, 'draft')}>
                        <i className="glyphicon glyphicon-duplicate"></i>&nbsp;Draft
        </button>}
                
                {(selectedTabKey != 0 && selectedTabKey != 3) &&
                    <button type='button' className={`btn btn-danger react-bs-table-pri-btn action-btn`} onClick={changeDripStatus.bind(this, 'archive')}>
                    <i className="glyphicon glyphicon-remove"></i>&nbsp;Archive
        </button>}
            </ButtonGroup>
        );
    }
    const options = {
        btnGroup: createCustomButtonGroup,
        clearSearch: true,
        noDataText: 'You do not have any drips',
        /* noDataText: 'You do not have any drips linked with your account', */
        afterDeleteRow: rows => { // Optimistic update, can assume request will succeed. 'Rows' has format [...rowKey] where rowKey is a list primary key
            deleteRows(rows);
        },
        handleConfirmDeleteRow: next => { next(); } // By default, react-bootstrap-table confirms choice using an alert. We want to override that behaviour.
    };

    const dateFormatter = cell => {
        if (cell != '') {
            return moment(cell).format('lll');
        } else {
            return '-';
        }
    };

    const countBounced = data => {
        return data["campaignanalytic.permanentBounceCount"] + data["campaignanalytic.transientBounceCount"] + data["campaignanalytic.undeterminedBounceCount"];
    };

    const bouncedFormatter = (cell, row) => {
        return countBounced(row);
    };

    const deliveredFormatter = (cell, row) => {
        const total = row['campaignanalytic.totalSentCount'];
        const failed = countBounced(row) + row['campaignanalytic.complaintCount'];

        return total - failed;
    };

    const actionButtonsFormatter = (cell, row) => {
        return (
            <div>
                <a href="#" onClick={getDripView.bind(this, row)} title="View Drip"><i className="glyphicon glyphicon-eye-open"></i></a>                
                {row.status != 'running' && row.status !='archive' &&
                    <span>
                        &nbsp;&nbsp;
                        <a href="#" onClick={editDrip.bind(this, row)} title="Edit Drip"><i className="glyphicon glyphicon-edit"></i></a> <span></span>
                    </span>
                }
            </div>
        );
    };

    const clickthroughsFormatter = (cell, row) => {
        return row['trackLinksEnabled'] ? cell : 'n/a';
    };

    const opensFormatter = (cell, row) => {
        return row['trackingPixelEnabled'] ? cell : 'n/a';
    };

    const statusFormatter = status => {
        if (status == 'running') {
            return `<span class="label label-success">Running</span>`;
        } else if (status == 'paused') {
            return `<span class="label label-default">Paused</span>`;
        } else if (status == 'draft') {
            return `<span class="label label-warning">Draft</span>`;
        } else if (status == 'archive') {
            return `<span class="label label-danger">Archive</span>`;
        }
    };

    const filterDate = {
        type: "DateFilter",
        //defaultValue: //Default value on filter. If type is NumberFilter or DateFilter, this value will like { number||date: xxx, comparator: '>' }
    };

    // ID will be used as the rowKey, but the column itself is hidden as it has no value. Slugs are also hidden.
    return (
        <div>
            <Tabs
                onSelect={(index, lastIndex, event) => handleTabChange(index)}
            /* defaultFocus={true} */
            >
                <TabList>
                    <Tab>Running</Tab>
                    <Tab>Paused</Tab>                    
                    <Tab>Draft</Tab>
                    <Tab>Archived</Tab>
                </TabList>

                <TabPanel>
                    {selectedTabKey == 0 &&
                        <BootstrapTable data={data}
                            pagination={true}
                            hover={true}
                            /* deleteRow={true} */
                            selectRow={selectRowProp}
                            options={options}
                            search={true}
                            searchPlaceholder="Filter campaigns"
                            clearSearch={true}
                            exportCSV={false}>

                            <TableHeaderColumn dataField="id" hidden={true} isKey={true}>Id</TableHeaderColumn>
                            <TableHeaderColumn dataField="slug" hidden={true}>Slug</TableHeaderColumn>
                            <TableHeaderColumn dataField="name" dataAlign="center" dataSort={true} width="350">Name</TableHeaderColumn>
                            <TableHeaderColumn dataAlign="center" width="120" dataFormat={actionButtonsFormatter.bind(this)}>Actions</TableHeaderColumn>
                            <TableHeaderColumn dataField="status" dataAlign="center" dataSort={true} dataFormat={statusFormatter} width="100">Status</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.totalSentCount" dataAlign="center" dataSort={true} csvHeader="sent">Sent</TableHeaderColumn>
                            <TableHeaderColumn dataField="delivered" dataAlign="center" dataSort={true} dataFormat={deliveredFormatter} csvFormat={deliveredFormatter}>Delivered</TableHeaderColumn>
                            <TableHeaderColumn dataField="bounced" dataAlign="center" dataSort={true} dataFormat={bouncedFormatter} csvFormat={bouncedFormatter}>Bounced</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.complaintCount" dataAlign="center" dataSort={true} csvHeader="complaints">Complaints</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.clickthroughCount" dataAlign="center" dataSort={true} dataFormat={clickthroughsFormatter} csvHeader="clickthroughs">Clickthroughs</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.openCount" dataAlign="center" dataSort={true} dataFormat={opensFormatter} csvHeader="opens">Opens</TableHeaderColumn>
                            {/*<TableHeaderColumn export ={false} dataAlign="center" width="100">Tags (WIP)</TableHeaderColumn>*/}
                            <TableHeaderColumn dataField="startdatetime" dataAlign="center" dataFormat={dateFormatter} width="150" >Start At</TableHeaderColumn>
                            <TableHeaderColumn dataField="createdAt" dataAlign="center" dataSort={true} dataFormat={dateFormatter} width="150" filter={filterDate}>Created</TableHeaderColumn>

                        </BootstrapTable>
                    }
                </TabPanel>
                <TabPanel>
                    {selectedTabKey == 1 &&
                        <BootstrapTable data={data}
                            pagination={true}
                            hover={true}
                            /* deleteRow={true} */
                            selectRow={selectRowProp}
                            options={options}
                            search={true}
                            searchPlaceholder="Filter campaigns"
                            clearSearch={true}
                            exportCSV={false}>

                            <TableHeaderColumn dataField="id" hidden={true} isKey={true}>Id</TableHeaderColumn>
                            <TableHeaderColumn dataField="slug" hidden={true}>Slug</TableHeaderColumn>
                            <TableHeaderColumn dataField="name" dataAlign="center" dataSort={true} width="350">Name</TableHeaderColumn>
                            <TableHeaderColumn dataAlign="center" width="120" dataFormat={actionButtonsFormatter.bind(this)}>Actions</TableHeaderColumn>
                            <TableHeaderColumn dataField="status" dataAlign="center" dataSort={true} dataFormat={statusFormatter} width="100">Status</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.totalSentCount" dataAlign="center" dataSort={true} csvHeader="sent">Sent</TableHeaderColumn>
                            <TableHeaderColumn dataField="delivered" dataAlign="center" dataSort={true} dataFormat={deliveredFormatter} csvFormat={deliveredFormatter}>Delivered</TableHeaderColumn>
                            <TableHeaderColumn dataField="bounced" dataAlign="center" dataSort={true} dataFormat={bouncedFormatter} csvFormat={bouncedFormatter}>Bounced</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.complaintCount" dataAlign="center" dataSort={true} csvHeader="complaints">Complaints</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.clickthroughCount" dataAlign="center" dataSort={true} dataFormat={clickthroughsFormatter} csvHeader="clickthroughs">Clickthroughs</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.openCount" dataAlign="center" dataSort={true} dataFormat={opensFormatter} csvHeader="opens">Opens</TableHeaderColumn>
                            {/*<TableHeaderColumn export ={false} dataAlign="center" width="100">Tags (WIP)</TableHeaderColumn>*/}
                            <TableHeaderColumn dataField="startdatetime" dataAlign="center" dataFormat={dateFormatter} width="150" >Start At</TableHeaderColumn>
                            <TableHeaderColumn dataField="createdAt" dataAlign="center" dataSort={true} dataFormat={dateFormatter} width="150" filter={filterDate}>Created</TableHeaderColumn>

                        </BootstrapTable>
                    }
                </TabPanel>
                <TabPanel>
                    {selectedTabKey == 2 &&
                        <BootstrapTable data={data}
                            pagination={true}
                            hover={true}
                            /* deleteRow={true} */
                            selectRow={selectRowProp}
                            options={options}
                            search={true}
                            searchPlaceholder="Filter campaigns"
                            clearSearch={true}
                            exportCSV={false}>

                            <TableHeaderColumn dataField="id" hidden={true} isKey={true}>Id</TableHeaderColumn>
                            <TableHeaderColumn dataField="slug" hidden={true}>Slug</TableHeaderColumn>
                            <TableHeaderColumn dataField="name" dataAlign="center" dataSort={true} width="350">Name</TableHeaderColumn>
                            <TableHeaderColumn dataAlign="center" width="120" dataFormat={actionButtonsFormatter.bind(this)}>Actions</TableHeaderColumn>
                            <TableHeaderColumn dataField="status" dataAlign="center" dataSort={true} dataFormat={statusFormatter} width="100">Status</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.totalSentCount" dataAlign="center" dataSort={true} csvHeader="sent">Sent</TableHeaderColumn>
                            <TableHeaderColumn dataField="delivered" dataAlign="center" dataSort={true} dataFormat={deliveredFormatter} csvFormat={deliveredFormatter}>Delivered</TableHeaderColumn>
                            <TableHeaderColumn dataField="bounced" dataAlign="center" dataSort={true} dataFormat={bouncedFormatter} csvFormat={bouncedFormatter}>Bounced</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.complaintCount" dataAlign="center" dataSort={true} csvHeader="complaints">Complaints</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.clickthroughCount" dataAlign="center" dataSort={true} dataFormat={clickthroughsFormatter} csvHeader="clickthroughs">Clickthroughs</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.openCount" dataAlign="center" dataSort={true} dataFormat={opensFormatter} csvHeader="opens">Opens</TableHeaderColumn>
                            {/*<TableHeaderColumn export ={false} dataAlign="center" width="100">Tags (WIP)</TableHeaderColumn>*/}
                            <TableHeaderColumn dataField="startdatetime" dataAlign="center" dataFormat={dateFormatter} width="150" >Start At</TableHeaderColumn>
                            <TableHeaderColumn dataField="createdAt" dataAlign="center" dataSort={true} dataFormat={dateFormatter} width="150" filter={filterDate}>Created</TableHeaderColumn>

                        </BootstrapTable>
                    }
                </TabPanel>
                <TabPanel>
                    {selectedTabKey == 3 &&
                        <BootstrapTable data={data}
                            pagination={true}
                            hover={true}
                            /* deleteRow={true} */
                            selectRow={selectRowProp}
                            options={options}
                            search={true}
                            searchPlaceholder="Filter campaigns"
                            clearSearch={true}
                            exportCSV={false}>

                            <TableHeaderColumn dataField="id" hidden={true} isKey={true}>Id</TableHeaderColumn>
                            <TableHeaderColumn dataField="slug" hidden={true}>Slug</TableHeaderColumn>
                            <TableHeaderColumn dataField="name" dataAlign="center" dataSort={true} width="350">Name</TableHeaderColumn>
                            <TableHeaderColumn dataAlign="center" width="120" dataFormat={actionButtonsFormatter.bind(this)}>Actions</TableHeaderColumn>
                            <TableHeaderColumn dataField="status" dataAlign="center" dataSort={true} dataFormat={statusFormatter} width="100">Status</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.totalSentCount" dataAlign="center" dataSort={true} csvHeader="sent">Sent</TableHeaderColumn>
                            <TableHeaderColumn dataField="delivered" dataAlign="center" dataSort={true} dataFormat={deliveredFormatter} csvFormat={deliveredFormatter}>Delivered</TableHeaderColumn>
                            <TableHeaderColumn dataField="bounced" dataAlign="center" dataSort={true} dataFormat={bouncedFormatter} csvFormat={bouncedFormatter}>Bounced</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.complaintCount" dataAlign="center" dataSort={true} csvHeader="complaints">Complaints</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.clickthroughCount" dataAlign="center" dataSort={true} dataFormat={clickthroughsFormatter} csvHeader="clickthroughs">Clickthroughs</TableHeaderColumn>
                            <TableHeaderColumn dataField="campaignanalytic.openCount" dataAlign="center" dataSort={true} dataFormat={opensFormatter} csvHeader="opens">Opens</TableHeaderColumn>
                            {/*<TableHeaderColumn export ={false} dataAlign="center" width="100">Tags (WIP)</TableHeaderColumn>*/}
                            <TableHeaderColumn dataField="startdatetime" dataAlign="center" dataFormat={dateFormatter} width="150" >Start At</TableHeaderColumn>
                            <TableHeaderColumn dataField="createdAt" dataAlign="center" dataSort={true} dataFormat={dateFormatter} width="150" filter={filterDate}>Created</TableHeaderColumn>

                        </BootstrapTable>
                    }
                </TabPanel>
            </Tabs>


        </div>
    );
};

ManageDripsTable.propTypes = {
    data: PropTypes.array.isRequired,
    deleteRows: PropTypes.func.isRequired,
    getDripView: PropTypes.func.isRequired,    
    editDrip: PropTypes.func.isRequired,    
    duplicateDrip: PropTypes.func.isRequired,
    changeDripStatus: PropTypes.func.isRequired,
    selected: PropTypes.array.isRequired,
    onSelectAll: PropTypes.func.isRequired,
    onRowSelect: PropTypes.func.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    selectedTabKey: PropTypes.number.isRequired,
};

export default ManageDripsTable;
