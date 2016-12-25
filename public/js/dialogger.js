function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

function onError(e) {
  console.log('Error', e);
}

var graph = new joint.dia.Graph(),
    addNodePopup = $('#popupMenu');

//#endregion
joint.shapes.dialogue = {};

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
var baseTpl = $('#baseTpl');
function getTemplate(elmId) {
  return baseTpl.clone().html().replace('%CONTENT%', $('#' + elmId).html());
}

//#region BaseView
function dragOn(evt) {
  this._dragging = true;
  this._dragHandleOffset = evt.pageX - this._dragHandle.offset().left;
}

function dragOff() {
  this._dragging = false;
}

function drag(evt) {
  if(this._dragging) {
    var position = this.model.position();

    this.model.position(evt.pageX - this._dragHandleOffset, position.y);
    //console.log(this.model.position());
  }
}

var selectedNode,
    nodePadding = {x: 50, y: 100};
function showAddMenu(evt) {
  var elm = $(this);
  addNodePopup.css(elm.parent().offset()).slideDown(200);
  selectedNode = graph.attributes.cells._byId[elm.parents('.node').attr('id')];
  evt.preventDefault();
}

function add(type, source) {
  var node, options = {
    position: {
      x: 0,
      y: 20
    }
  };

  if(selectedNode) {
    options.position.y = selectedNode.attributes.position.y +
      selectedNode.attributes.size.height + nodePadding.y;

    var links = graph.getConnectedLinks(selectedNode, {outbound:true}),
        farX = -1;

    if(links && links.length > 0) {
      var tmpLink;

      links.forEach(function(link) {
        tmpLink = graph.attributes.cells._byId[link.attributes.target.id];

        if(farX < tmpLink.attributes.position.x) {
          farX = tmpLink.attributes.position.x;
          options.position.x = farX + tmpLink.attributes.size.width +
            nodePadding.x;
        }
      });
    } else {
      options.position.x = selectedNode.attributes.position.x;
    }
  }

  switch(type) {
    case 'text':
      node = new joint.shapes.dialogue.Text(options);
  }

  graph.addCells([node]);

  if(graph.attributes.cells.length > 1) {
    new joint.dia.Link({
        source: { id: selectedNode.id, port: 'output' },
        target: { id: node.id, port: 'input'},
        attrs: {
          '.marker-target': {d: 'M 20 0 L 0 10 L 20 20 z'}
        }
    }).addTo(graph);
  } else if(graph.attributes.cells.length == 1) {
    node.removePort('input');
  }

  lastNode = node;

  addNodePopup.slideUp(100);
}

$('#popupMenu a').click(function(evt) {
  add('text');
  evt.preventDefault();
});

joint.shapes.dialogue.Base = joint.shapes.devs.Model.extend({
	defaults: joint.util.deepSupplement({
		type: 'dialogue.Base',
		size: {
      width: 250,
      height: 250
    },
		name: '',
    inPorts: ['in1'],
    outPorts: ['out1'],
    ports: {
      groups: {
        'in': {
          position: {
            name: 'top',
            args: {
              dy: 12
            }
          }
        },
        'out': {
          position: {
            name: 'bottom',
            args: {
              dy: -12
            }
          }
        }
      }
    }
	},
	joint.shapes.devs.Model.prototype.defaults
)});

joint.shapes.devs.ModelView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);

joint.shapes.dialogue.BaseView = joint.shapes.devs.ModelView.extend({
	template: 'textTpl',
  icon: 'comment',
  title: 'Dialog',
  color: '#80CCFF',
	initialize: function()
	{
		_.bindAll(this, 'updateBox');
		joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);

		this.$box = $(_.template(baseTpl.html())({
      id: this.model.id,
      icon: this.icon,
      color: this.color,
      title: this.title,
      content: $('#' + this.template).html()
    }));

    // Dragging Logic
    this._dragging = false;
    this._dragHandle = this.$box.find('.header');
    this._dragHandleOffset = 0;
    this._dragHandle
      .mousedown(_.bind(dragOn, this))
      .on('mouseup mouseout', _.bind(dragOff, this))
      .mousemove(_.bind(drag, this));

		// This is an example of reacting on the input change and storing the input data in the cell model.
		this.$box.find('input.name').on('change', _.bind(function(evt) {
			this.model.set('name', $(evt.target).val());
		}, this));

	    // This is an example of reacting on the input change and storing the input data in the cell model.
		this.$box.find('input.actor').on('change', _.bind(function (evt) {
		    this.model.set('actor', $(evt.target).val());
		}, this));

    this.$box.find('.footer .add-node-single').click(showAddMenu);


	    // This is an example of reacting on the input change and storing the input data in the cell model. TEXTAREA
		this.$box.find('textarea.name').on('change', _.bind(function (evt) {
		    this.model.set('name', $(evt.target).val());
		}, this));

		this.$box.find('.close').on('click', _.bind(function(evt) {
        this.remove();
        evt.preventDefault();
      }, this.model));

		// Update the box position whenever the underlying model changes.
		this.model.on('change', this.updateBox, this);
		// Remove the box when the model gets removed from the graph.
		this.model.on('remove', this.removeBox, this);

		this.updateBox();
	},

	render: function()
	{
		joint.shapes.devs.ModelView.prototype.render.apply(this, arguments);
		this.paper.$el.prepend(this.$box);
		this.updateBox();
		return this;
	},

	updateBox: function()
	{
		// Set the position and dimension of the box so that it covers the JointJS element.
	    var bbox = this.model.getBBox();

		// Example of updating the HTML with a data stored in the cell model.
		var nameField = this.$box.find('input.name');
		if (!nameField.is(':focus'))
		    nameField.val(this.model.get('name'));

	    // Example of updating the HTML with a data stored in the cell model.
		var actorField = this.$box.find('input.actor');
		if (!actorField.is(':focus'))
		    actorField.val(this.model.get('actor'));

	    // Example of updating the HTML with a data stored in the cell model.
		var textAreaField = this.$box.find('textarea.name');
		if (!textAreaField.is(':focus'))
		    textAreaField.val(this.model.get('name'));



		var label = this.$box.find('.label');
		var type = this.model.get('type').slice('dialogue.'.length);
		label.text(type);
		label.attr('class', 'label ' + type);
	    //this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
		this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
	},

	removeBox: function(evt)
	{
		this.$box.remove();
	},
});

//#endregion

//#region ChoiceView
joint.shapes.dialogue.ChoiceView = joint.shapes.dialogue.BaseView.extend(
{
    template: getTemplate('choiceTpl'),
    initialize: function () {


        _.bindAll(this, 'updateBox');
        joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('textarea').on('mousedown click', function (evt) { evt.stopPropagation(); });
        this.$box.find('input').on('mousedown click', function (evt) { evt.stopPropagation(); });
        this.$box.find('idd').on('mousedown click', function (evt) { evt.stopPropagation(); });

        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('textarea.name').on('change', _.bind(function (evt) {
            this.model.set('name', $(evt.target).val());
        }, this));

        // This is an example of reacting on the input change and storing the input data in the cell model.
        this.$box.find('input.title').on('change', _.bind(function (evt) {
            this.model.set('title', $(evt.target).val());
        }, this));

        this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();
    },

    render: function () {
        joint.shapes.devs.ModelView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        this.updateBox();
        return this;
    },

    updateBox: function () {
        // Set the position and dimension of the box so that it covers the JointJS element.
        var bbox = this.model.getBBox();
        // Example of updating the HTML with a data stored in the cell model.
        var nameField = this.$box.find('textarea.name');
        if (!nameField.is(':focus'))
            nameField.val(this.model.get('name'));

        // Example of updating the HTML with a data stored in the cell model.
        var nameField = this.$box.find('input.title');
        if (!nameField.is(':focus'))
            nameField.val(this.model.get('title'));


        var label = this.$box.find('.label');
        var type = this.model.get('type').slice('dialogue.'.length);
        label.text(type);
        label.attr('class', 'label ' + type);


        this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
    },

    removeBox: function (evt) {
        this.$box.remove();
    },
});

//#endregion

//#region Dialoge.Node
joint.shapes.dialogue.Node = joint.shapes.devs.Model.extend(
{
	defaults: joint.util.deepSupplement
	(
		{
			type: 'dialogue.Node',
			inPorts: ['input'],
			outPorts: ['output'],
			attrs:
			{
				'.outPorts circle': { unlimitedConnections: ['dialogue.Choice'], }
			},
		},
		joint.shapes.dialogue.Base.prototype.defaults
	),
});

joint.shapes.dialogue.NodeView = joint.shapes.dialogue.BaseView;

//#endregion

//#region dialogue.TEXT
joint.shapes.dialogue.Text = joint.shapes.devs.Model.extend(
{
	defaults: joint.util.deepSupplement
	(
		{
			type: 'dialogue.Text',
			inPorts: ['input'],
			outPorts: ['output'],
			actor: '',
			textarea: 'Start writing',
			attrs:
			{
				'.outPorts circle': { unlimitedConnections: ['dialogue.Choice'], }
			},
		},
		joint.shapes.dialogue.Base.prototype.defaults
	),
});

joint.shapes.dialogue.TextView = joint.shapes.dialogue.BaseView;

//#endregion

//#region dialogue.Choice
joint.shapes.dialogue.Choice = joint.shapes.devs.Model.extend(
{
	defaults: joint.util.deepSupplement
	(
		{
		    size: { width: 250, height: 135 },
			type: 'dialogue.Choice',
			inPorts: ['input'],
			outPorts: ['output'],
			title: '',
            name: '',
		},
		joint.shapes.dialogue.Base.prototype.defaults
	),
});

joint.shapes.dialogue.ChoiceView = joint.shapes.dialogue.ChoiceView;

//#endregion

//#region dialogue.Branch
joint.shapes.dialogue.Branch = joint.shapes.devs.Model.extend(
{
	defaults: joint.util.deepSupplement
	(
		{
			type: 'dialogue.Branch',
			size: { width: 200, height: 100, },
			inPorts: ['input'],
			outPorts: ['output0'],
			values: [],
		},
		joint.shapes.dialogue.Base.prototype.defaults
	),
});

joint.shapes.dialogue.BranchView = joint.shapes.dialogue.BaseView.extend(
{
	template: getTemplate('branchTpl'),

	initialize: function()
	{
		joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
		this.$box.find('.add').on('click', _.bind(this.addPort, this));
		this.$box.find('.remove').on('click', _.bind(this.removePort, this));
	},

	removePort: function()
	{
		if (this.model.get('outPorts').length > 1)
		{
			var outPorts = this.model.get('outPorts').slice(0);
			outPorts.pop();
			this.model.set('outPorts', outPorts);
			var values = this.model.get('values').slice(0);
			values.pop();
			this.model.set('values', values);
			this.updateSize();
		}
	},

	addPort: function()
	{
		var outPorts = this.model.get('outPorts').slice(0);
		outPorts.push('output' + outPorts.length.toString());
		this.model.set('outPorts', outPorts);
		var values = this.model.get('values').slice(0);
		values.push(null);
		this.model.set('values', values);
		this.updateSize();
	},

	updateBox: function()
	{
		joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);
		var values = this.model.get('values');
		var valueFields = this.$box.find('input.value');

		// Add value fields if necessary
		for (var i = valueFields.length; i < values.length; i++)
		{
			// Prevent paper from handling pointerdown.
			var field = $('<input type="text" class="value" />');
			field.attr('placeholder', 'Value ' + (i + 1).toString());
			field.attr('index', i);
			this.$box.append(field);
			field.on('mousedown click', function(evt) { evt.stopPropagation(); });

			// This is an example of reacting on the input change and storing the input data in the cell model.
			field.on('change', _.bind(function(evt)
			{
				var values = this.model.get('values').slice(0);
				values[$(evt.target).attr('index')] = $(evt.target).val();
				this.model.set('values', values);
			}, this));
		}

		// Remove value fields if necessary
		for (var i = values.length; i < valueFields.length; i++)
			$(valueFields[i]).remove();

		// Update value fields
		valueFields = this.$box.find('input.value');
		for (var i = 0; i < valueFields.length; i++)
		{
			var field = $(valueFields[i]);
			if (!field.is(':focus'))
				field.val(values[i]);
		}
	},

	updateSize: function()
	{
		var textField = this.$box.find('input.name');
		var height = textField.outerHeight(true);
		this.model.set('size', { width: 200, height: 100 + Math.max(0, (this.model.get('outPorts').length - 1) * height) });
	},
});

//#endregion

//#region dialogue.SET
joint.shapes.dialogue.Set = joint.shapes.devs.Model.extend(
{
	defaults: joint.util.deepSupplement
	(
		{
		    type: 'dialogue.Set',
		    inPorts: ['input'],
		    outPorts: ['output'],
		    size: { width: 200, height: 100, },
		    value: '',
		},
		joint.shapes.dialogue.Base.prototype.defaults
	),
});

joint.shapes.dialogue.SetView = joint.shapes.dialogue.BaseView.extend(
{
	template: getTemplate('setTpl'),

	initialize: function()
	{
		joint.shapes.dialogue.BaseView.prototype.initialize.apply(this, arguments);
		this.$box.find('input.value').on('change', _.bind(function(evt)
		{
			this.model.set('value', $(evt.target).val());
		}, this));
	},

	updateBox: function()
	{
		joint.shapes.dialogue.BaseView.prototype.updateBox.apply(this, arguments);
		var field = this.$box.find('input.value');
		if (!field.is(':focus'))
			field.val(this.model.get('value'));
	},
});

//#endregion

function gameData()
{
	var cells = graph.toJSON().cells;
	var nodesByID = {};
	var cellsByID = {};
	var nodes = [];
	for (var i = 0; i < cells.length; i++)
	{
		var cell = cells[i];
		if (cell.type != 'link')
		{
			var node =
			{
				type: cell.type.slice('dialogue.'.length),
				id: cell.id,
				actor: cell.actor,
                title: cell.title,
			};
			if (node.type == 'Branch')
			{
				node.variable = cell.name;
				node.branches = {};
				for (var j = 0; j < cell.values.length; j++)
				{
					var branch = cell.values[j];
					node.branches[branch] = null;
				}
			}
			else if (node.type == 'Set')
			{
				node.variable = cell.name;
				node.value = cell.value;
				node.next = null;

			}

			else if (node.type == 'Choice') {
			    node.name = cell.name;
			    node.title = cell.title;
			    node.next = null;

			}
			else
			{
			    node.actor = cell.actor;
				node.name = cell.name;
				node.next = null;
			}
			nodes.push(node);
			nodesByID[cell.id] = node;
			cellsByID[cell.id] = cell;
		}
	}
	for (var i = 0; i < cells.length; i++)
	{
		var cell = cells[i];
		if (cell.type == 'link')
		{
			var source = nodesByID[cell.source.id];
			var target = cell.target ? nodesByID[cell.target.id] : null;
			if (source)
			{
				if (source.type == 'Branch')
				{
					var portNumber = parseInt(cell.source.port.slice('output'.length));
					var value;
					if (portNumber == 0)
						value = '_default';
					else
					{
						var sourceCell = cellsByID[source.id];
						value = sourceCell.values[portNumber - 1];
					}
					source.branches[value] = target ? target.id : null;
				}
				else if ((source.type == 'Text' || source.type == 'Node') && target && target.type == 'Choice')
				{
					if (!source.choices)
					{
						source.choices = [];
						delete source.next;
					}
					source.choices.push(target.id);
				}
				else
					source.next = target ? target.id : null;
			}
		}
	}
	return nodes;
}

// Browser stuff

var paper = new joint.dia.Paper(
{
	el: $('#paper'),
	width: 16000,
	height: 8000,
	model: graph,
	gridSize: 8,
  defaultRouter: {
    name: 'manhattan',
    args: {
      step: 1
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
	if(panning) {
		var $this = $(this);
		$this.scrollLeft($this.scrollLeft() + mousePosition.x - e.pageX);
		$this.scrollTop($this.scrollTop() + mousePosition.y - e.pageY);
		mousePosition.x = e.pageX;
		mousePosition.y = e.pageY;
	}
});

$('#container').mouseup(function (e) {
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
