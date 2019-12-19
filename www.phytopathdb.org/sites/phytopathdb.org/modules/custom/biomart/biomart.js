if (Drupal.jsEnabled) {
    $(window).load( function() {
        var init_goterms = document.getElementsByName("go_id");
        if ( init_goterms.length > 0 ) {
            sendRequest('/query/go_id/'+init_goterms[0].getAttribute("term")+'/term.json', handleRequest, 0, 'go_id');
        }
        var init_ontterms = document.getElementsByName("ont_id");
        if ( init_ontterms.length > 0 ) {
            sendRequest('/ontterm/'+init_ontterms[0].getAttribute("term")+'/term.json', handleOntNameRequest, 0, 'ont_id');
        }
    });
}

show_alerts = false;

function handleRequest(req, element_id, element_name) {
	var init_goterms = document.getElementsByName(element_name);

	var go_term;
	try {
        go_term = JSON.parse(req.responseText);
    } catch (e) {
        if (show_alerts) {
            alert (e);
        }
    }
    var go_id = init_goterms[element_id].getAttribute("term");
	init_goterms[element_id].innerHTML = go_term[go_id]['term'] + ' - ' + go_term[go_id]['name'];

	if ( init_goterms.length > element_id ) {
	    element_id += 1;
        sendRequest('/query/go_id/'+init_goterms[element_id].getAttribute("term")+'/term.json', handleRequest, element_id, element_name );
    }
}

function handleOntNameRequest(req, element_id, element_name) {
	var init_ontterms = document.getElementsByName(element_name);

	var ont_term;
	try {
        ont_term = JSON.parse(req.responseText);
    } catch (e) {
        if (show_alerts) {
            alert (e + "\n" + req.responseText);
        }
    }
    var ont_id = init_ontterms[element_id].getAttribute("term");
    var newHeader = ont_term[ont_id]['term'] + ' - ' + ont_term[ont_id]['name'];
    if (ont_id.match('GO')) {
        newHeader = '<a href="http://www.ebi.ac.uk/ego/GTerm?id=' + ont_term[ont_id]['term'] + '">' + ont_term[ont_id]['term'] + '</a> - ' + ont_term[ont_id]['name'] + ' (' + ont_term[ont_id]['namespace'] + ')';

        var init_ontterms_def = document.getElementsByName('ont_id_definition');
        init_ontterms_def[element_id].innerHTML = '<p><b>Definition:</b> ' + ont_term[ont_id]['definition'] + '</p>';
    }
	init_ontterms[element_id].innerHTML = newHeader;

	if ( init_ontterms.length > element_id+1 ) {
	    element_id += 1;
        sendRequest('/ontterm/'+init_ontterms[element_id].getAttribute("term")+'/term.json', handleOntNameRequest, element_id, element_name );
    }
}

function sendRequest(url,callback,element_id,element_name,postData) {
	var req = createXMLHTTPObject();
	if (!req) return;
	var method = "GET";
	req.open(method,url,true);
	req.setRequestHeader('User-Agent','XMLHTTP/1.0');
	/*if (postData)
		req.setRequestHeader('Content-type','application/x-www-form-urlencoded');*/
	req.onreadystatechange = function () {
		if (req.readyState != 4) return;
		if (req.status != 200 && req.status != 304) {
			//alert('HTTP error ' + req.status);
            callback(req, element_id, element_name);
			return;
		}
		callback(req, element_id, element_name);
	}
	if (req.readyState == 4) return;
	req.send(postData);
}


var XMLHttpFactories = [
	function () {return new XMLHttpRequest()},
	function () {return new ActiveXObject("Msxml2.XMLHTTP")},
	function () {return new ActiveXObject("Msxml3.XMLHTTP")},
	function () {return new ActiveXObject("Microsoft.XMLHTTP")}
];

function createXMLHTTPObject() {
	var xmlhttp = false;
	for (var i=0;i<XMLHttpFactories.length;i++) {
		try {
			xmlhttp = XMLHttpFactories[i]();
		}
		catch (e) {
			continue;
		}
		break;
	}
	return xmlhttp;
}


Drupal.behaviors.biomart = function (context) {
  $('edit-filters:not(.categoryLink-processed)', context).click(function () {
    // This function will get exceuted after the ajax request is completed successfully
    var updateCount = function(data) {
      /* The data parameter is a JSON object. The “products” property is the
       * list of products items that was returned from the server response to
       * the ajax request.
       */
      $('#biomartCount').html(data.count);
    }
    $.ajax({
      type: 'POST',
      url: this.href,       // Which url should handle the ajax request.
                            // This is the url defined in the <a> html tag
      success: updateCount, // The js function that will be called upon success request
      dataType: 'json',     // define the type of data that is going to get back from the server
      data: 'js=1'          // Pass a key/value pair
    });
    return false;           // return false so the navigation stops here and not
                            // continue to the page in the link
}).addClass('categoryLink-processed');
}

function lookup(inputString) {
	if(inputString.length == 0) {
		// Hide the suggestion box.
		$('#suggestions').hide();
	} else {
		$.ajax({
		    type: 'POST',
		    url:  Drupal.settings.basePath + '/query/autocomplete',
		    dataType: 'json',
		    success: go_autocomplete,
		    data: 'js=1&go_post_data=' + inputString
		});
	}
} // lookup

function checkUncheckAll(theElement){
  var theForm = theElement.form, z = 0;
    for(z=0; z<theForm.length;z++){
      if(theForm[z].type == 'checkbox' && theForm[z].name != 'checkall'){
        theForm[z].checked = theElement.checked;
    }
  }
}

function go_autocomplete(data) {
  if (show_alerts) {
    alert(data.msg);
  }
}

function fill(thisValue) {
	$('#inputString').val(thisValue);
	setTimeout("$('#suggestions').hide();", 200);
}



$( document ).ready(function() {
/*
  $('#columns_selector').find("input:checkbox").each(function(){
    var column = "."+$(this).attr("name");
    console.log(sessionStorage[$(this).attr("name")]);
    if (sessionStorage[$(this).attr("name")] == "true") {
      $(this).attr('checked', true);
      $(column).show();
      console.log(sessionStorage);
      console.log($(this).attr("name"));
      console.log('checked on local');
    } else {
      $(this).attr('checked' , false);
      $(column).hide();
      console.log(sessionStorage);
      console.log($(this).attr("name"));
      console.log('not checked on local');
    }
  });
  $('#columns_selector').find("input:checkbox").click(function(){
    var column = "."+$(this).attr("name");
    if ( $(this).is(':checked') ) { 
      $(column).show();
      sessionStorage[$(this).attr("name")] = "true";
    } else {
      $(column).hide();
      sessionStorage[$(this).attr("name")] = "false";
      console.log('unchecked');
    }
    //localStorage[$this.attr("name")] = $this.is(':checked');
    console.log(localStorage);
  });
*/
  $('[name="add"]').title = "Add filter";
  console.log('PHIBASE class');
  console.log($("span.phibase"));
  $("span.phibase").attr("title", 'Organism with PHI-base annotation');
  var target = document.getElementById('results-page');
  /*
  var spinner = new Spinner().spin();
  target.appendChild(spinner.el);
  */
  
  var table = $('#results-table').dataTable({
    "dom": '<"clear">',
    "aoColumnDefs": [
      { "bVisible": false, "aTargets": [ 8 ] },
      { "bVisible": false, "aTargets": [ 9 ] },
      { "bVisible": false, "aTargets": [ 10 ] },
      { "bVisible": false, "aTargets": [ 11 ] },
      { "bVisible": false, "aTargets": [ 12 ] },
      { "bVisible": false, "aTargets": [ 13 ] },
      { "bVisible": false, "aTargets": [ 14 ] },
      { "bVisible": false, "aTargets": [ 15 ] },
      { "bVisible": false, "aTargets": [ 16 ] },
      { "bVisible": false, "aTargets": [ 17 ] },
      { "bVisible": false, "aTargets": [ 18 ] },
      { "bVisible": false, "aTargets": [ 19 ] },
    ],
   "bStateSave": true,
   "deferRender": true,
   "bFilter": false,
   "bSort" : false,
  });
  var colvis = new $.fn.dataTable.ColVis( table );
  $( colvis.button() ).insertAfter('#downloadlinks');
  console.log(colvis);
  $('.fasta-link').click( function() {
    var target = document.getElementById('results-page');
    var spinner = new Spinner().spin();
    target.appendChild(spinner.el);
  });
  $( "input[type=submit]" ).css("color","green");
  $('#results-table').show();
});

