function Molecule(mv, atoms, bonds, dataStr, molid) {
  this.__init(mv, atoms, bonds, dataStr, molid);
}

Molecule.prototype = {
  mv: undefined,
  settings: undefined,
  cache: undefined,

  dataStr: undefined,
  atoms: undefined,
  bonds: undefined,
  molid: undefined,


  __init: function(mv, atoms, bonds, dataStr, molid) {
    this.mv = mv;
    this.settings = mv.settings;
    this.cache = new Cache();

    this.dataStr = dataStr;
    this.atoms = new AtomList(this, atoms);
    this.bonds = new BondList(this, bonds);
    this.molid = molid;
  },

  total_charge: function(sum_partial = true) {
    return $ext.array.sum(
      this.atoms.map(
        function(atom){return atom.charge || (sum_partial ? 0 : undefined)}
      )
    );
  },

  /*
   * Convert the basic data of this Molecule to JSON.
   */
  getSimpleJSON: function() {
    var data = {
      atoms: this.atoms.getSimpleJSON(),
      bonds: this.bonds.getSimpleJSON()
    };
    if(this.molid !== undefined) {
      data.molid = this.molid;
    }
    return data;
  },

  /*
   * Get all data of this Molecule as a JSON object.
   */
  getJSON: function() {
    return {
      dataStr: this.dataStr,
      molid: this.molid,
      atoms: this.atoms.getJSON(),
      bonds: this.bonds.getJSON()
    };
  },

  downloadLGF: function() {
    var date = $ext.date.format(new Date(), "%Y%m%d%H%M%S");
    var fname = "OFraMP-" + date + ".lgf";
    $ext.sendDataForm("save.php", {
      data: this.getLGF(),
      fname: fname
    }, "post", "_blank");
  },

  getLGF: function() {
    return this.atoms.getLGF() + this.bonds.getLGF();
  },

  get_names_and_charges: function() {
    return this.atoms.map((atom) => {return atom.get_name_and_charge()})
  },

  /*
   * Get the width of this molecule.
   */
  getWidth: function() {
    if(this.cache.get('position.width')) {
      return this.cache.get('position.width');
    }
    var w = this.atoms.getWidth();
    this.cache.set('position.width', w, this.cache
        .getCache('appearance.radius'));
    return w;
  },

  /*
   * Get the height of this molecule.
   */
  getHeight: function() {
    if(this.cache.get('position.height')) {
      return this.cache.get('position.height');
    }
    var h = this.atoms.getHeight();
    this.cache.set('position.height', h, this.cache
        .getCache('appearance.radius'));
    return h;
  },

  /*
   * Get the atom at position (x, y), if any.
   */
  getAtomAt: function(x, y) {
    return this.atoms.getAtomAt(x, y);
  },

  /*
   * Get the atoms in the bounding box (x1, y1) to (x2, y2).
   */
  getAtomsIn: function(x1, y1, x2, y2) {
    return this.atoms.getAtomsIn(x1, y1, x2, y2);
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
   * Add the atom a to the current selection.
   */
  addSelected: function(a) {
    return this.atoms.addSelected(a);
  },

  dehighlight: function(status) {
    this.atoms.dehighlight(status);
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
   * Move the given atom to the center of the canvas.
   */
  centerOnAtom: function(atom) {
    return this.atoms.centerOnAtom(atom);
  },

  /*
   * Move the center of the given list of atoms to the center of the canvas.
   */
  centerOnAtoms: function(atoms) {
    return this.atoms.centerOnAtoms(atoms);
  },

  /*
   * Fit the molecule in a bounding box of size w * h.
   */
  bestFit: function(w, h) {
    w = w || this.mv.canvas.width;
    h = h || this.mv.canvas.height;
    return this.atoms.bestFit(w, h);
  },

  /*
   * Scale the molecule such that the shortest bond is of size minBondLength.
   */
  minimize: function() {
    var sd = this.bonds.getShortestDistance();
    var f = this.settings.zoom.minBondLength / sd;
    this.zoom(f);
    this.center();
  },

  /*
   * Scale the molecule such that the average bond is of size idealBondLength.
   */
  idealize: function() {
    var sd = this.bonds.getAverageDistance();
    var f = this.settings.zoom.idealBondLength / sd;
    this.zoom(f);
    this.center();
  },

  /*
   * Scale the molecule such that the longest bond is of size maxBondLength.
   */
  maximize: function() {
    var ld = this.bonds.getLongestDistance();
    var f = this.settings.zoom.maxBondLength / ld;
    this.zoom(f);
    this.center();
  },

  /*
   * Reset the positions to those calculated by OAPoC.
   */
  resetPositions: function() {
    var _this = this;
    this.mv.getMoleculeData(this.dataStr, function(md) {
      _this.mv.showOverlay("Initializing atom positions...");
      $ext.each(md.atoms, function(atom) {
        var a = _this.atoms.get(atom.id);
        a.x = atom.x;
        a.y = atom.y;
      });

      _this.idealize();
      _this.mv.hideOverlay();
    }, function(msg) {
      alert("Could not reset positions:\n" + msg);
      _this.mv.hideOverlay();
    });
  },

  /*
   * Get the list of selected atoms.
   */
  getSelected: function() {
    return this.atoms.getSelected();
  },

  /*
   * Get the list of unparameterised atoms.
   */
  getUnparameterized: function() {
    return this.atoms.getUnparameterized();
  },

  /*
   * Find all occurrences of a given sequence or Molecule in this molecule.
   */
  find: function(needle) {
    if(needle instanceof Molecule) {
      var seqs = this.__findOccurrences(needle);
    } else if(needle instanceof Array) {
      var seqs = this.__findSequences(needle);
    } else {
      throw "Find only works with Molecules or Arrays";
    }

    this.dehighlight(ATOM_STATUSES.preview);
    $ext.each($ext.array.flatten(seqs), function(atom) {
      atom.addHighlight(ATOM_STATUSES.preview);
    });
    this.mv.redraw();

    return seqs;
  },

  /*
   * Find all occurrences of a given sequence in this molecule.
   */
  __findSequences: function(seq) {
    return this.atoms.findSequences(seq);
  },

  /*
   * Find all occurrences of a given Molecule in this molecule.
   */
  __findOccurrences: function(molecule) {
    return this.atoms.findOccurrences(molecule.atoms);
  },

  /*
   * Fix atoms overlapping each other, atoms overlapping bonds and bonds
   * crossing each other.
   * 
   * Returns true is atoms were moved and a redraw is needed.
   */
  deoverlap: function() {
    if(!this.settings.deoverlap.deoverlap || $ext.onBrokenIE()) {
      return;
    }

    if(this.settings.deoverlap.deoverlapAtoms) {
      var da = this.__deoverlapAtoms();
    }

    if(this.settings.deoverlap.deoverlapBonds) {
      var db = this.__deoverlapBonds();
    }

    if(this.settings.deoverlap.decrossBonds) {
      var dc = this.__decrossBonds();
    }

    if(this.settings.deoverlap.lengthenBonds) {
      var lb = this.__lengthenBonds();
    }

    return da || db || dc || lb;
  },

  /*
   * Fix atoms overlapping each other.
   * 
   * Returns true is atoms were moved and a redraw is needed.
   */
  __deoverlapAtoms: function() {
    var changed = false;

    for( var i = 0; i < this.atoms.count(); i++) {
      var a1 = this.atoms.atoms[i];
      if(!a1.isVisible()) {
        continue;
      }

      for( var j = i + 1; j < this.atoms.count(); j++) {
        var a2 = this.atoms.atoms[j];
        if(!a2.isVisible()) {
          continue;
        }

        var d = a1.getDistanceTo(a2);
        var rd = a1.getRadiusDistanceTo(a2);

        // Prevent problems with atoms at the exact same position by slightly
        // moving one of them.
        if($ext.number.approx(d, 0)) {
          a1.move(1e-3, 1e-3);
          d = a1.getDistanceTo(a2);
          rd = a1.getRadiusDistanceTo(a2);
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
  __deoverlapBonds: function() {
    var changed = false;

    for( var i = 0; i < this.atoms.count(); i++) {
      var a = this.atoms.atoms[i];
      if(!a.isVisible()) {
        continue;
      }

      for( var j = 0; j < this.bonds.count(); j++) {
        var b = this.bonds.bonds[j];
        if(!b.isVisible()) {
          continue;
        }

        var bd = a.getDistanceToBond(b);

        // Prevent problems with atoms that are exactly on a bond by slightly
        // moving them.
        if($ext.number.approx(bd, 0)) {
          a.move(1e-3, 1e-3);
          bd = a.getDistanceToBond(b);
        }

        if(bd < a.getRadius() + this.settings.bond.spacing - 1) {
          var f = (a.getRadius() - bd + this.settings.bond.spacing) / bd;
          var ba = a.getBondAnchor(b);
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
  __decrossBonds: function() {
    var changed = false;

    for( var i = 0; i < this.bonds.count(); i++) {
      var b1 = this.bonds.bonds[i];
      if(!b1.isVisible()) {
        continue;
      }

      for( var j = i + 1; j < this.bonds.count(); j++) {
        var b2 = this.bonds.bonds[j];
        if(!b2.isVisible()) {
          continue;
        }

        var c = b1.getIntersectionWith(b2);
        if(c) {
          var tds = [this.atoms.getTree(b1.a2).getChild(b1.a1.id).depth(),
              this.atoms.getTree(b1.a1).getChild(b1.a2.id).depth(),
              this.atoms.getTree(b2.a2).getChild(b2.a1.id).depth(),
              this.atoms.getTree(b2.a1).getChild(b2.a2.id).depth()];

          var atoms = [b1.a1, b1.a2, b2.a1, b2.a2];
          var a = atoms[tds.indexOf($ext.array.min(tds))];

          var dx = c.x - a.x;
          var dy = c.y - a.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          var ddx = a.getRadius() * dx / d;
          var ddy = a.getRadius() * dy / d;
          a.move(dx + ddx, dy + ddy);
          changed = true;
        }
      }
    }

    return changed;
  },

  /*
   * Make sure each bond is at least minBondLength long.
   */
  __lengthenBonds: function() {
    var changed = false;

    for( var i = 0; i < this.bonds.count(); i++) {
      var bond = this.bonds.bonds[i];
      if(!bond.isVisible()) {
        continue;
      }

      if(bond.getLength() < this.settings.zoom.minBondLength - 1) {
        var dist = bond.a1.getDistanceTo(bond.a2);
        if($ext.number.approx(dist, 0)) {
          bond.a2.move(1e-3, 1e-3);
          dist = bond.a1.getDistanceTo(bond.a2);
        }

        var d = Math.abs(this.settings.zoom.minBondLength - dist) / 2;
        var dx = bond.a2.x - bond.a1.x;
        var dy = bond.a2.y - bond.a1.y;
        var ddx = d * dx / dist;
        var ddy = d * dy / dist;
        bond.a1.move(-ddx, -ddy);
        bond.a2.move(ddx, ddy);
        changed = true;
      }
    }

    return changed;
  },

  clearCache: function(name) {
    this.cache.clear(name);
    this.mv.clearCache(name);
  },

  /*
   * Draw the molecule.
   */
  draw: function() {
    this.atoms.draw();
    this.bonds.draw();
  },

  transfer_missing: function(api_url, off, version) {
    self = this;
    if (URLParams && URLParams.user_token && this.molid) {
      var states = this.atoms.map((atom) => {return atom.getStatus()})
      var no_missing = true;
      for (var status of states) {
        if (status === ATOM_STATUSES.missing) {
          no_missing = false;
          break;
        }
      }

      if (no_missing) {
        alert('There are no missing atoms.');
      } else {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if(xhr.readyState == 4) {
            if(xhr.status == 200) {
              var fd = JSON.parse(xhr.responseText);
              var vc = $ext.string.versionCompare(version, fd.version);
              if(vc == 1) {
                alert("FDB version too old." + "\n\nRequired version: "
                    + _this.settings.omfraf.version + "\nCurrent version: "
                    + fd.version);
              } else if(vc == -1) {
                alert("FDB version too new." + "\n\nRequired version: "
                    + _this.settings.omfraf.version + "\nCurrent version: "
                    + fd.version);
              } else if(fd.error) {
                alert(fd.error);
              } else if(fd.missing_fragments) {
                var xhttp = new XMLHttpRequest();
                xhttp.open("POST", api_url + "api/current/fragments/submit_missing_fragments.py", true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.onreadystatechange = function() {
                  if(this.readyState == 4) {
                    var data = this.responseText;
                    if (this.status !== 200) {
                      alert('Missing fragments could not be sent back to the ATB for ab-initio parametrisation. Please checkpoint your work to avoid losing it, and retry later using the "Send missing to ATB" button.')
                    } else {
                      alert("Missing fragments successfully sent to the ATB for ab-initio parametrisation. Once parametrised, they will be incorporated into the fragment database. In the meantime, you can parametrise the missing atoms (red) manually.");
                    }
                  }
                };
                xhttp.send("missing_fragments=" + JSON.stringify(fd.missing_fragments)
                  + "&atb_token=" + URLParams.user_token
                  + "&timeout=500"
                  + "&molid=" + self.molid);
              }
            } else {
              alert("Could not connect to the FDB server.");
            }
          }
        };

        var query = JSON.stringify({off: off});
        var data = "data=" + encodeURIComponent(query);

        xhr.open("POST", this.settings.omfraf.missingUrl, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(data);
      }
    }
  },

  transfer_charges: function(api_url) {
    if (URLParams && URLParams.user_token && this.molid) {
      var charge_mapping = this.get_names_and_charges();

      var has_undefined_charges = false;
      var has_integer_total_charge = Math.round(this.total_charge()) === this.total_charge();
      var atoms_with_undefined_charge = [];
      for (var atom_name_and_charge of charge_mapping) {
        if (atom_name_and_charge[1] === undefined) {
          atoms_with_undefined_charge.push(atom_name_and_charge[0]);
          has_undefined_charges = has_undefined_charges || true;
        }
      }

      if (has_undefined_charges) {
        alert('The charge of some atoms is not defined: ' + atoms_with_undefined_charge.join(', ') + '.\nPlease assign charges and retry.');
      }
      else if (! has_integer_total_charge) {
        alert('The total charge is not an integer. Please edit the charges so that their sum adds to an integer, and resubmit.');
        console.log(
          this.atoms.map(function(atom){return atom.charge}),
        );
      }
      else {
        var json_mapping = JSON.stringify(charge_mapping);
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", api_url + "api/current/molecules/oframp_charges.py", false);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("molid=" + this.molid + "&json_mapping=" + json_mapping + "&user_token=" + URLParams.user_token);
        var data = xhttp.responseText;
        if (xhttp.status !== 200) {
           alert('Charge assignment could not be sent back to the ATB for topology generation. Please checkpoint your work to avoid losing it, and retry in a while using the "Send to ATB" button.')
        }
        else {
          var should_redirect = confirm("Charge assignment successfully sent to the ATB.\n Would you like to be redirected to the topology generation page ?");
          if (should_redirect == true) {
            window.location = 'https://atb.uq.edu.au/molecule.py?molid=' + this.molid.toString() + '#panel-oframp';
          }
        }
      }
    }
  }
};
