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
                dy: -12
              }
            }
          }
        }
      }
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
    _.bindAll(this, 'updateBox');
    this._super.initialize.apply(this, arguments);

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

    // This is an example of reacting on the input change and storing the input data in the cell model.
    this.$box.find('input.name').on('change', _.bind(function(evt) {
      this.model.set('name', $(evt.target).val());
    }, this));

    // This is an example of reacting on the input change and storing the input data in the cell model.
    this.$box.find('input.actor').on('change', _.bind(function(evt) {
      this.model.set('actor', $(evt.target).val());
    }, this));

    this.$box.find('.add-node').click(showAddMenu);


    // This is an example of reacting on the input change and storing the input data in the cell model. TEXTAREA
    this.$box.find('textarea.name').on('change', _.bind(function(evt) {
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

  dragOn: function(evt) {
    this._dragging = true;
    this._dragHandleOffset = evt.pageX - this._dragHandle.offset().left;
  },

  dragOff: function() {
    this._dragging = false;
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
    this.updateBox();
    return this;
  },

  updateBox: function() {
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
    //this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y,
    //  transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
    this.$box.css({
      width: bbox.width,
      height: bbox.height,
      left: bbox.x,
      top: bbox.y,
      transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
    });
  },

  removeBox: function(evt) {
    this.$box.remove();
  }
});