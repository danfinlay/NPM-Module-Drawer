// var request = require('browser-request')
var normalize = require('npm-normalize')
// var readmeGetter = require('readme-getter-browser')

var metaDrawer = {
  selectedModule: null,
  detailSelected: 'readme',
  cdnLink: '/',
  sandbox: null
};

var readmeCache = {};

module.exports = function(options){

  metaDrawer.sandbox = options.sandbox;
  var moduleLinkSelector = options.moduleLinkSelector || '.moduleLink';
  var moduleButtons = $('.moduleLink');

  moduleButtons.live('click', function(e){

    var clickedModule = $(this).attr('module');
    console.log("Clicked "+clickedModule)
    e.preventDefault()

    if(metaDrawer.selectedModule === clickedModule){
      metaDrawer.selectedModule = null;
      updateDrawer();
    }else{
      metaDrawer.selectedModule = clickedModule
      updateDrawer();
    }  
  });
}

function updateDrawer(){

  //Hide drawer on second click of a module:
  if(!metaDrawer.selectedModule) {
    console.log("No module selected, hiding");
    $('#packageInfo').hide(300);



  }else{
    //Insert drawer if it doesn't exist:
    if(!$('#packageInfo')){
      var template = 
        '<div id="packageInfo">'+
          '<div class="btn-group">'+
            '<button type="button" class="btn btn-default active" id="currentPackageReadme">Readme</button>'+
            '<button type="button" class="btn btn-default" id="currentPackageMethods">Methods</button>'+
            '<button type="button" class="btn btn-default" id="currentPackageLink"><a href="">npm</a></button>'+
            '<button type="button" class="btn btn-default" id="currentPackageGithubLink"><a href="">Github</a></button>'+
          '</div>'+
          '<div id="packageDetailView" style="padding-top:10px"></div>'
        '</div>';
      link.parent().parent().after(template)
    }

    //Customize the displayed links:
    var npmLink = 'http://www.npmjs.org/'+metaDrawer.selectedModule;   
    $('#packageInfo #currentPackageLink a').attr('href', npmLink)

    $('#packageInfo').show(300);

    var detailView = $('#packageDetailView');
    detailView.show(300);

    //Attempt to retrieve locally cached readme:
    var cachedReadme = readmeCache[metaDrawer.selectedModule];
    if(cachedReadme){
      detailView.html(cachedReadme);
    }else{
      //Display Loading Icon:
      detailView.html('<center><img src="cube.gif"><div>LOADING...</div></center>');
      detailView.show(300);

      //Load module via AJAX:
      console.log("Requesting module..");
      
      fetchBundle(metaDrawer.selectedModule, null, function(er, readme){
        if(!er){
          console.log("Requesting module success.");
          $('#packageDetailView').html(readme);
        }else{
          console.log("Error returned from sandbox: "+er);
        }
      });

      // $.ajax({
      //   url:moduleLink
      // }).done(function(readme){

      //   console.log("Requesting module success.");
      //   detailView.html(readme);

      // }).fail(function(er){

      //   console.log("Requesting module failure");
      //   detailView.html("<div class='alert alert-error'>There was a problem loading this readme.</div>");

      // });
    }
  }
}

function fetchBundle(bundleName, preferredVersions, cb){

  if(metaDrawer.sandbox){
    var sandbox = metaDrawer.sandbox;
    sandbox.on('modules', function(packages){

      //Find the requested package:
      for(var pack = 0, len = packages.length; pack < len; pack++){
        if(packages[pack]["name"] === bundleName){
          cb(null, JSON.stringify(packages[pack]));
          //detailView.html(JSON.stringify(packages[pack], null, '\t'));
          break;
        }
      }
    })

    sandbox.on('bundleEnd', function(html){

      if(sandbox.cache){
        console.log("Requesting sandbox cache bundle");
       // sandbox.cache.get(bundleName, cb);
      }else{
        console.log("uhhh... sandbox cache get is not truthy?")
      }

    })

    console.log("Requesting :"+bundleName);
    var er = sandbox.bundle(editor.editor.getValue())
    if(er){
      console.log("Sandbox error: "+er)
    }
  }
}