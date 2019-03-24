"use strict";
// global 
//var tableData;
// constructor
// console.log(tableData);


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
    for (var title of header) {
      row += `<th>${title}</th>`;
    };
    thead.html(`<tr>${row}</tr>`);
};

AnalyzerTable.prototype.createtBody = function (data) {
  let tbody = $(this.id).find('tbody');
  tbody.html(''); // remove html
  let new_tbody = '';
  for (var row of data) {
    let tr = document.createElement('tr')
    let td = ''
    for (var col in row) {
      if (row.hasOwnProperty(col)) {
        let cell = row[col];
        // console.log(cell, col);
        td += `<td>${cell}</td>`;
        // console.log(col, String(col));
        if (String(col) === 'Field' && cell.toUpperCase()==='RESERVED') {
          // console.log(row_data[attrib]=='RESERVED', attrib);
          // tr = tr.replace('tr' ,'tr class="smallFont"');
          tr.setAttribute('class', 'smallFont');
          tr.setAttribute('access', 'RO')
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
  let value = $selector.text();
  value = handle_hex(value);
  if ( value === '') {
    return false;
  };
  let msb = parseInt($selector.attr('msb'));
  let lsb = parseInt($selector.attr('lsb'));
  // access = $selector.attr('access')
  let which_index = $selector.index();
  let which_table = $selector.attr('owner');

  let $th = $(which_table).find(`th:nth-child(${which_index+1})`).find('.form-control');

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
    let access = $(this).attr('access');
    let cell = '';
    if (msb === undefined) {
      cell = `<th class="searchbar">
      
      <input type="text" class="form-control uservalue${num}" placeholder="UserValue(Hex)"
      aria-describedby="basic-addon0"
      owner="#analyzerTable${num}"
      >
      </th>`
    } else {
      let writable = true; // read only
      if ( access === 'RO' ) writable = false
      cell = `
        <td class="setvalue${num}" contenteditable="${writable}"
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
  // let hex = input_value.toString(16).padStart(8, 0).toUpperCase()
  // $selector.val(hex);
  let which_table = $selector.attr('owner');
  let which_index = $selector.closest('th').index();
  let new_value = '';
  let warning_log = 'Warning!!';
  // console.log(binary)
  $(which_table).find(`td:nth-child(${which_index+1})`).each( function (){
    let msb = $(this).attr('msb');
    let lsb = $(this).attr('lsb');
    let access = $(this).attr('contenteditable')
    // console.log(access, msb, lsb);
    let slice = binary.slice(31-msb, 32-lsb);
    // console.log(binary);
    if ( access === 'true' ) {
      new_value += slice;
      $(this).text('0x'+parseInt(slice, 2).toString(16).toUpperCase());
    } else {
      $(this).text('0x0');
      new_value += slice.replace(/1/ig, '0');
      if (slice.indexOf('1') > -1) {
        warning_log += `</br>Writing to "RESERVED" field [${msb}:${lsb}]`;
      };
    };
  });
  // console.log(new_value)
  new_value = parseInt(new_value, 2).toString(16).toUpperCase().padStart(8, 0);
  $selector.val(new_value);
  $selector.attr('value', new_value);
  if ( warning_log !== 'Warning!!' )  {
    let num = which_table.replace('#analyzerTable', '');
    // console.log(num)
    let alert = $(`#alert${num}`);
    alert.html(warning_log);
    alert.show();
    //.delay(2000).hide(500);
  };
};

// function httpRequest(method, url) {
//   var request = new XMLHttpRequest();
//   request.open(method, url);
//   // load data function
//   // var data;
//   request.onload = function() {
//     // check request status
//     if (request.status >= 200 && request.status <400) {
//       // global var
//       tableData = JSON.parse(request.responseText);
//       // renderHTML(data);
//     } else {
//       console.log('Error!! request failed');
//     };
//   };
//   request.onerror = function () {
//     console.log('Connection Error');
//   };
//   // send request
//   request.send();
//   // return data;
// };

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
          for (var register of tableData[block]) {
            let address = register.address;
            if (address.indexOf(input_address) > -1) {
              match = register;
              match['block'] = block
              break
            };
          };
        };
      }; // end of whole loop
      let penel = $(`#panel${id}`);
      if (match !== undefined) {
        table.createTable(Object.getOwnPropertyNames(match.fields[0]), match.fields);
        // $(this).val(match.address);
        penel.text(`${match.block}: ${match.address} (${match.name})`);
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
        <div class="alert alert-warning" role="alert" id="alert${this.number}" style="display: none;">
          A simple warning alert—check it out!
        </div>
      </div>
      <div class="card-body mycard" id="collapsed${this.number}">
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">0x</span>
          </div>
          <input type="text" class="form-control" placeholder="Base Address(Hex)" aria-describedby="basic-addon1" id="addr_input${this.number}" rel='#analyzerTable${this.number}'></input>
        </div>

            <button type="button" class="btn btn-secondary btn-sm" id="btnHide${this.number}" rel="#analyzerTable${this.number}">More Info</button>
            <button type="button" class="btn btn-secondary btn-sm" id="addColumn${this.number}" rel="#analyzerTable${this.number}">Add Colunm</button>
            <button type="button" class="btn btn-secondary btn-sm" id="RmColumn${this.number}" rel="#analyzerTable${this.number}">Remove Colunm</button>
        <div class='table-responsive-sm'>
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
  WarningMSG(this.number);
  autocompletion(this.number);
}

function AddCard(index) {
  const card = new Card(index);
  card.createBody();
  card.panel();
  card.deleteSelf();
  card.Search();
  return card;
};

function WarningMSG(id) {
  $(`#alert${id}`).mouseleave( function () {
    $(this).slideUp();
  });
}

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
};

function autocompletion(id) {
  var addressList = [];
  
  $(`#addr_input${id}`).autocomplete( {
    source: function(request, respond) {
      let to_match = request.term;
      let found = [];
      for (var block in tableData) {
        if (tableData.hasOwnProperty(block)) {
          for (var register of tableData[block]) {
            if (register.address.indexOf(to_match) > -1) {
              found.push([register, block])
            }
            // if (found.length === 10) {
            //   break;
            // }
          };
        };
      };
      respond(found);
    },
    select: function( event, ui ) {
          $( `#addr_input${id}` ).val( ui.item[0].address );   
          return false;
    },
    minLength: 2
  }).autocomplete( "instance" )._renderItem = function( ul, item ) {
    // console.log(item)
    // .append( "<div>" + item[0].address + " " + item[1] + "</div>" )
    return $( "<li>" )
      .append( `<div>${item[1]}: ${item[0].address} (${item[0].name})</div>` )
      .appendTo( ul );
    };
};

function RegisterProfile(data, entries) {
    this.data = data;
    this.id = '#register-profile';
    // this.blocks = Object.getOwnPropertyNames(data);
    // this.blockBoundary = {};
    this.registerTotal = 0;

    this.entries = entries;
    // this.block_selected = '-1' // -1 stand all blocks selected
    this.tableSlice = {};
    this.lastEntry = 0;
};

RegisterProfile.prototype.slicing = function (blocks, data) {
  var slice_index = 0;
  var boundary = 0;
  if ( this.entries === 0) {
    console.log(this.tableSlice)
    return false;
  };
  this.tableSlice = {};
  for ( var block of blocks ) {
    // console.log(block)
    let block_len = data[block].length;
    let ceil = Math.ceil(block_len/this.entries);
    for (var j=0; j<ceil; j++) {
      this.tableSlice[slice_index] = [block, boundary];
      slice_index++;
    }
    boundary += ceil*this.entries;
    this.registerTotal += block_len;
  };
  this.lastEntry = parseInt(Object.getOwnPropertyNames(this.tableSlice).slice(-1, )[0]);
};

RegisterProfile.prototype.createHead = AnalyzerTable.prototype.createtHead;
RegisterProfile.prototype.createBody = function (entry, data) {
  let slice = this.tableSlice[entry];
  // console.log(slice)
  let block = slice[0]
  let boundary = slice[1];
  let start = entry*this.entries - boundary;
  let end = this.entries+start;
  let new_tbody = ''
  var head = [];
  for (var i=start; i<end; i++) {
    let register= data[block][i];
    
    if ( register === undefined ) break;
    
    let address = register.address;
    let name = register.name;
    let fields = register.fields;
    
    // console.log(fields);
    if ( fields[0] === undefined ) break;
    
    head = Object.getOwnPropertyNames(fields[0]);
    if (new_tbody === '') new_tbody += `<tr class='block_header bg-light'>
    <td colspan="${head.length}">${block}</td>
    </tr>`
    new_tbody += `<tr class="register_header">
    <td colspan="${head.length}">${address} (${name})</td>
    </tr>`
    for (var row of fields) {
      // console.log(row);
      let td = ''
      let smallFont = ''
      for (var col in row) {
        let cell = row[col]
        td += nestingTag('td', cell);    
        if (String(col) === 'Field' && cell.toUpperCase()==='RESERVED') {
          smallFont = ' smallFont'
        };
        // console.log(col, cell)
      };
      new_tbody += nestingTag('tr', td).replace('<tr>', `<tr class="cell${smallFont}">`)
    };
    
  };
  let id = this.id;
  $(id).find('tbody').html(new_tbody);
  // console.log(head);
  return head
};

RegisterProfile.prototype.createTable = function (entry, data) {
  let head = this.createBody(entry, data);
  // console.log(entry)
  this.createHead(head);
};

function creatIPList (ipList) {
  let color_list = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
  let index = 0;
  let str = ''
  for (var ip of ipList) {
    let color = color_list[index];
    str +=`<a href="#" class="col-md-1 badge badge-${color} ipBadge">${ip}</a>`;
    index ++;
    if (index === color_list.length) index = 0;
  }
  $('#ip-list').html(str);
};

RegisterProfile.prototype.Searching = function (to_match, blocks) {

  let regxp = new RegExp(to_match, 'igm');
  var new_tbody = ''
  var str = ""
  // console.log(regxp);
  for (var block of blocks) {
    new_tbody = `<tr class='block_header bg-light'><td colspan="6">${block}</td></tr>`
    let match = false;
    for (var register of this.data[block]) {
      let address = register.address;
      let name = register.name;
      let fields = register.fields;
      if ( address.search(regxp) > -1 ) {
        address = address.replace(regxp, replace_cb)
        new_tbody += `<tr class="register_header"><td colspan="6" >${address} (${name})</td></tr>`;
        match = true;
        new_tbody +=createRow(fields)
        continue;
      } else if (name.search(regxp) > -1) {
        name = name.replace(regxp, replace_cb)
        new_tbody += `<tr class="register_header"><td colspan="6">${address} (${name})</td></tr>`;
        match = true;
        new_tbody +=createRow(fields)
        continue;
      } else {
        for ( var row of fields ) {
          let found = false;
          for ( var col in row) {
            let cell = row[col];
            // console.log(col, cell);
            if (String(cell).search(regxp) > -1) {
              found = true;
              break;
            };
          };
          if (found) {
            if (new_tbody.search(address) === -1) {
              new_tbody += `<tr class="register_header"><td colspan="6" >${address} (${name})</td></tr>`;
            };
            let td = ''
            for (var col in row) {
              let cell = row[col];
              cell = String(cell).replace(regxp, replace_cb);
              td += `<td>${cell}</td>`;
            };
            new_tbody += `<tr>${td}</tr>`;
            match = true;
            // str += new_tbody
          };
        };
      };
    };
    if (match) str += new_tbody
  };
  // str = str.replace(regxp, )
  // str = str.replace(regxp, function (match) {
  // 
  // });
  $(this.id).find('tbody').html(str);
};

function replace_cb (match) {
  return `<span class="searchHighlight">${match}</span>`;
};

function createRow(fields) {
  let str = "";
  for ( var row of fields ) {
    let found = false;
    let td = ''
    for ( var col in row) {
      let cell = row[col];
      td += nestingTag('td', cell);
    };
     str+= nestingTag('tr', td)
  };
  return str;
};

function ipSearch(ipList, $selector) {
  function split( val ) {
    return val.split( /,\s*/ );
  };
  function extractLast( term ) {
    return split( term ).pop();
  };
  $selector
  // don't navigate away from the field on tab when selecting an item
  .on( "keydown", function( event ) {
    if ( event.keyCode === $.ui.keyCode.TAB &&
        $( this ).autocomplete( "instance" ).menu.active ) {
      event.preventDefault();
    }
  })
  .autocomplete({
    minLength: 0,
    source: function( request, response ) {
      // delegate back to autocomplete, but extract the last term
      response( $.ui.autocomplete.filter(
        ipList, extractLast( request.term ) ) );
    },
    focus: function() {
      // prevent value inserted on focus
      return false;
    },
    select: function( event, ui ) {
      var terms = split( this.value );
      // remove the current input
      terms.pop();
      // add the selected item
      terms.push( ui.item.value );
      // add placeholder to get the comma-and-space at the end
      terms.push( "" );
      this.value = terms.join( ", " );
      return false;
    }
  });
}

function plot(ipList) {
  var color = Chart.helpers.color;
  var ctx = document.getElementById('myChart').getContext('2d');
  var lables = ipList;
  var data_y = [];
  var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  };
  var color = []
  for (var lable of lables) {
    data_y.push(tableData[lable].length);
    color.push(dynamicColors());
  }
  var options = {
    responsive: true,
    scales: {
        yAxes: [{
            gridLines: {
                // offsetGridLines: false,
                display:false
            }
        }],
        xAxes: [{
            gridLines: {
                offsetGridLines: true,
                // display:false
            }
        }],
        
    }
  };
  var data = {
    labels:lables,
    datasets:[{
      label: 'RegisterCounts',
      data: data_y,
      backgroundColor: color,
      // xAxisID:'Counts',
    }]
  };
  // console.log(data);
  var chart = new Chart(ctx, {
    type: "horizontalBar",
    // lables: lables,
    data: data,
    options: options,
  });
}

$(document).ready(function () {

  document.body.setAttribute('spellcheck', false);

  if (tableData === undefined) {
        alert('Error!! Data source is unavailable');
        return false;
  };
  
  var project = tableData['project'];
  var top_module = tableData['top_module'];
  
  delete tableData['project'];
  delete tableData['top_module'];
  
  var ipList = Object.getOwnPropertyNames(tableData);
  creatIPList(ipList);
  $('#project').text(project);
  $('#top_module').text(top_module);
  var index = 3;
  for (var i = 0; i < index; i++) {
    AddCard(i);
  };

  $('#add-card').click( function () {
    AddCard(index);
    index ++;
  });

  $('#hide-all').click( function () {
    $('.card-body.mycard').slideUp();

  });

  $('#show-all').click( function () {
    $('.card-body.mycard').slideDown();
  });
  var entrySelected = $('#entry-select option:selected').text();
  var totalRegister = 0;
  for (var block in tableData) {
    totalRegister += tableData[block].length;
  }
  if (entrySelected === 'All') entrySelected = totalRegister;
  else entrySelected = parseInt(entrySelected);
  // console.log(entrySelected);
  var currentEntry = 0;
  var currentIPList = ipList;
  var reg_profile = new RegisterProfile(tableData, entrySelected);
  reg_profile.slicing(currentIPList, reg_profile.data);
  reg_profile.createTable(currentEntry, reg_profile.data);
  var last = reg_profile.lastEntry;
  var all = reg_profile.lastEntry;
  last = parseInt(last);
  
  //--- jquery selector
  let $my_select = $('.my-select');
  let $page_info = $('.page-info');
  let $pagination = $('.pagination');
  let $ip_search = $('#ip-search');
  let $cardgroup = $('#cardgroup');
  let $tablegroup = $('.table-group');
  //---
  ipSearch(ipList, $ip_search);
  
  $cardgroup.sortable(
    {cancel: ':input,button,table'}
  );
  $page_info.text(`${currentEntry+1}/${last+1}`)
  
  $pagination.find('.page-item').click( function (){
    let text = $(this).text();
    if (currentEntry === 0) {
      if (text === 'Frist' || text === 'Previous') {
        return false;
      };
    };
    if (currentEntry === last) {
      if (text === 'Last' || text === 'Next') {
        return false;
      };
    };
    if (currentEntry !== last) {
      if (text === 'Last') currentEntry = last;
      if (text === 'Next') currentEntry ++;
      // reg_profile.createTable(currentEntry, reg_profile.data);
    };
    if (currentEntry !== 0) {
      if (text === 'Frist') currentEntry = 0;
      if (text === 'Previous') currentEntry --;
         
    };
    // console.log(currentEntry, last);
    reg_profile.createTable(currentEntry, reg_profile.data);
    $page_info.text(`${currentEntry+1}/${last+1}`);
    // console.log(currentEntry, text);
  });
  $('#entry-select').change( function () {
    
    let newEntry = $(this).find("option:selected").text();
    if (newEntry === 'All') {
      newEntry = all;
    } else {
      newEntry = parseInt(newEntry);
    };
    currentEntry = Math.floor(currentEntry*(entrySelected/newEntry));
    // console.log(currentEntry)
    entrySelected = newEntry;
    reg_profile.entries = entrySelected;
    reg_profile.slicing(currentIPList, reg_profile.data);
    last = reg_profile.lastEntry
    if ( currentEntry > last) currentEntry = last;
    // console.log(currentEntry, last, currentIPList);
    reg_profile.createTable(currentEntry, reg_profile.data); 
    $page_info.text(`${currentEntry+1}/${last+1}`);
    // $('.pagination').show();
  });
  // console.log(currentIPList)
  $('.ipBadge').click(function () {
    let blockSelected = $(this).text();
    let value = $ip_search.val();
    // let $ip_search = $('#ip-search');
    value += blockSelected+', '
    // $ip_search.val(value);
    $ip_search.val(value);
    currentIPList = value.split(', ').slice(0, -1);;
    currentIPList.reverse();
    currentIPList = Array.from(new Set(currentIPList));

    reg_profile.slicing(currentIPList, reg_profile.data);
    currentEntry = 0;
    last = reg_profile.lastEntry;
    reg_profile.createTable(currentEntry, reg_profile.data); 
    $page_info.text(`${currentEntry+1}/${last+1}`);
    $pagination.show();
    $my_select.show();
    
    // console.log(currentIPList)
  });
  $ip_search.keydown( function (e) {
    if( e.which === 13) {
      currentIPList = $(this).val().split(', ').slice(0, -1);
      
      if ( currentIPList[0] === undefined) {
        currentIPList = ipList;
      } else {
        currentIPList.reverse();
      };
      currentIPList = Array.from(new Set(currentIPList));
      reg_profile.slicing(currentIPList, reg_profile.data);
      currentEntry = 0;
      last = reg_profile.lastEntry;
      reg_profile.createTable(currentEntry, reg_profile.data);
      $pagination.show();
      $my_select.show();
      $page_info.text(`${currentEntry+1}/${last+1}`);
    };
  });
  $('#ip-clear').click( function () {
    $ip_search.val('');
    currentIPList = ipList;
    reg_profile.slicing(currentIPList, reg_profile.data);
    currentEntry = 0;
    last = reg_profile.lastEntry;
    reg_profile.createTable(currentEntry, reg_profile.data);
    $pagination.show();
    $my_select.show();
    $page_info.text(`${currentEntry+1}/${last+1}`);
  });
  $('#table-search').keydown( function (e) {
    if (e.which === 13) {
      let text = $(this).val().trim()
      // console.log('enter');
      if (text === '') {
        reg_profile.slicing(currentIPList, reg_profile.data);
        currentEntry = 0;
        last = reg_profile.lastEntry;
        reg_profile.createTable(currentEntry, reg_profile.data);
        $pagination.show();
        $my_select.show();
        return false;
      };
      reg_profile.Searching(text, currentIPList);
      // console.log(match);
      $pagination.hide();
      $my_select.hide();
    }
  });
  let $card_nav = $('.card-nav');
  let $table_nav = $('.table-nav');
  let $card_ip = $('#card-ip');
  let $Statistics = $('#Statistics');
  let $plot = $('#my-plot');
  $plot.hide();
  $card_nav.hide();
  $('#RegAnalyzer').click( function () {
    $cardgroup.show();
    $tablegroup.hide();
    $card_nav.show();
    $table_nav.hide();
    $plot.hide();
  });
  
  $('#RegProfile').click( function () {
    $cardgroup.hide();
    $tablegroup.show();
    $card_nav.hide();
    $table_nav.show();
    $plot.hide();
  });
  $('#hide-badge').click( function () {
    let text = $(this).text();
    if ( text.indexOf('Hide') > -1 ) {
      $(this).text('ShowBadge')
      $card_ip.slideUp();
      
    } else {
      $(this).text('HideBadge')
      $card_ip.slideDown();
    };
    
  });
  plot(ipList);
  $Statistics.click(function () {
    $plot.show();
    $cardgroup.hide();
    $tablegroup.hide();
    $card_nav.hide();
    $table_nav.hide();
    
  });
});
