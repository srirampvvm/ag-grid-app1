import React from "react"
import { render } from "react-dom"
import { AgGridReact } from '@ag-grid-community/react';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

//import { AllCommunityModules } from '@ag-grid-community/all-modules';

import Script from "react-load-script";

import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';


import AGConfig from "./AGConfig"

class AG3 extends React.Component {

    constructor() {
        super()

        this.state = {
            //modules: [AllCommunityModules],
            //components: { yearCellEditor: getYearCellEditor() },//part of AllCommunityModules

            modules: [ClientSideRowModelModule, InfiniteRowModelModule],
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

            //InfiniteRowModelModule required
            rowBuffer: 0,
            rowModelType: 'infinite',
            paginationPageSize: 0,
            cacheOverflowSize: 2,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: 0,
            maxBlocksInCache: 2,


            //ClientSideRowModelModule required
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
            data.forEach((element, i) => {
                element.rid = i;
                element.uc = this.state.gridConfig.uc;
                element.country = 'UK'
                element.date = '12/13/2020'
            })
            this.gridState.original = JSON.parse(JSON.stringify(data))
            var dataSource = {
                rowCount: null,
                getRows: function (params) {
                    //alert('asking for ' + params.startRow + ' to ' + params.endRow);
                    setTimeout(function () {
                        var rowsThisPage = data.slice(params.startRow, params.endRow);
                        var lastRow = -1;
                        if (data.length <= params.endRow) {
                            lastRow = data.length;
                        }
                        params.successCallback(rowsThisPage, 560);
                    }, 500);
                }
            };

            this.gridApi.setDatasource(dataSource);
        };

        console.log('fetching data')
        fetch('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/rowData.json')
            .then(result => result.json())
            .then(rowData => { updateData(rowData) })
    }
    paginationNumberFormatter = (params) => {
        return params.value.toLocaleString();
    }
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.fetchData();
    };

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
                <button onClick={this.getModified}>Modified</button>
                <AgGridReact
                    suppressRowClickSelection={true}
                    rowSelection="multiple"
                    isRowSelectable={function (rowNode) {
                        return rowNode.data ? rowNode.data.make === 'Ford' : false;
                    }}
                    components={this.state.components}
                    modules={this.state.modules}

                    paginationNumberFormatter={this.paginationNumberFormatter}
                    //onPaginationChanged={this.onPaginationChanged.bind(this)}

                    //server side patination - start
                    //pagination={true}
                    rowBuffer={this.state.rowBuffer}
                    rowModelType={this.state.rowModelType}
                    paginationPageSize={this.state.paginationPageSize}
                    cacheOverflowSize={this.state.cacheOverflowSize}
                    maxConcurrentDatasourceRequests={
                        this.state.maxConcurrentDatasourceRequests
                    }
                    infiniteInitialRowCount={this.state.infiniteInitialRowCount}
                    maxBlocksInCache={this.state.maxBlocksInCache}
                    //server side patination - end

                    //defaultColDef={gridConfig.columnDefs}
                    columnDefs={this.state.gridConfig.columnDefs}
                    //enterMovesDown={true}
                    //enterMovesDownAfterEdit={true}
                    stopEditingWhenGridLosesFocus={true}
                    onCellValueChanged={this.cellValueChanged}

                    onGridReady={this.onGridReady}
                />
                <h1>AGGrid</h1>
            </div>
        )
    }

}

export default AG3