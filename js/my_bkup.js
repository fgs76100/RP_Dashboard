$(document).ready(function () {
  // var currentFields = {};
  $(`body`).sortable({cancel: ':input,button,[contenteditable]'});
  document.body.setAttribute('spellcheck', false);
  var tableData = {};
  cardgroups = new cardGroups();
  httpRequest('get', 'https://raw.githubusercontent.com/fgs76100/RP_Dashboard/master/database.json');
  cardgroups.addCard();
  
  
});

function httpRequest(method, url) {
  var request = new XMLHttpRequest();
  request.open(method, url);
  // load data function
  request.onload = function() {
    // check request status
    if (request.status >= 200 && request.status <400) {
      tableData = JSON.parse(request.responseText);
      // renderHTML(data);
    } else {
      console.log('Error!! request failed');
    };
  };
  request.onerror == function () {
    console.log('Connection Error');
  };
  // send request
  request.send();
};


function panel(id) {
  $(id).click(function() {
    // console.log('click');
    let rel = $(this).attr('rel');
    $(rel).slideToggle();
  });
};

function sortable(id) {
  let $selector = $(id);
  $selector.sortable();
  // $selector.disableSelection();
}

function deleteCard(id) {
  $(id).click( function () {
    let rel = $(this).attr('rel');
    $(rel).remove();
  });
};

// constructor
function cardGroups() {
  this.cnt = 0;
  this.addCard = add_more_analyer;
  this.lastCard = $('body');
  this.self = this.lastCard.clone();
  //this.addPanel = panel;
  this.table = new analyzerTable();
};

function add_more_analyer() {
  let template = `

    <div class="card">
      <div class="card-header">
        <button class="btn btn-link collapsed" type="button" rel="#collapsed${this.cnt}" id="card${this.cnt}">RegisterAnalyzer</button>
        <button type="button" class="close" aria-label="Close" id="deleter${this.cnt}" rel="#analyzer${this.cnt}" >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="card-body" id="collapsed${this.cnt}">
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">0x</span>
          </div>
          <input type="text" class="form-control" placeholder="Base Address(Hex)" aria-describedby="basic-addon1" id="addr_input${this.cnt}" rel='#analyzerTable${this.cnt}'></input>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="btnHide${this.cnt}" rel="#analyzerTable${this.cnt}">Show Description</button>
        <button type="button" class="btn btn-secondary btn-sm" id="addColumn${this.cnt}" rel="#analyzerTable${this.cnt}">Add Colunm</button>
        <button type="button" class="btn btn-secondary btn-sm" id="RmColumn${this.cnt}" rel="#analyzerTable${this.cnt}">Remove Colunm</button>

        <div class='table-responsive-sm' style="width: 90%; margin: 0 auto; padding: 10px 0 0 0">
          <table class='table table-sm' id='analyzerTable${this.cnt}' rel="#card${this.cnt}">
            <thead>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  `;
  let id = this.cnt;
  let div = document.createElement('div');
  div.setAttribute('class', 'container');
  div.setAttribute('id', `analyzer${id}`);
  div.innerHTML = template;
  this.lastCard.append(div);
  let new_analyer = $(`#analyzer${id}`);
  this.self = new_analyer.clone();
  panel(`#card${id}`);
  deleteCard(`#deleter${id}`);
  // sortable(`#analyzer${this.cnt}`);
  let address = ''
  let fields = {};
  let table = this.table
  table.searchAddress(id);
  // console.log(currentFields);

  this.cnt ++;
};

function searchAddress(id) {
  // console.log(this.createTable());
  let parentNode = this;
  let newColumns_cnt = this.new_columns;
  // console.log(this);
  // this.createTable();
  $(`#addr_input${id}`).keydown( function (e){
    if (e.which == 13) {
      let input_address = $(this).val();
      let tableID = $(this).attr('rel');
      // console.log(input_address, tableID);
      input_address = input_address.replace(/0x/gi, '').trim().toUpperCase();
      // console.log(this)
      // this.createTable(tableID, input_address, tableData;
      let match_address = ''
      match_address = parentNode.createTable(tableID, input_address, tableData);
      
      $(this).val(match_address);
    };
  });
  $(`#addColumn${id}`).click(function () {
    let rel = $(this).attr('rel');
    parentNode.addColumns(rel, parentNode.currentFields[id], parentNode.new_columns, id);
    parentNode.new_columns ++;
    // $(this).val(address);
  });
};

function analyzerTable () {
  this.new_columns = 0;
  this.createTable = createTable;
  // this.deleteBody = createT;
  this.addColumns = add_columns;
  this.searchAddress = searchAddress;
  this.currentFields = [];
};


function createTable(id, input_address, source) {
  // let newColumns_cnt = this.new_columns;
  // console.log(newColumns_cnt);
  let parentNode = this;
  // console.log(parentNode);
  let $table = $(id);
  // console.log(parentNode)
  // console.log($table)
  // console.log($table, id);
  let fields = [];
  let name = '';
  let address = '';
  for (var block in source) {
    if (source.hasOwnProperty(block)) {
      for (register of source[block]) {
        address = register.address
        if ( address.indexOf(input_address) > -1 )  {
          name = register.name
          fields = register.fields
          break
        };
      };
    };
  };
  let cardHeader = $table.attr('rel');

  let number = id.replace('#analyzerTable', '')
  if ( fields[0] != undefined) {
    createTableHead($table, Object.getOwnPropertyNames(fields[0]));
    createTableBody($table, fields);
    $(cardHeader).text(address); 
    hide_desp($table, true);

    //create columns
    for(var i=0; i< parentNode.new_columns; i++) {
      parentNode.addColumns(id, fields, i, number);
    }; 
    if ( parentNode.new_columns === 0 ){
      parentNode.addColumns(id, fields, 0, 0);
      parentNode.new_columns ++;
    }
    parentNode.currentFields.push(fields);
    return address
  } else {
    $(cardHeader).text(`Error!! 0x${input_address} Not Found.`);
  };
  
};
 
function createTableHead($table, header) {
    let thead = $table.find('thead');
  // if ( thead.length === 0) {
    let row = '<tr>';
    
    for (title of header) {
      let th = `<th>${title}</th>`;
      row += th;
    };
    row += '</tr>'
    // let new_thead = document.createElement('thead')
    // new_thead.append(row)
    thead.html(row);
    // $table.prepend(new_thead);
  // };
};

function createTableBody($table, data) {
  let tbody = $table.find('tbody');
  // if ( tbody.length === 0 ) {
  //   $table.append('<tbody></tbody>');
  // }
  let new_body = ''
  for (row_data of data) {
    let row = '<tr>'
    // console.log(row_data);
    for (var attrib in row_data) {
      if (row_data.hasOwnProperty(attrib)) {
        let col_data = row_data[attrib];
        row += `<td>${col_data}</td>`
        // console.log(attrib=='Field', attrib, row_data[attrib]);
        if (String(attrib) == 'Field' && col_data=='RESERVED') {
          // console.log(row_data[attrib]=='RESERVED', attrib);
          row = row.replace('tr' ,'tr class="smallFont"');
          // console.log(row);
        }
      }
    }
    // for ( col_data of row_data) {
    //   row += `<td>${col_data}</td>`
    // };
    row += '/</tr>'
    new_body += row;
  };
  tbody.html(new_body);
};

function add_columns(id, source, newColumns_cnt, tableCnt) {
  // let newColumns_cnt = 0
  let $table = $(id);
  // console.log('click', $table, id)  
  $.each(source, function (index, value) {
    let tr = $table.find('tr');
    
    // +1 to skip <thead>
    tr[index+1].insertAdjacentHTML('beforeend', `
      <td class="setvalue${newColumns_cnt}${tableCnt}" contenteditable="true"
      msb="${value.MSB}" lsb="${value.LSB}" rel="uservalue${newColumns_cnt}${tableCnt}">
      </td>
      `);
    // createTHead
    if ( index === 0) {
      tr[index].insertAdjacentHTML('beforeend', `<th>
      <input type="text" class="form-control" placeholder="UserValue(Hex)"
      aria-describedby="basic-addon${newColumns_cnt}${tableCnt}" id="uservalue${newColumns_cnt}${tableCnt}" rel=".setvalue${newColumns_cnt}${tableCnt}">
      </th>
      `);
    };
  });
  contenteditableCall(`setvalue${newColumns_cnt}${tableCnt}`)
  $(`#uservalue${newColumns_cnt}${tableCnt}`).keypress( function (e) {
    if ( e.which == 13 ) {
      setValue($(this), $(this).val());
    };
  });
  
};

function setValue($element, input_value) {
  // console.log(input_value);
  // let input_value = $element.val();
  input_value = input_value.replace('_', '').replace(/0x/i, '').trim();
  // console.log($element.attr())
  if (input_value.length > 8) {
    alert('Warning!!\nOnly support 32bit formatiing.');
    return false;
  };
  input_value = parseInt(input_value, 16)
  if (! Number.isInteger(input_value)) {
    alert('Warning!!\nInput should be an integer.');
    return false;
  };
  let binary = input_value.toString(2).padStart(32, 0)
  // console.log(binary);
  let rel = $element.attr('rel')
  let hex = input_value.toString(16).padStart(8, 0).toUpperCase()
  $element.val(hex);
  $element.attr('value', hex)
  $(rel).each(function () {
    let msb = $(this).attr('msb');
    let lsb = $(this).attr('lsb');
    let hex = parseInt(binary.slice(31-msb, 32-lsb), 2);
    $(this).text('0x'+hex.toString(16).toUpperCase());
    // console.log(31-msb,32-lsb);
  });

};


function hide_desp($element, hide) {
  if (hide) {
    $element.find('td:nth-child(4)').hide();
    $element.find('th:nth-child(4)').hide();
  } else {
    $element.find('td:nth-child(4)').show();
    $element.find('th:nth-child(4)').show();
  }
}

function contenteditableCall(_class) {
  var $cell = $(`.${_class}`);
  // console.log(`$(.${_class})`);
  $cell.each(function () {
    $(this).on('keydown', function(e) {
        if(e.which == 13) {
          $(this).blur();
        }
    });
    // use focus to save initial text when enter
    $(this).focus(function() {
        $(this).data("initialText", $(this).html());
    });
    // when leave, check content is changed or not
    $(this).blur(function() {
        // ...if content is different...
        if ($(this).data("initialText") !== $(this).html()) {
            setValueFromCell($(this));
        }
    });
  });
};

function setValueFromCell($selector) {
  value = $selector.text();
  value = value.replace(/0x/i, '').replace('_', '').trim();
  if ( value === '') {
    return false;
  };
  msb = parseInt($selector.attr('msb'));
  lsb = parseInt($selector.attr('lsb'));
  let rel = $selector.attr('rel');
  let header = $(`#${rel}`)
  let currentValue = header.attr('value');
  if ( currentValue == undefined ) currentValue = '00000000';
  currentValue = parseInt(currentValue, 16).toString(2).padStart(32, 0);
  value = parseInt(value, 16).toString(2).padStart(msb-lsb+1, 0);
  currentValue = currentValue.split('');
  for(var i = 31-msb; i<32-lsb; i++) {
    currentValue[i] = value[i-31+msb];
    // console.log(i, msb, lsb, value[i-31+msb]);
  };
  // console.log(value);
  currentValue = currentValue.join('');
  setValue(header, parseInt(currentValue, 2).toString(16));
};
