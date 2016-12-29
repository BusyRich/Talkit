// DiTree shape namespace must be placed inside JointJS' namespace.
joint.shapes.ditree = {};

// Base HTML template used for nodes.
joint.shapes.ditree.BaseMarkup = $('#baseTpl');

// A Base View extended from the Element View and Ports Interface.
joint.shapes.devs.DitreeBaseView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);

// Model for text nodes.
joint.shapes.ditree.Text = joint.shapes.devs.Model.extend({
  defaults: joint.util.deepSupplement({
      type: 'ditree.Text',
      size: {
        width: 320,
        height: 305
      },
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
                dy: 0
              }
            }
          }
        }
      },
      selectedPort: 'out1'
    },
    joint.shapes.devs.Model.prototype.defaults
  )
});

// View for text nodes.
joint.shapes.ditree.TextView = joint.shapes.devs.DitreeBaseView.extend({
  template: 'textTpl',
  icon: 'comment',
  title: 'Dialog',
  color: '#80CCFF',
  _super: joint.shapes.devs.DitreeBaseView.prototype,
  initialize: function() {
    _.bindAll(this, 'update');
    this._super.initialize.apply(this, arguments);

    // Create the node HTML element from the base template and the one provided.
    this.$box = $(_.template(joint.shapes.ditree.BaseMarkup.html())({
      type: this.model.get('type').replace('.','-').toLowerCase(),
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
      .mousedown(_.bind(this.dragOn, this))
      .on('mouseup mouseout', _.bind(this.dragOff, this))
      .mousemove(_.bind(this.drag, this));

    // Bind the data fields to update the underlying model when changed.
    this.dataFields = this.$box.find('.data');
    this.dataFields.on('change', _.bind(this.updateData, this));

    // Bind any "add node" buttons to showing the add new node menu.
    this.$box.find('.add-node').click(_.bind(this.showMenu, this));

    // Bind the close button to remove this node.
    this.$box.find('.close').click(_.bind(this.close, this));

    // Update the view whenever the underlying model changes.
    this.model.on('change', this.update, this);

    this.update();
  },

  // Sets up and shows the "Add New Node" menu.
  showMenu: function(evt) {
    selectedNode = this.model;
    this.model.set('selectedPort', $(evt.currentTarget).data('port'));
    showAddMenu(evt);
  },

  dragOn: function(evt) {
    this.$box.addClass('noselect');
    this._dragging = true;
    this._dragHandleOffset = evt.pageX - this._dragHandle.offset().left;
  },

  dragOff: function() {
    this._dragging = false;
    this.$box.removeClass('noselect');
  },

  drag: function(evt) {
    if (this._dragging) {
      var position = this.model.position();
      this.model.position(evt.pageX - this._dragHandleOffset, position.y);
    }
  },

  render: function() {
    this._super.render.apply(this, arguments);
    this.paper.$el.prepend(this.$box);
    this.update();
    return this;
  },

  // Takes the values from the data fields and sets matching data on the model.
  updateData: function() {
    var tmpField;
    for(var f = 0; f < this.dataFields.length; f++) {
      tmpField = $(this.dataFields[f]);
      this.model.set(tmpField.data('name'), tmpField.val());
    }
  },

  update: function() {
    this._super.update.apply(this, arguments);
    
    // Set the position and dimension of the box so that it covers the JointJS element.
    var bbox = this.model.getBBox();

    this.$box.css({
      width: bbox.width,
      height: bbox.height,
      left: bbox.x,
      top: bbox.y,
      transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
    });

    this.updateData();
  },

  close: function(evt) {
    this.model.remove();
    this.$box.remove();
    evt.preventDefault();
  }
});

joint.shapes.ditree.Skill = joint.shapes.devs.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ditree.Skill',
    size: {
      width: 300,
      height: 180
    },
    outPorts: ['out1','out2']
  }, joint.shapes.ditree.Text.prototype.defaults)
});

joint.shapes.ditree.SkillView = joint.shapes.ditree.TextView.extend({
  template: 'skillTpl',
  icon: 'check-square-o',
  title: 'Skill Check',
  color: '#CCC'
});

joint.shapes.ditree.Variable = joint.shapes.devs.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ditree.Variable',
    size: {
      width: 300,
      height: 400
    }
  }, joint.shapes.ditree.Text.prototype.defaults)
});

joint.shapes.ditree.VariableView = joint.shapes.ditree.TextView.extend({
  template: 'variableTpl',
  icon: 'file-code-o',
  title: 'Variable',
  color: '#D4CB6A',
  initialize: function() {
    joint.shapes.ditree.TextView.prototype.initialize.apply(this, arguments);

    this.typeLinks = this.$box.find('.variable-update-type a');
    this.typeLinks.click(_.bind(this.changeType, this));
  },

  changeType: function(evt) {
    this.typeLinks.removeClass('selected');

    var tmpLink = $(evt.currentTarget).addClass('selected');
    this.model.set('updateType', tmpLink.data('type'));
    evt.preventDefault();
  }
});

joint.shapes.ditree.Choice = joint.shapes.devs.Model.extend({
  defaults: joint.util.deepSupplement({
    type: 'ditree.Choice',
    size: {
      width: 300,
      height: 400
    },
    choices: 0,
  }, joint.shapes.ditree.Text.prototype.defaults)
});

joint.shapes.ditree.ChoiceView = joint.shapes.ditree.TextView.extend({
  template: 'choiceTpl',
  icon: 'list',
  title: 'Choice',
  color: '#55AA55',
  initialize: function() {
    joint.shapes.ditree.TextView.prototype.initialize.apply(this, arguments);

    // Remove the default outgoing port. It will be readded when we 
    // add the first choice.
    this.model.removePort('out1');

    this.choiceTpl = _.template($('#choiceItemTpl').html());
    this.choicesCon = this.$box.find('.choices');

    this.$box.find('.add-choice').click(_.bind(this.addChoice, this));
    this.$box.find('.remove-choice').click(_.bind(this.removeChoice, this));

    this.addChoice();

    this.widthIncrease = this.model.defaults.size.width - 16;
  },

  addChoice: function(evt) {
    var idx = ++this.model.attributes.choices;
    this.choicesCon.append(this.choiceTpl({
      index: idx,
      letter: String.fromCharCode(64 + idx)
    }));

    this.$box.find('.choice' + idx + ' .add-node')
      .click(_.bind(this.showMenu, this));

    this.model.addPort({
      id: 'out' + idx,
      group: 'out'
    });

    if(idx > 1) {
      this.model.resize(
        this.model.attributes.size.width + this.widthIncrease,
        this.model.attributes.size.height
      );
    }
    
    if(evt) {
      evt.preventDefault();
    }
  },

  removeChoice: function(evt) {
    var idx = this.model.attributes.choices;

    if(idx > 0) {
      this.$box.find('.choice' + idx).remove();
      this.model.removePort('out' + idx);

      if(idx > 1) {
        this.model.resize(
          this.model.attributes.size.width - this.widthIncrease,
          this.model.attributes.size.height
        );
      }

      this.model.attributes.choices--;
    }
    
    evt.preventDefault();
  }
});


