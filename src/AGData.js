import  React from "react"

function AGConfig(){

    const gridConfig={
        columnDefs: [
          {
            field: 'make',
            headerName: 'Make',
            sortable: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
              values: ['Ford', 'Toyota','Porsche','Other']
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
          { field: 'price',
            headerName: 'Price',
            cellEditor: 'agLargeTextCellEditor',
            editable: true,
            sortable: true,
            filter: true  
          }
        ],
        rowSelection: "multiple",
        onAddRow: function (gridApi){
          return {}
        }
      }

}