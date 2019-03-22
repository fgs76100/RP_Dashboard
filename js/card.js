// global 
//var tableData;

// constructor
function AnalyzerTable(num) {
  this.id = `#analyzerTable${num}`;
  this.number = num;
  this.newColumns_cnt = 0;
};

function nestingTag (tag, innerHTML) {
  return `<${tag}>${innerHTML}</${tag}>`;
};

function handle_hex(hex) {
  return hex.replace(/0x/i, '').replace('_', '').trim().toUpperCase();
};

// create table tHead
AnalyzerTable.prototype.createtHead = function (header) {
    let thead = $(this.id).find('thead');
    let row = ''
    for (title of header) {
      row += `<th>${title}</th>`;
    };
    thead.html(`<tr>${row}</tr>`);
};

AnalyzerTable.prototype.createtBody = function (data) {
  let tbody = $(this.id).find('tbody');
  tbody.html(''); // remove html
  let new_tbody = '';
  for (row of data) {
    let tr = document.createElement('tr')
    let td = ''
    for (var col in row) {
      if (row.hasOwnProperty(col)) {
        let cell = row[col];
        // console.log(cell, col);
        td += `<td>${cell}</td>`;
        if (String(col) === 'Field' && cell==='RESERVED') {
          // console.log(row_data[attrib]=='RESERVED', attrib);
          // tr = tr.replace('tr' ,'tr class="smallFont"');
          tr.setAttribute('class', 'smallFont');
        };
        if(String(col) === 'MSB' || String(col) === 'LSB') {
          tr.setAttribute(col, cell);
        };
      };
    };
    // console.log(td)
    tr.innerHTML = td;
    // console.log(tr);
    tbody.append(tr);
  }; // end of loop
  // tbody.html(new_tbody);
};

AnalyzerTable.prototype.createTable = function (header, data) {
  this.createtHead(header);
  this.createtBody(data);
};

AnalyzerTable.prototype.hide_description = function (id, hide) {
  let $element = $(id);
  if (hide) {
    $element.find('th:nth-child(n+4):nth-child(-n+6)').hide();
    $element.find('td:nth-child(n+4):nth-child(-n+6)').hide();
  } else {
    $element.find('td:nth-child(n+4):nth-child(-n+6)').show();
    $element.find('th:nth-child(n+4):nth-child(-n+6)').show();
  };
};


function contenteditableCall(_class) {
  var $cell = $(`.${_class}`);
  // console.log(`$(.${_class})`);
  $cell.each(function () {
    $(this).off();
    $(this).on('keydown', function(e) {
        if(e.which === 13) {
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
          // console.log('changed')
          setValueFromCell($(this));
        }
    });
  });
};

function setValueFromCell($selector) {
  value = $selector.text();
  value = handle_hex(value);
  if ( value === '') {
    return false;
  };
  msb = parseInt($selector.attr('msb'));
  lsb = parseInt($selector.attr('lsb'));
  let which_index = $selector.index();
  let which_table = $selector.attr('owner');

  $th = $(which_table).find(`th:nth-child(${which_index+1})`).find('.form-control');

  let currentValue = $th.attr('value');
  if ( currentValue === undefined ) currentValue = '00000000';
  currentValue = parseInt(currentValue, 16).toString(2).padStart(32, 0);
  value = parseInt(value, 16).toString(2).padStart(msb-lsb+1, 0);
  currentValue = currentValue.split('');
  for(var i = 31-msb; i<32-lsb; i++) {
    currentValue[i] = value[i-31+msb];
    // console.log(i, msb, lsb, value[i-31+msb]);
  };
  currentValue = currentValue.join('');
  setValueFromHead($th, parseInt(currentValue, 2).toString(16));  
};

AnalyzerTable.prototype.rmColumns = function () {
  let $table = $(this.id)
  let index_to_remove = $table.find('.searchbar').eq(-1).index();
  if ( index_to_remove !== -1 ) {
    $table.find(`td:nth-child(${index_to_remove+1}), th:nth-child(${index_to_remove+1})`).remove();
    // $table.find(`th`).eq(index_to_remove).remove();
  };
}

 function addColumnsBtn ($table, num) {
  // func = AnalyzerTable.prototype.addColumns;
  let btn = $(`#addColumn${num}`);
  btn.off();
  btn.click( function () {
    addColumns($table, num);
  });
};

function addColumns ($table, num) {
  // let num = this.number;
  // let table = $(this.id);
  // let newColumns_cnt = this.newColumns_cnt;
  $table.find('tr').each( function(index) {
    // console.log(index, $(this).attr('msb'));
    let msb = $(this).attr('msb');
    let lsb = $(this).attr('lsb');
    let cell = '';
    if (msb === undefined) {
      cell = `<th class="searchbar">
      
      <input type="text" class="form-control uservalue${num}" placeholder="UserValue(Hex)"
      aria-describedby="basic-addon0"
      owner="#analyzerTable${num}"
      >
      </th>`
    } else {
      cell = `
        <td class="setvalue${num}" contenteditable="true"
        msb="${msb}" lsb="${lsb}" owner="#analyzerTable${num}">
        </td>`        
    };
    $(this).append(cell);
  });
  contenteditableCall(`setvalue${num}`);
  let uservalue = $(`.form-control.uservalue${num}`);
  uservalue.each( function() {
    $(this).off();
    $(this).on('keydown', function (e) {
      if (e.which === 13) {
        setValueFromHead($(this), $(this).val());
      }
    })
  });
  // contenteditableCall
  // return newColumns_cnt ++
};

function setValueFromHead ($selector, input_value) {
  
  input_value = handle_hex(input_value);
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
  let hex = input_value.toString(16).padStart(8, 0).toUpperCase()
  $selector.val(hex);
  $selector.attr('value', hex)
  
  let which_table = $selector.attr('owner');
  let which_index = $selector.closest('th').index();
  $(which_table).find(`td:nth-child(${which_index+1})`).each( function (){
    msb = $(this).attr('msb');
    lsb = $(this).attr('lsb');
    let hex = parseInt(binary.slice(31-msb, 32-lsb), 2);
    $(this).text('0x'+hex.toString(16).toUpperCase());
  });
};

function httpRequest(method, url) {
  var request = new XMLHttpRequest();
  request.open(method, url);
  // load data function
  // var data;
  request.onload = function() {
    // check request status
    if (request.status >= 200 && request.status <400) {
      // global var
      tableData = JSON.parse(request.responseText);
      // renderHTML(data);
    } else {
      console.log('Error!! request failed');
    };
  };
  request.onerror = function () {
    console.log('Connection Error');
  };
  // send request
  request.send();
  // return data;
};

// constructor
function Card(num) {
  this.number = num;
  this.table = new AnalyzerTable(num);
}

Card.prototype.deleteSelf = function () {
  let id = this.number
  $(`#deleter${id}`).click( function () {  
    // console.log('click', `#card${id}`);
    $(`#card${id}`).remove();
  });
};

Card.prototype.panel = function () {
  let id = this.number
  $(`#panel${id}`).click( function () {
    $(`#collapsed${id}`).slideToggle();
  });
};

Card.prototype.Search = function () {
  let id = this.number;
  let table = this.table;
  $(`#addr_input${id}`).keydown( function (e) {
    if (e.which === 13) {
      let input_address = $(this).val();
      // input_address = input_address.replace(/0x/ig, '').replace('_');
      input_address = handle_hex(input_address);
      if ( input_address === '') {
        return false;
      };
      var match;
      for (var block in tableData) {
        if (tableData.hasOwnProperty(block)) {
          for (register of tableData[block]) {
            let address = register.address;
            if (address.indexOf(input_address) > -1) {
              match = register;
              break
            };
          };
        };
      }; // end of whole loop
      let penel = $(`#panel${id}`);
      if (match !== undefined) {
        source = match.fields;        
        table.createTable(Object.getOwnPropertyNames(source[0]), source);
        $(this).val(match.address);
        penel.text(`${match.address} (${match.name})`);
        addColumns($(table.id), table.number);
        table.hide_description(table.id, true);
      } else {
        // $(this).val(`${input_address} Not found`);
        penel.text(`${input_address} Not Found`);
      };
    }; // end of e.whcih
  }); // end of event handler
};

Card.prototype.createBody = function () {
  let template = `
    <div class="card">
      <div class="card-header">
        <button class="btn btn-link collapsed" type="button" rel="#collapsed${this.number}" id="panel${this.number}">RegisterAnalyzer</button>
        <button type="button" class="close" aria-label="Close" id="deleter${this.number}" rel="#analyzer${this.number}" >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="card-body" id="collapsed${this.number}">
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">0x</span>
          </div>
          <input type="text" class="form-control" placeholder="Base Address(Hex)" aria-describedby="basic-addon1" id="addr_input${this.number}" rel='#analyzerTable${this.number}'></input>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="btnHide${this.number}" rel="#analyzerTable${this.number}">More Info</button>
        <button type="button" class="btn btn-secondary btn-sm" id="addColumn${this.number}" rel="#analyzerTable${this.number}">Add Colunm</button>
        <button type="button" class="btn btn-secondary btn-sm" id="RmColumn${this.number}" rel="#analyzerTable${this.number}">Remove Colunm</button>
  
        <div class='table-responsive-sm' style="width: 90%; margin: 0 auto; padding: 10px 0 0 0">
          <table class='table table-sm' id='analyzerTable${this.number}' rel="#card${this.number}">
            <thead>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;  
  // let id = this.number;
  let div = document.createElement('div');
  div.setAttribute('class', 'row-md-10');
  div.setAttribute('id', `card${this.number}`);
  div.innerHTML = template;
  $('#cardgroup').append(div);
  rmColumnBTN(this.number, this.table);
  addColumnsBtn($(this.table.id), this.number);
  descriptionBTN(this.number, this.table, this.table.id);
}

function AddCard(index) {
  const card = new Card(index);
  card.createBody();
  card.panel();
  card.deleteSelf();
  card.Search();
  return card;
};

function descriptionBTN (id, table, tableID) {
  let btn = $(`#btnHide${id}`);
  btn.off();
  btn.click( function () {
    let text = $(this).text();
    if (text === 'More Info') {
      table.hide_description(tableID, false);
      $(this).text('Less Info');
    } else {
      table.hide_description(tableID, true);
      $(this).text('More Info');
    };
  });
};

function rmColumnBTN(id, table) {
  $(`#RmColumn${id}`).click( function () {
    // console.log('click')
    table.rmColumns();
  });
}

$(document).ready(function () {

  document.body.setAttribute('spellcheck', false);

  if (tableData === undefined) {
        alert('Error!! The connection to server FAILED');
        return false;
  };
  var index = 0;
  for (var i = 0; i < 3; i++) {
    AddCard(i);
    index ++
  };

  $('#add-card').click( function () {
    AddCard(index);
    index ++;
  });

  $('#hide-all').click( function () {
    $('.card-body').slideUp();

  });

  $('#show-all').click( function () {
    $('.card-body').slideDown();
  });
});
