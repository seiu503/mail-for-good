import React, { PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';

// Ref: https://allenfang.github.io/react-bootstrap-table/docs.html
const ManageTemplatesTable = ({ data, deleteRows, getTemplateView, duplicateTemplate, duplicateTemplates, onSelectAll, onRowSelect, selected }) => {

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
        {props.deleteBtn}&nbsp;&nbsp;
        <button type='button' className={`btn btn-warning react-bs-table-del-btn `} onClick={deleteRows.bind(this)}>
          <i className="glyphicon glyphicon-trash"></i>&nbsp;Delete
        </button>
        <button type='button' className={`btn btn-primary react-bs-table-pri-btn`} onClick={duplicateTemplates.bind(this)}>
          <i className="glyphicon glyphicon-duplicate"></i>&nbsp;Copy
        </button>
      </ButtonGroup>
    );
  }


  const options = {             
    btnGroup: createCustomButtonGroup,
    clearSearch: true,
    noDataText: 'You do not have any templates linked with your account',
    onRowClick: row => { // This fires on clicking a row. TODO: Needs to go to another route with the format /:[campaign-name-slug] where users can manage (edit, send, schedule, delete) the campaign
      // NOTE: Row is an object where keys are data fields
      //getTemplateView(row);
    },
    afterDeleteRow: rows => { // Optimistic update, can assume request will succeed. 'Rows' has format [...rowKey] where rowKey is a list primary key
      deleteRows(rows);
    },

    handleConfirmDeleteRow: next => { 
    if (confirm('Are you sure that you want to delete the selected template(s)?')) 
      next();
    } 
  };

  const dateFormatter = cell => {
    return moment(cell).format('lll');
  };

  const actionButtonsFormatter = (cell, row) => {
    return (
      <div>
        <a href="#" onClick={getTemplateView.bind(this, row)} title="View Template"><i className="glyphicon glyphicon-eye-open"></i></a>&nbsp;&nbsp;
        {/* <a href="#" onClick={duplicateTemplate.bind(this, row)} title="Duplicate Template"><i className="glyphicon glyphicon-duplicate"></i></a> */}
      </div>
    );
  };
  // ID will be used as the rowKey, but the column itself is hidden as it has no value. Slugs are also hidden.
  return (
    <BootstrapTable data={data}
      pagination={true}
      hover={true}
      /* deleteRow={true} */
      selectRow={selectRowProp}
      options={options}
      search={true}
      searchPlaceholder="Filter templates"
      clearSearch={true}>

      <TableHeaderColumn dataField="id" hidden={true} isKey={true}>Id</TableHeaderColumn>
      <TableHeaderColumn dataField="name" width="250" dataAlign="center" dataSort={true}>Name</TableHeaderColumn>
      <TableHeaderColumn dataAlign="center" width="20" dataFormat={actionButtonsFormatter.bind(this)}>Actions</TableHeaderColumn>
      <TableHeaderColumn dataField="createdAt" dataAlign="center" dataSort={true} dataFormat={dateFormatter} width="60">Created</TableHeaderColumn>
      <TableHeaderColumn dataField="updatedAt" dataAlign="center" dataSort={true} dataFormat={dateFormatter} width="60">Updated</TableHeaderColumn>

    </BootstrapTable>
  );
};

ManageTemplatesTable.propTypes = {
  data: PropTypes.array.isRequired,
  deleteRows: PropTypes.func.isRequired,
  getTemplateView: PropTypes.func.isRequired,
  duplicateTemplate: PropTypes.func.isRequired,
  duplicateTemplates: PropTypes.func.isRequired,
  selected: PropTypes.array.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onRowSelect: PropTypes.func.isRequired,
};

export default ManageTemplatesTable;
