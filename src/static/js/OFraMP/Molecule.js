function Molecule(mv, atoms, bonds) {
  this.init(mv, atoms, bonds);
}

Molecule.prototype = {
  mv: undefined,
  atoms: undefined,
  bonds: undefined,

  init: function(mv, atoms, bonds) {
    this.mv = mv;
    this.atoms = new AtomList(this, atoms);
    this.bonds = new BondList(this, bonds);
  },

  /*
   * Get the width of this molecule.
   */
  width: function() {
    return this.atoms.width();
  },

  /*
   * Get the height of this molecule.
   */
  height: function() {
    return this.atoms.height();
  },

  /*
   * Get the atom at position (x, y), if any.
   */
  atomAt: function(x, y) {
    return this.atoms.atomAt(x, y);
  },

  /*
   * Set the hovered atom to a (or none if a is undefined).
   */
  setHover: function(a) {
    return this.atoms.setHover(a);
  },

  /*
   * Set the selected atom to a (or none if a is undefined).
   */
  setSelected: function(a) {
    return this.atoms.setSelected(a);
  },

  /*
   * Move the molecule dx in the x direction and dy on the y axis.
   */
  move: function(dx, dy) {
    return this.atoms.move(dx, dy);
  },

  /*
   * Scale the molecule with a factor f.
   */
  scale: function(f) {
    return this.atoms.scale(f);
  },

  /*
   * Zoom on the center of the molecule with a factor f.
   */
  zoom: function(f) {
    return this.atoms.zoom(f);
  },

  /*
   * Zoom on the point (x, y) with a factor f.
   */
  zoomOn: function(x, y, f) {
    return this.atoms.zoomOn(x, y, f);
  },

  /*
   * Center the molecule on the canvas.
   */
  center: function() {
    return this.atoms.center();
  },

  /*
   * Fit the molecule in a bounding box of size w * h.
   */
  bestFit: function(w, h) {
    return this.atoms.bestFit(w, h);
  },

  /*
   * Scale the molecule such that the shortest bond is of size min_bond_length.
   */
  minimize: function() {
    this.center();
    var sd = this.bonds.shortestDistance();
    var f = this.mv.settings.min_bond_length / sd;
    this.zoom(f);
  },

  /*
   * Scale the molecule such that the average bond is of size ideal_bond_length.
   */
  idealize: function() {
    this.center();
    var sd = this.bonds.averageDistance();
    var f = this.mv.settings.ideal_bond_length / sd;
    this.zoom(f);
  },

  /*
   * Scale the molecule such that the longest bond is of size max_bond_length.
   */
  maximize: function() {
    this.center();
    var ld = this.bonds.longestDistance();
    var f = this.mv.settings.max_bond_length / ld;
    this.zoom(f);
  },

  /*
   * Fix atoms overlapping each other, atoms overlapping bonds and bonds
   * crossing each other.
   * 
   * Returns true is atoms were moved and a redraw is needed.
   */
  deoverlap: function() {
    var da = this.deoverlapAtoms();
    var db = this.deoverlapBonds();
    var dc = this.decrossBonds();
    return da || db || dc;
  },

  /*
   * Fix atoms overlapping each other.
   * 
   * Returns true is atoms were moved and a redraw is needed.
   */
  deoverlapAtoms: function() {
    var changed = false;

    for( var i = 0; i < this.atoms.count(); i++) {
      var a1 = this.atoms.atoms[i];
      if(!a1.show) {
        continue;
      }

      for( var j = i + 1; j < this.atoms.count(); j++) {
        var a2 = this.atoms.atoms[j];
        if(!a2.show) {
          continue;
        }

        var d = a1.distance(a2);
        var rd = a1.radiusDistance(a2);

        // Prevent problems with atoms at the exact same position by slightly
        // moving one of them.
        if(d.approx(0)) {
          a1.move(1e-3, 1e-3);
          d = a1.distance(a2);
          rd = a1.radiusDistance(a2);
        }

        if(rd < -1) {
          var f = rd / d;
          var dx = a1.dx(a2) * f / 2;
          var dy = a1.dy(a2) * f / 2;
          a1.move(dx, dy);
          a2.move(-dx, -dy);
          changed = true;
        }
      }
    }

    return changed;
  },

  /*
   * Fix atoms overlapping bonds.
   * 
   * Returns true is atoms were moved and a redraw is needed.
   */
  deoverlapBonds: function() {
    var s = this.mv.settings;
    var changed = false;

    for( var i = 0; i < this.atoms.count(); i++) {
      var a = this.atoms.atoms[i];
      if(!a.show) {
        continue;
      }

      for( var j = 0; j < this.bonds.count(); j++) {
        var b = this.bonds.bonds[j];
        if(!b.show) {
          continue;
        }

        var bd = a.bondDistance(b);

        // Prevent problems with atoms that are exactly on a bond by slightly
        // moving them.
        if(bd.approx(0)) {
          a.move(1e-3, 1e-3);
          bd = a.bondDistance(b);
        }

        if(bd < a.getRadius() + s.bond_spacing - 1) {
          var f = (a.getRadius() - bd + s.bond_spacing) / bd;
          var ba = a.bondAnchor(b);
          var dx = (a.x - ba.x) * f;
          var dy = (a.y - ba.y) * f;
          a.move(dx, dy);
          changed = true;
        }
      }
    }

    return changed;
  },

  /*
   * Fix bonds crossing each other.
   * 
   * Returns true is atoms were moved and a redraw is needed.
   */
  decrossBonds: function() {
    var changed = false;

    for( var i = 0; i < this.bonds.count(); i++) {
      var b1 = this.bonds.bonds[i];
      if(!b1.show) {
        continue;
      }

      for( var j = i + 1; j < this.bonds.count(); j++) {
        var b2 = this.bonds.bonds[j];
        if(!b2.show) {
          continue;
        }

        var c = b1.intersection(b2);
        if(c) {
          var atoms = [b1.a1, b1.a2, b2.a1, b2.a2];
          var bcs = atoms.map(function(a) {
            return a.bondCount();
          });
          var a = atoms[bcs.indexOf(bcs.min())];

          var dx = c.x - a.x;
          var dy = c.y - a.y;
          a.move(dx, dy);
          changed = true;
        }
      }
    }

    return changed;
  },

  /*
   * Draw the molecule.
   */
  draw: function() {
    this.atoms.draw();
    this.bonds.draw();
  }
};
