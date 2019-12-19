TreeSelector = {
    init: function (el, dataUrl) {

      this.el = $(el);
      this.dataUrl = dataUrl;
      this.defaultKeys = '';      
      
      var panel = this;  
      panel.elLk = {};
      panel.elLk.tree   = $('.selector_tree .vscroll_container', panel.el);
      panel.elLk.list   = $('.selector_list .vscroll_container', panel.el);
      panel.elLk.finder = $('.finder input', panel.el);
      

      // override the default modal close handler
      //$('.modal_close').unbind().bind('click', function () { return panel.modalClose() });    
         
      // FETCH TAXON DATA
      // This uses a $.getScript() instead of $.getJSON() because Firefox 3.x on KDE/Linux 
      // chokes when parsing the deeply nested JSON structure, giving the error: 
      // "InternalError: script stack space quota is exhausted".
      $(document).ajaxError(function(e, request, settings, exception){ alert(exception) });

      $.getScript(panel.dataUrl + '?' + Math.random(), function() {
      //$(function() {
        // TREE
       
        panel.elLk.tree.dynatree({
          initAjax: {url: panel.dataUrl},
          children: taxonTreeData,
          checkbox: true,
          icon: false,
          selectMode: 3,
          //activeVisible: true,
          onSelect: function() { panel.setSelection() },
          onDblClick: function(node, event) { node.toggleSelect() },
          onKeydown: function(node, event) {
            if( event.which == 32 ) {
              node.toggleSelect();
              return false;
            }
          },
          onRender: function(node, nodeSpan) {
            $("#biomart-species-list").find('input[type=checkbox]:checked').each(function() {
               var key = $(this).val().replace(" ", "_");
               if ( node.data.key == key ) {
                  node.data.addClass = "phibase";
                  node.data.tooltip = "Species with PHI-base annotations";
                  $(nodeSpan).attr('title', node.data.tooltip);
               }
            });    
          },
        }); 
        
        // set selected nodes 
            
        var treeObj = panel.elLk.tree.dynatree("getTree");
        
        /*
          $.each(panel.defaultKeys, function(index, key) { 
          var node = treeObj.getNodeByKey(key);
          node.select();                            // tick it
          node.activate();                          // force parent path to be expanded
          node.deactivate();                        // unhighlight it
          if (index == 0) node.li.scrollIntoView(); // bring first node into view 
        });
        */

        $("#biomart-species-list").find('input[type=checkbox]:checked').each(function() {
          //console.log($(this).val());
            var key = $(this).val().replace(" ", "_");
            var node = treeObj.getNodeByKey(key);
            if (node) {
              node.select();
              node.makeVisible();
            }
          //console.log("biomart-species-list val:");
          //loga = $(this).val();
          //console.log(loga);
        });

        $("#phibase-species-list").find('input[type=checkbox]').each(function() {
            var key = $(this).val().replace(" ", "_");
            var node = treeObj.getNodeByKey(key);
            if (node) {
              node.data.addClass = "phibase";
              node.data.tooltip = "Species with PHI-base annotations";
            }
            //$(".dynatree-container a:contains('" + key + "')").addClass("phibase");
        });

        // AUTOCOMPLETE
        // get autocomplete data from tree
        var acTitles = [];
        var acKeys = [];
        panel.elLk.tree.dynatree("getRoot").visit(function(node){
          acTitles.push(node.data.title);
          acKeys[node.data.title] = node.data.key;
        });
        
        var finder = panel.elLk.finder;
        //console.log(finder);        
        finder.autocomplete({
          minLength: 3,
          source: function(request, response) { response(panel.filterArray(acTitles, request.term)) }, 
          select: function(event, ui) { panel.locateNode(acKeys[ui.item.value]) },
          open: function(event, ui) { $('.ui-menu').css('z-index', 999999999 + 1) } // force menu above modal
        }).focus(function(){ 
          // add placeholder text
          if($(this).val() == $(this).attr('title')) {
            finder.val('');
            finder.removeClass('inactive');
          } else if($(this).val() != '')  {
            finder.autocomplete('search');
          }
        }).blur(function(){
          // remove placeholder text
          finder.removeClass('invalid');
          finder.addClass('inactive');
          finder.val($(this).attr('title'));
        }).keyup(function(){
          // highlight invalid search strings
          if (finder.val().length >= 3) {
            var matches = panel.filterArray(acTitles, finder.val());
            if (matches && matches.length) {
              finder.removeClass('invalid');
            } else {
              finder.addClass('invalid');
            }
          } else {
           finder.removeClass('invalid');
          }
        }).data("autocomplete")._renderItem = function (ul, item) {
          // highlight the term within each match
          var regex = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi");
          item.label = item.label.replace(regex, "<strong>$1</strong>");
          return $("<li></li>").data("item.autocomplete", item).append("<a>" + item.label + "</a>").appendTo(ul);
        };
      });  
  
      panel.resize();  
    },
    
    resize: function () {
      var newHeight = $(this.el).parent().height() - this.elLk.tree.position().top;
      this.elLk.tree.height(newHeight - 27);
      this.elLk.list.height(newHeight + 10); 
    },
    
    getSelectedItems: function() {
      var selectedNodes = this.elLk.tree.dynatree("getTree").getSelectedNodes()
      var items = $.map(selectedNodes, function(node){
        return node.data.isFolder ? null : {key: node.data.key, title: node.data.title};
      });
      items.sort(function (a, b) {return a.title.toLowerCase() > b.title.toLowerCase()});
      return items;
    },
    
    setSelection: function() {
      var panel = this;
      var items = panel.getSelectedItems();
      //console.log(items[0].key);     
      $('li', panel.elLk.list).remove();
      $("#biomart-species-list").find('input[type=checkbox]:checked').removeAttr('checked');
      $.each(items, function(index, item){
          species_name = item.key;
          species_name_dash = species_name.replace("_","-").toLowerCase();
          //console.log(species_name_dash);
          ident = 'edit-species-names-' + species_name_dash;
          element = document.getElementById(ident);
          //console.log(ident);
          //console.log(element);
          $(element).attr('checked',true);
          var li = $('<li><span>' + item.title + '</span><span class="remove"></span></li>').appendTo(panel.elLk.list);
          $('.remove', li).click(function(){panel.removeListItem($(this).parent())});
      });
/*
      $("#biomart-species-list .form-checkboxes .form-item .option :checkbox").each(function () {
          console.log(this);
          $(this).attr('checked',true); 
      });
*/
    },
    
    locateNode: function(key) {
      var node = this.elLk.tree.dynatree("getTree").getNodeByKey(key);
      if (node) { 
        node.activate();
        node.li.scrollIntoView();
        node.select();
      }
    },
    
    removeListItem: function(li) {
      var panel = this;
      var title = li.text();
      var selectedNodes = panel.elLk.tree.dynatree("getTree").getSelectedNodes();
      
      $.each(selectedNodes, function(index, node) {
        if (node.data.title == title) {
          node.toggleSelect();
          $(li).remove();
          return;
        }
      });
    },
        
    filterArray: function(array, term) {
      term = term.toUpperCase();
      var matches = $.grep( array, function(value) { return value.toUpperCase().indexOf(term) > -1 });
      matches.sort(function(a, b) {
        // give priority to matches that begin with the term
        var aBegins = a.toUpperCase().substr(0, term.length) == term;
        var bBegins = b.toUpperCase().substr(0, term.length) == term;
        if (aBegins == bBegins) {
          if (a == b) return 0;
          return a < b ? -1 : 1;
        }
        return aBegins ? -1 : 1;
      });
      return matches;   
    }
  };
