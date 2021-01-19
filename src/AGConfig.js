import React from "react"

const AGConfig = {
    columnDefs: [
        {
            field: 'make',
            headerName: 'Make',
            sortable: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['Ford', 'Toyota', 'Porsche', 'Other']
            },
            filter: true,
            checkboxSelection: true
        },
        {
            field: 'model',
            headerName: 'Model',
            editable: true,
            cellEditor: 'agPopupTextCellEditor',
            sortable: true,
            filter: true
        },
        {
            field: 'price',
            headerName: 'Price',
            cellEditor: 'agLargeTextCellEditor',
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: 'date',
            headerName: 'Build Date',
            cellEditor: 'datePicker',
            editable: true,
            sortable: true,
            filter: true
        },
        {
            field: "country",
            width: 110,
            cellEditor: 'agSelectCellEditor',
            cellRenderer: 'selectCellRenderer',
            cellEditorParams: {
                values: ['IE', 'UK', 'FR']
            },
            editable: true,
            refData: { 'IE': 'Ireland', 'UK': 'United Kingdom', 'FR': 'France' }
        },
    ],
    rowSelection: "multiple",
    pageSize: 100
}
export default AGConfig