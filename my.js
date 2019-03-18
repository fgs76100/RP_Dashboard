function hide_desp(hide) {
  if (hide) {
    $('#analyzerTable td:nth-child(4),#analyzerTable th:nth-child(4)').hide();
  } else {
    $('#analyzerTable td:nth-child(4),#analyzerTable th:nth-child(4)').show();
  }
}

function create_table(source, key, columns, hide, newColumns_cnt) {
  var datas = source.rows().data();
  // var analyzerTable = {
  //   datas: [],
  //   columns: columns
  // }
  let addr_to_keep = [];
  let data_to_keep = [];
  // search matching address to display
  for (var i = 0; i < datas.length; i++) {

    if (datas[i][columns.addr].indexOf(key) > -1) {
      if ( addr_to_keep[0] == undefined) {
        addr_to_keep = datas[i].slice(columns.addr, columns.msb)
      }
      else {
          if ( addr_to_keep[columns.addr] != datas[i][columns.addr] ) {
            console.log(addr_to_keep)
            console.log(datas[i][columns.addr])
            alert('Warning!!\nFound duplicate address,\nplease make sure input address is unique')
            // break
            return false
          }
      }
      data_to_keep.push(datas[i].slice(columns.msb, ))
      // console.log(datas[i])
    }
  }
  var analyzerTable = document.getElementById('analyzerTable');
  // create header for table
  if ( analyzerTable.tHead == null ) {
      let head = analyzerTable.createTHead();
      let row = head.insertRow();

      $("#datatable thead tr th").each(function(){
            let th = document.createElement('th');
            //This executes once per column showing your column names!
            // alert(this.innerHTML);
            th.innerHTML = this.innerHTML;
            row.append(th);
            // console.log(this.innerHTM)
        });
  }
  // create tbody for table
  var new_tbody = document.createElement('tbody');
  for (var i = 0; i < data_to_keep.length; i++) {
    // console.log(data_to_keep)
    let row = new_tbody.insertRow();
    for (var ii = 0; ii < data_to_keep[i].length; ii++) {
      let cell = row.insertCell();
      if (data_to_keep[i][ii] === 'RESERVED' && ii == 2) {
        row.setAttribute('class', 'smallFont');
      }
      cell.innerHTML = data_to_keep[i][ii].toString();
      console.log(data_to_keep[i][ii].toString())
    }
  }
  old_tbody = analyzerTable.tBodies[0]
  old_tbody.parentNode.removeChild(old_tbody)
  analyzerTable.append(new_tbody)

  // to keep hide or show description
  if (!hide) hide_desp(!hide)
  // to keep new columns cnt as same as old tbody
  for (var i = 0; i < newColumns_cnt; i++) {
    add_columns('analyzerTable', data_to_keep, i, add_body=true, add_head=false)
  }
  // show register info
  // all element in array should share same blocks, name and address
  // so only using index 0 to get info
  if ( data_to_keep.length !== 0) {
    document.getElementById('info').innerHTML = `
    ${addr_to_keep[columns.blocks]}:
    ${addr_to_keep[columns.addr]} (${addr_to_keep[columns.name]})
    `
    $('#addr_input').val(addr_to_keep[0].replace(/0x/i, ''))
  } else {
    // address not found
    document.getElementById('info').innerHTML = `
    The address "0x${key}" Not Found.
    `
  }
  // for auto completion

  return data_to_keep
}; // end of function

// parameter oreder must same as function
function add_columns(id, source, newColumns_cnt, add_body=true, add_head=true) {
  var $table = $(`#${id}`)
  let cnt = 0;
  $table.find('tr').each(function (index) {
    // console.log(source[index], index, source.length)
    if ( add_body && source[index-1] != undefined ) {
      $(this).find('td').eq(-1).after(`
        <td class="setvalue${newColumns_cnt}" contenteditable="true"
        msb="${source[index-1][0]}" lsb="${source[index-1][1]}" rel="uservalue${newColumns_cnt}"></td>
        `
      );
    }
    if ( add_head ) {
      $(this).find('th').eq(-1).after(`
        <th>
        <input type="text" class="form-control" placeholder="UserValue(Hex)"
        aria-describedby="basic-addon${newColumns_cnt}" id="uservalue${newColumns_cnt}" rel=".setvalue${newColumns_cnt}"></th>
        `
      );

    }
  });
  if (add_body) contenteditableCall(`setvalue${newColumns_cnt}`);
  if (add_head) {
    $(`#uservalue${newColumns_cnt}`).on('keydown', function(e) {
      if(e.which == 13) {
        var $this_header = $(this)
        setValue($this_header, $this_header.val());
      };
    });
  };
  newColumns_cnt ++;
  return newColumns_cnt
};

function remove_column (id) {
  var $table = $(`#${id}`)
  $table.find('tr').each( function (){
    $(this).find('td').eq(-1).remove();
  });
  $table.find('th').eq(-1).remove();
};

function setValue($element ,input_value) {
  // console.log(input_value);
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

function contenteditableCall(_class) {
  var $cell = $(`.${_class}`);
  // console.log(`$(.${_class})`);
  $cell.each(function () {
    // console.log($(this));
    $(this).keydown(function(e) {
        if(e.which == 13) {
          setValueFromCell($(this));
          e.preventDefault();
        }
    })

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

// function hexToBinary(hex) {
//   return parseInt(hex, 16).toString(2).padStart(32, 0)
// }
