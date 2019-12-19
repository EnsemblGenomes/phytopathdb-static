$( document ).ready(function() {
  $("#edit-species-tree-wrapper").html( '<div id="genome-selector" class="selector"><div class="selector_tree"><div class="finder">Find <input type="text" class="ui-autocomplete-input inactive" title="Start typing the name of a species or collection..." value="Start typing the name of a species or collection..." /></div><div class="vscroll_container"></div></div><div class="selector_list"><h5>Selected genomes</h5><div class="vscroll_container"><ul></ul></div></div></div>');
  TreeSelector.init('#genome-selector', '/sites/phytopathdb.org/modules/custom/biomart/microme/custom_taxon_tree_data_79.js');
  $('[name=add]').attr('title', "Add filter");
  $('[name=remove]').attr('title', "Remove filter");
  $( ":button" ).click(function( event ) {
     $('[name=add]').attr('title', "Add filter");
    $('[name=remove]').attr('title', "Remove filter");
    alert( "Handler for .submit() called." );
    event.preventDefault();
  });
  //$("textarea").uniform();
  //$("#biomart-filter-wrapper :input").uniform();
  //$( "#biomart-filter-wrapper select").uniform();
});

$(document).ajaxComplete(function() {
  //$( "select").uniform();
  //$(":input").uniform();
  //$("textarea").uniform();
});


