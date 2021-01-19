import React from "react"
import { render } from "react-dom"
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import Script from "react-load-script";

import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';


import AGConfig from "./AGConfig"

class AG2 extends React.Component {

    constructor() {
        super()

        this.state = {

            modules: [ClientSideRowModelModule],
            components: {
                datePicker: window.getDatePicker(),
                selectCellRenderer: function (params) {
                    return params.colDef.refData[params.value];
                },
                loadingRenderer: function (params) {
                    if (params.value !== undefined) {
                        return params.value;
                    } else {
                        return '<img src="https://www.ag-grid.com/example-assets/loading.gif">';
                    }
                },
            },

            //ClientSideRowModelModule required
            paginationPageSize: 0,
            rowData: [],

            gridConfig: this.getGridConfig()
        }

    }

    gridState = {
        original: [],
        added: [],
        deleted: [],
        modified: [],
        reset: function () {
            this.original = [];
            this.added = [];
            this.deleted = [];
            this.modified = [];
        }
    }

    getGridConfig = () => {
        console.log('fetching GridConfig')
        const httpRequest = new XMLHttpRequest();
        httpRequest.open(
            'GET',
            '/gc.js?sid=test',
            false
        );
        httpRequest.send();
        const gridConfig = JSON.parse(JSON.stringify(AGConfig))
        //let gridConfig = (JSON.parse(httpRequest.responseText));
        gridConfig.columnDefs.push({ field: 'rid', hide: false });
        gridConfig.columnDefs.push({ field: 'uc', hide: false });
        gridConfig.columnDefs.push({ headerName: "Row", valueGetter: "node.rowIndex + 1" });

        gridConfig.colIndx = new Array();
        gridConfig.uc = '';
        gridConfig.columnDefs.forEach((colDef, i) => {
            gridConfig.colIndx[colDef.field] = i
            gridConfig.uc = gridConfig.uc + '0';
        })
        return gridConfig;
    }

    fetchData = () => {
        const updateData = (data) => {
            this.gridState.reset()
            this.gridState.original = JSON.parse(JSON.stringify(data))
            data.forEach((element, i) => {
                element.rid = i;
                element.uc = this.state.gridConfig.uc;
                element.country = 'France'
            })
            this.setState({ ...this.state, rowData: data })
        };

        console.log('fetching data')
        fetch('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/rowData.json')
            .then(result => result.json())
            .then(rowData => { updateData(rowData) })
    }
    
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.fetchData();
    };

    insertRow = () => {
        var rowDataItem = this.getRowWithDefaults()
        if (window.onAddRow) {
            rowDataItem = window.onAddRow(rowDataItem)
        }
        rowDataItem.uc = '+';
        rowDataItem.rid = this.gridState.original.length;
        const res = this.gridApi.applyTransaction({ add: [rowDataItem] });
        const changes = this.gridState
        res.add.forEach(function (rowNode) {
            changes.added.push(rowNode.data)
        })
    }

    getInserted = e => {
        const rows = new Array()
        this.gridState.added.forEach((row, i) => {
            if (row.uc != '-') {
                rows.push(row)
            }
        })
        alert(`inserted: ${JSON.stringify(rows)}`)
        return rows
    }

    deleteRow = e => {
        const changes = this.gridState
        const selectedNodes = this.gridApi.getSelectedNodes()
        const selectedData = selectedNodes.map(node => {
            if (node.data.uc != '+') {
                changes.deleted.push(node.data)
            }
            node.data.uc = '-';
            return node.data
        })
        this.gridApi.applyTransaction({ remove: selectedData });
    }

    getDeleted = e => {
        const rows = new Array()
        this.gridState.deleted.forEach((row, i) => {
            rows.push(row)
        })
        alert(`deleted: ${JSON.stringify(rows)}`)
        return rows
    }

    cellValueChanged = (params) => {
        if (params.colDef.field == 'model' && params.newValue == '1') {
            alert('value cannot be 1')
            params.node.setDataValue('model', params.oldValue);
        } else {
            const rid = params.data.rid
            const oldRow = this.gridState.original[rid];
            if (oldRow) {
                let uc = params.data.uc
                if (uc != '+' && uc != '-') {
                    let index = this.state.gridConfig.colIndx[params.colDef.field]
                    if (oldRow[params.colDef.field] != params.newValue) {
                        params.data.uc = uc.substr(0, index) + '1' + uc.substr(index + 1);
                    } else {
                        params.data.uc = uc.substr(0, index) + '0' + uc.substr(index + 1);
                    }
                }
            }
            console.log(`oldValue: ${params.oldValue}, newValue: ${params.newValue}, column: ${params.colDef.field}`)
        }
        if (params.data.uc.indexOf('1') != -1) {
            this.gridState.modified.push(params.data);
        }
    }

    getModified = () => {
        const rows = new Array()
        this.gridState.modified.forEach((row, i) => {
            if (row.uc.indexOf('1') != -1) {
                rows.push(row)
            }
        })
        alert(`modified: ${JSON.stringify(rows)}`)
        return rows
    }
    getRowWithDefaults() {
        return {}
    }


    handleScriptError() {
        console.log("Error while loading script");
    }

    handleScriptLoad() {
        console.log("Script loaded successfully");
    }

    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.gridApi.paginationSetPageSize(Number(value));
    };

    onPaginationChanged = (params) => {
        console.log('onPaginationPageLoaded');
        if (this.gridApi) {
            // setText('#lbLastPageFound', this.gridApi.paginationIsLastPageFound());
            // setText('#lbPageSize', this.gridApi.paginationGetPageSize());
            // setText('#lbCurrentPage', this.gridApi.paginationGetCurrentPage() + 1);
            // setText('#lbTotalPages', this.gridApi.paginationGetTotalPages());
            //setLastButtonDisabled(!this.gridApi.paginationIsLastPageFound());
        }
    };


    render() {
        return (
            <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
                <Script
                    url="/sid.js"
                    onError={this.handleScriptError.bind(this)}
                    onLoad={this.handleScriptLoad.bind(this)}
                />
                <button onClick={this.fetchData}>Reload</button>
                <button onClick={this.insertRow}>Add</button>
                <button onClick={this.getInserted}>Inserted</button>
                <button onClick={this.deleteRow}>Delete</button>
                <button onClick={this.getDeleted}>Deleted</button>
                <button onClick={this.getModified}>Modified</button>
                <AgGridReact
                    suppressRowClickSelection={true}
                    rowSelection="multiple"
                    isRowSelectable={function (rowNode) {
                        return rowNode.data ? rowNode.data.make === 'Ford' : false;
                    }}
                    components={this.state.components}
                    modules={this.state.modules}

                    
                    //defaultColDef={gridConfig.columnDefs}
                    columnDefs={this.state.gridConfig.columnDefs}
                    //enterMovesDown={true}
                    //enterMovesDownAfterEdit={true}
                    stopEditingWhenGridLosesFocus={true}
                    onCellValueChanged={this.cellValueChanged}

                    //client side single load - start
                    pagination={true}
                    paginationPageSize={this.state.paginationPageSize}
                    rowData={this.state.rowData}
                    //client side single load - start

                    onGridReady={this.onGridReady}
                />
                <h1>AGGrid</h1>
            </div>
        )
    }

}

export default AG2