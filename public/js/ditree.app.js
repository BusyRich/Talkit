var graph = new joint.dia.Graph(),
  addNodePopup = $('#popupMenu');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

var selectedNode,
  nodePadding = { x: 50, y: 100 };

function showAddMenu(evt) {
  var elm = $(evt.currentTarget),
      elmHeight = elm.height();

  addNodePopup
    .removeClass('large')
    .css({
      width: elm.width(),
      height: elmHeight,
      lineHeight: elmHeight + 'px'
    })
    .css(elm.offset())
    .slideDown(200);

  evt.preventDefault();
}

function add(type, source) {
  addNodePopup.slideUp(100);

  var node, options = {
    position: {
      x: 0,
      y: 20
    }
  };

  if(selectedNode) {
    options.position.y = selectedNode.attributes.position.y +
      selectedNode.attributes.size.height + nodePadding.y;

    var links = graph.getConnectedLinks(selectedNode, { outbound: true }),
      farX = -1;

    if (links && links.length > 0) {
      var tmpLink;

      links.forEach(function(link) {
        tmpLink = graph.attributes.cells._byId[link.attributes.target.id];

        if (farX < tmpLink.attributes.position.x) {
          farX = tmpLink.attributes.position.x;
          options.position.x = farX + tmpLink.attributes.size.width +
            nodePadding.x;
        }
      });
    } else {
      options.position.x = selectedNode.attributes.position.x;
    }
  }

  switch (type) {
    case 'text':
      node = new joint.shapes.ditree.Text(options);
      break;
    case 'skill':
      node = new joint.shapes.ditree.Skill(options);
      break;
    case 'variable':
      node = new joint.shapes.ditree.Variable(options);
      break;
    case 'choice':
      node = new joint.shapes.ditree.Choice(options);
      break;
  }

  graph.addCells([node]);

  if (graph.attributes.cells.length > 1) {
    new joint.dia.Link({
      source: { 
        id: selectedNode.id, 
        port: selectedNode.get('selectedPort') 
      },
      target: { 
        id: node.id, 
        port: 'in1'
      },
      attrs: {
        '.marker-target': {
          d: 'M 10 0 L 0 5 L 10 10 z'
        }
      }
    }).addTo(graph);
  } else if (graph.attributes.cells.length == 1) {
    node.removePort('input');
  }

  lastNode = node;
}

$('#popupMenu a').click(function(evt) {
  add($(this).data('type'));

  $('#startText').hide();
  evt.preventDefault();
});

var paper = new joint.dia.Paper({
  el: $('#paper'),
  width: 16000,
  height: 8000,
  gridSize: 25,
  model: graph,
  defaultRouter: {
    name: 'manhattan',
    args: {
      step: 25,
      startDirections: ['bottom'],
      endDirections: ['top']
    }
  },
  interactive: false
});

// Paper Panning
var panning = false;
var mousePosition = { x: 0, y: 0 };
paper.on('blank:pointerdown', function(e, x, y) {
  panning = true;
  mousePosition.x = e.pageX;
  mousePosition.y = e.pageY;
  $('body').css('cursor', 'move');
});

$('#container').mousemove(function(e) {
  if (panning) {
    var $this = $(this);
    $this.scrollLeft($this.scrollLeft() + mousePosition.x - e.pageX);
    $this.scrollTop($this.scrollTop() + mousePosition.y - e.pageY);
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
  }
});

$('#container').mouseup(function(e) {
  panning = false;
  $('body').css('cursor', 'default');
});

function cancelEvent(evt) {
  evt.stopPropagation();
  evt.preventDefault();
}

$(window).resize(function() {
  var $window = $(window);
  var $container = $('#container');
  $container.height($window.innerHeight());
  $container.width($window.innerWidth());
  return this;
});

$(window).trigger('resize');