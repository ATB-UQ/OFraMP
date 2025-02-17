function NaiveBehavior(oframp) {
  this.__init(oframp);
}

NaiveBehavior.prototype = {
  name: "Naive",

  relatedFragmentViewers: undefined,
  activeFragment: undefined,

  __init: function(oframp) {
    this.oframp = oframp;
    this.demo = new NaiveDemo(oframp);

    var _this = this;
    $ext.dom.addEventListener(oframp.container, 'fragmentsgenerated',
        function() {
          var ffb = document.getElementById("loader_box");
          ffb.style.display = "none";
          oframp.selectionChanged();
        });
  },

  showSelectionDetails: function(selection) {
    var _this = this;

    $ext.dom.clear(this.oframp.atomDetails);

    var ts = document.createElement('div');
    ts.className = "title";
    $ext.dom.addText(ts, "Selection details");

    var cb = document.createElement('div');
    cb.className = 'close';
    ts.appendChild(cb);
    $ext.dom.onMouseClick(cb, function() {
      _this.oframp.mv.molecule.setSelected([]);
      _this.oframp.hideSelectionDetails();
      _this.oframp.redraw();
    });

    this.oframp.atomDetails.appendChild(ts);

    var sl = new AtomList(this.oframp.mv.molecule, selection);
    var cntr = sl.getCenterPoint();
    var s = sl.getSize();
    var cc = document.createElement('div');
    cc.id = "selection_preview";
    var c = this.oframp.getMoleculeCutout(cntr.x, cntr.y, s.w, s.h, 228, 130);
    cc.appendChild(c);
    this.oframp.atomDetails.appendChild(cc);

    var dtc = document.createElement('table');
    var dt = document.createElement('tbody');
    dtc.appendChild(dt);
    this.oframp.atomDetails.appendChild(dtc);

    // Get the unparameterised atoms
    var uas = $ext.array.filter(selection, function(atom) {
      return !atom.isCharged();
    });
    // Get the charge of all selection atoms
    var cs = $ext.array.map(selection, function(atom) {
      return atom.charge;
    });
    // Get the total charge of all atoms in the molecule
    var tc = this.oframp.mv.molecule.total_charge();
    var gc = $ext.array.sum(cs);
    var cc = document.createElement("span");
    $ext.dom.addText(cc, $ext.number.format(gc, 1, 3, 9) || "unknown");

    $ext.dom.addTableRow(dt, "" + selection.length, "Atom count");
    $ext.dom.addTableRow(dt, "" + uas.length, "Unparameterised");
    $ext.dom.addTableRow(dt, "" + (selection.length - uas.length),
        "Parameterised");
    var table_cell = $ext.dom.addTableRow(dt, cc, "Selection group total charge").children[1];
    table_cell.id = 'selection_total_charge';

    var sscb = document.createElement("button");
    sscb.className = "border_box";
    sscb.appendChild(document.createTextNode("Set group to"));

    var ssci = document.createElement("input");

    var max_gc = Math.max(Math.ceil(Math.abs(gc)), 2);
    ssci.setAttribute("type", "number");
    ssci.setAttribute("min", (-max_gc).toString());
    ssci.setAttribute("max", max_gc.toString());
    ssci.setAttribute("step", "1");
    ssci.setAttribute("value", "0");

    var setSelTC = function() {
      _this.setIntegerCharge(selection, ssci.value);
      _this.update_atomic_charges(selection);
      _this.update_selection_total_charge(selection);
      _this.update_molecule_total_charge();
    }
    $ext.dom.onMouseClick(sscb, setSelTC, $ext.mouse.LEFT);
    $ext.dom.addTableRow(dt, [sscb, ssci]);

    table_cell = $ext.dom.addTableRow(dt, $ext.number.format(tc, 1, 3, 9) || "unknown",
        "Molecule total charge").children[1];
    table_cell.id = 'total_charge';

    var smcb = document.createElement("button");
    smcb.className = "border_box";
    smcb.appendChild(document.createTextNode("Set total to"));

    var smci = document.createElement("input");

    var max_tc = Math.max(Math.ceil(Math.abs(tc)), 2);
    smci.setAttribute("type", "number");
    smci.setAttribute("min", (-max_tc).toString());
    smci.setAttribute("max", max_tc.toString());
    smci.setAttribute("step", "1");
    smci.setAttribute("value", "0");

    var setMolTC = function() {
      _this.setIntegerCharge(_this.oframp.mv.molecule.atoms.atoms, smci.value);
      _this.update_atomic_charges(selection);
      _this.update_selection_total_charge(selection);
      _this.update_molecule_total_charge();
    }
    $ext.dom.onMouseClick(smcb, setMolTC, $ext.mouse.LEFT);
    $ext.dom.addTableRow(dt, [smcb, smci]);

    var sadlc = document.createElement("table");
    var sadl = document.createElement('tbody');
    sadlc.appendChild(sadl);
    sadl.id = "selected_atom_details";
    sadl.style.display = "table";
    $ext.dom.addTableRow(sadl, [], ["Elem", "Charge", "Edit", "Frags"]);
    $ext.each(selection, function(atom) {
      var cei = document.createElement('input');
      cei.id = "input_" + atom.id.toString();
      cei.disabled = "disabled";
      cei.value = $ext.number.format(atom.charge, 1, 3, 9) || "";

      var ceb = document.createElement("button");
      ceb.className = "border_box";
      $ext.dom.addText(ceb, "Edit");
      $ext.dom.onMouseClick(ceb, function() {
        $ext.dom.clear(ceb);
        if(cei.disabled) {
          cei.disabled = "";
          $ext.dom.addText(ceb, "Apply");
        } else {
          if(cei.value && !$ext.number.isNumeric(cei.value)) {
            alert("Only numeric values are allowed for the atom charge.");
            return;
          }

          var oldCharge = atom.charge;
          var newCharge = parseFloat(parseFloat(cei.value).toFixed(3));
          atom.setCharge(newCharge);
          if(oldCharge !== newCharge) {
            var cs = $ext.array.map(selection, function(atom) {
              return atom.charge;
            });
            var charge = $ext.number.format($ext.array.sum(cs), 1, 3, 9);
            $ext.dom.clear(cc);
            $ext.dom.addText(cc, charge || "undefined");
            _this.oframp.redraw();
            _this.oframp.checkpoint();
            _this.update_atomic_charges(selection);
            _this.update_selection_total_charge(selection);
            _this.update_molecule_total_charge();
          }
          cei.disabled = "disabled";
          $ext.dom.addText(ceb, "Edit");
        }
      }, $ext.mouse.LEFT);

      if(atom.usedFragments.length > 0) {
        var fcb = document.createElement("button");
        fcb.className = "border_box";
        $ext.dom.addText(fcb, "Show");
        $ext.dom.onMouseClick(fcb, function() {
          _this.oframp.showUsedFragments(atom);
        }, $ext.mouse.LEFT);
      } else {
        var fcb = "-";
      }

      var el = atom.element + "(" + atom.iacm + ")";
      var row = $ext.dom.addTableRow(sadl, [el, cei, ceb, fcb]);
      $ext.dom.onMouseOver(row, function() {
        if(_this.oframp.mv.molecule.setHover(atom)) {
          _this.oframp.redraw();
        }
      });
      $ext.dom.onMouseOut(row, function() {
        if(_this.oframp.mv.molecule.setHover()) {
          _this.oframp.redraw();
        }
      });
    });
    this.oframp.atomDetails.appendChild(sadlc);

    var satb = document.createElement("button");
    satb.className = "border_box";
    $ext.dom.addText(satb, "Hide");
    $ext.dom.onMouseClick(satb, function() {
      $ext.dom.clear(satb);
      if(sadl.style.display === "table") {
        sadl.style.display = "none";
        $ext.dom.addText(satb, "Show");
      } else {
        sadl.style.display = "table";
        $ext.dom.addText(satb, "Hide");
      }
    }, $ext.mouse.LEFT);
    $ext.dom.addTableRow(dt, satb, "Selected atoms");

    var msb = document.createElement('button');
    msb.className = "border_box";
    if(_this.oframp.mv.isModifyingSelection) {
      msb.appendChild(document.createTextNode("Stop modifying selection"));
    } else {
      msb.appendChild(document.createTextNode("Modify selection"));
    }
    this.oframp.atomDetails.appendChild(msb);

    function toggleSelectionEdit() {
      if(_this.oframp.mv.isModifyingSelection) {
        _this.oframp.mv.isModifyingSelection = false;
        $ext.dom.clear(msb);
        msb.appendChild(document.createTextNode("Modify selection"));
      } else {
        _this.oframp.mv.isModifyingSelection = true;
        $ext.dom.clear(msb);
        msb.appendChild(document.createTextNode("Stop modifying selection"));
      }
    }
    $ext.dom.onMouseClick(msb, toggleSelectionEdit, $ext.mouse.LEFT);

    this.oframp.showSelectionDetails();
  },

  update_atomic_charges: function(selection) {
    for (i = 0; i < selection.length; i++) {
      var atom = selection[i];
      document.getElementById("input_" + atom.id.toString()).value = $ext.number.format(atom.charge, 1, 3, 9) || "";
    }
  },

  update_selection_total_charge: function(selection) {
    var cs = $ext.array.map(selection, function (atom) {
      return atom.charge;
    });
    var charge = $ext.number.format($ext.array.sum(cs), 1, 3, 9);
    document.getElementById('selection_total_charge').textContent = charge || "unknown";
  },

  update_molecule_total_charge: function() {
    document.getElementById('total_charge').textContent = ($ext.number.format(this.oframp.mv.molecule.total_charge(), 1, 3, 9) || "unknown");
  },

  showRelatedFragments: function(fragments, selectionIDs) {
    var _this = this;

    $ext.dom.clear(this.oframp.relatedFragments);
    this.relatedFragmentViewers = new Array();

    var ts = document.createElement('div');
    ts.className = "title";
    if(fragments.length > 100) {
      var title = "Found 100+ fragments";
    } else {
      var title = "Found " + fragments.length + " fragments";
    }
    ts.appendChild(document.createTextNode(title));

    var cb = document.createElement('div');
    cb.className = 'close';
    ts.appendChild(cb);
    $ext.dom.onMouseClick(cb, function() {
      _this.oframp.mv.molecule.dehighlight(ATOM_STATUSES.preview);
      _this.oframp.mv.previewCharges({});

      _this.activeFragment = undefined;
      _this.oframp.hideRelatedFragments();
      _this.oframp.redraw();
    });

    this.oframp.relatedFragments.appendChild(ts);

    if(fragments.length === 0) {
      var ep = document.createElement('p');
      var exp = "No matching fragments have been found, please ";
      if(this.oframp.mv.molecule.getSelected().length > 1) {
        exp += "select fewer atoms and try again.";
      } else {
        exp += "try selecting a different atom and search again";
      }
      ep.appendChild(document.createTextNode(exp));
      this.oframp.relatedFragments.appendChild(ep);
    }

    var rightBar = this.oframp.relatedFragments.parentElement;
    var barHeight = rightBar.clientHeight;
    $ext.each(fragments, function(fragment, i) {
      var atoms = $ext.array.map(fragment.atoms, function(atom) {
        var orig = this.oframp.mv.molecule.atoms.get(atom.id);
        atom.element = orig.element;
        atom.x = orig.x;
        atom.y = orig.y;
        return atom;
      }, this);

      var aids = $ext.array.map(fragment.atoms, function(atom) {
        return atom.id;
      });
      var abs = this.oframp.mv.molecule.bonds.filter(function(bond) {
        return aids.indexOf(bond.a1.id) !== -1
            && aids.indexOf(bond.a2.id) !== -1;
      });
      var bonds = $ext.array.map(abs, function(bond) {
        return bond.getJSON();
      });

      var fc = document.createElement('div');
      fc.id = "fc_" + i;
      fc.className = "fragment";
      this.oframp.relatedFragments.appendChild(fc);

      var ob = document.createElement('button');
      ob.className = "show_original border_box";
      ob.disabled = "disabled";
      ob.appendChild(document.createTextNode("Show molecule"));
      fc.appendChild(ob);

      var ab = document.createElement('button');
      ab.className = "select_fragment border_box";
      ab.disabled = "disabled";
      ab.appendChild(document.createTextNode("Select fragment"));
      fc.appendChild(ab);

      var fragment_total_charge = document.createElement('p')
	  fragment_total_charge.innerHTML = $ext.number.format(
		$ext.array.sum(fragment.atoms.map(function(atom){return atom.charge})), 1, 3, 9);
	  fragment_total_charge.className = 'fragment_total_charge';
	  fc.appendChild(fragment_total_charge);

      var fvid = "fragment_" + i;
      var fv = new MoleculeViewer(this.oframp, fvid, fc.id, 228, 130);
      this.relatedFragmentViewers.push(fv);
      if(fragment.hasOverlap) {
        fv.canvas.className += "overlapping";
      }

      var load = function() {
        fv.molecule = new Molecule(fv, atoms, bonds);
        fv.molecule.minimize();

        var selectionAtoms = $ext.array.map(selectionIDs, function(id) {
          return fv.molecule.atoms.get(id);
        });
        fv.molecule.setSelected(selectionAtoms);
        fv.molecule.centerOnAtoms(selectionAtoms);
        fv.redraw();
      };

      if(i * 150 < barHeight) {
        load();
      } else {
        var cbs = $ext.dom.onScroll(rightBar, function() {
          if(fv.molecule || fv.overlayShowing) {
            return;
          }

          var ot = $ext.dom.totalOffsetTop(fv.canvas);
          var ph = rightBar.clientHeight;
          var pt = rightBar.scrollTop;
          if(ot < ph + pt && ot > pt) {
            load();
            $ext.dom.removeEventListeners(rightBar, cbs);
          }
        });
      }

      $ext.dom.onMouseOver(fv.canvas, function() {
        if(!fv.molecule) {
          return;
        }

        var charges = {};
        $ext.each(atoms, function(atom) {
          charges[atom.id] = atom.charge;
        }, this);
        _this.oframp.mv.previewCharges(charges);
      });

      $ext.dom.onMouseOut(fv.canvas, function() {
        if(!fv.molecule) {
          return;
        }

        if(!_this.activeFragment) {
          _this.oframp.mv.previewCharges({});
        } else if(_this.activeFragment !== fv) {
          var charges = {};
          _this.activeFragment.molecule.atoms.each(function(atom) {
            charges[atom.id] = atom.charge;
          }, this);
          _this.oframp.mv.previewCharges(charges);
        }
      });

      $ext.dom.onMouseClick(fv.canvas, function() {
        if(!fv.molecule || _this.activeFragment === fv) {
          return;
        }

        ob.disabled = "";
        ab.disabled = "";

        if(_this.activeFragment) {
          // Disable the currently active fragment's buttons
          _this.activeFragment.canvas.parentElement
              .getElementsByTagName("button")[0].disabled = "disabled";
          _this.activeFragment.canvas.parentElement
              .getElementsByTagName("button")[1].disabled = "disabled";
          $ext.dom.removeClass(_this.activeFragment.canvas.parentElement,
              "active");
        }
        _this.activeFragment = fv;
        $ext.dom.addClass(fc, "active");

        var charges = {};
        $ext.each(atoms, function(atom) {
          charges[atom.id] = atom.charge;
        }, this);
        _this.oframp.mv.previewCharges(charges);
      }, $ext.mouse.LEFT);

      $ext.dom.onMouseClick(ob, function() {
        _this.oframp.showOriginal(fragment);
      }, $ext.mouse.LEFT);

      $ext.dom.onMouseClick(ab, function() {
        _this.oframp.mv.molecule.dehighlight(ATOM_STATUSES.preview);
        _this.oframp.mv.molecule.setSelected([]);

        var charges = {};
        $ext.each(atoms, function(atom) {
          charges[atom.id] = atom.charge;
        }, this);
        if(_this.oframp.mv.setCharges(charges, fragment)) {
          _this.oframp.checkpoint();
          _this.oframp.selectionChanged();
        }

        _this.activeFragment = undefined;
        _this.oframp.redraw();

        _this.oframp.hideRelatedFragments();
      }, $ext.mouse.LEFT);

      // It makes no sense to show more than 100 fragments
      if(i === 100) {
        return $ext.BREAK;
      }
    }, this);

    this.oframp.showRelatedFragments();
  },

  setIntegerCharge: function(selection, total_charge) {
    if(total_charge && !$ext.number.isNumeric(total_charge)) {
      alert("Only numeric values are allowed for the total charge.");
      return;
    }

    total_charge = Math.round(parseFloat(total_charge));

    if (selection.length === 1) {
      var oldCharge = selection[0].charge;
      if (oldCharge !== total_charge) {
        selection[0].setCharge(total_charge);

        this.oframp.redraw();
        this.oframp.checkpoint();
      }
    } else if (selection.length > 1) {
      var blowup = Math.pow(10, 3);
      var deflate = 1/blowup;
      total_charge = Math.round(total_charge*blowup);
      var oldCharge = 0;
      var undef = false;
      for (i = 0; i < selection.length; i++) {
        if (selection[i].charge) {
          oldCharge += Math.round(selection[i].charge*blowup);
        } else if (selection[i].charge === undefined) {
          selection[i].setCharge(0.0);
          undef = true;
        }
      }
      if (oldCharge !== total_charge) {
        var modifier = Math.trunc((total_charge - oldCharge) / selection.length);
        var last_modifier = modifier + (total_charge - oldCharge) % selection.length;

        if (modifier !== 0) {
          for (i = 0; i < selection.length - 1; i++) {
            var newCharge = deflate*Math.trunc((blowup*selection[i].charge) + modifier);
            selection[i].setCharge(newCharge);
          }
        }
        var newCharge = deflate*Math.trunc((blowup*selection[selection.length-1].charge) + last_modifier);
        selection[selection.length-1].setCharge(newCharge);
      }
      if (oldCharge !== total_charge || undef) {
        this.oframp.redraw();
        this.oframp.checkpoint();
      }
    }
  },

  selectionChanged: function() {
    var _this = this;

    var selection = this.oframp.mv.molecule.getSelected();
    if(selection.length === 0) {
      this.activeFragment = undefined;
      this.oframp.hideRelatedFragments();
      return;
    }

    if(this.oframp.off) {
      this.oframp.mv.previewCharges({});
      this.activeFragment = undefined;

      var selectionIDs = $ext.array.map(selection, function(atom) {
        return atom.id;
      });
      var tree = this.oframp.mv.molecule.atoms.getTree(selection[0]);
      var selectionTree = tree.filter(function(node) {
        return selectionIDs.indexOf(node.key) !== -1;
      });

      var connected = $ext.each(selection, function(atom) {
        var f = selectionTree.findNode(atom.id);
        if(!f) {
          return false;
        }
      });

      if(connected !== false) {
        this.oframp.getMatchingFragments();
      } else {
        this.activeFragment = undefined;
        this.oframp.hideRelatedFragments();
      }
    }
  },

  showChargeFixer: function(atom, rem, charges, fragment) {
    var title = "Attempting to assign a new charge to an already charged atom";
    var content = document.createElement('div');
    var id = document.createElement('div');
    id.style.overflow = "hidden";
    id.style.marginBottom = "10px";

    var cd = document.createElement('div');
    cd.id = "molecule_cutout";
    cd.appendChild(this.oframp
        .getMoleculeCutout(atom.x, atom.y, 1, 1, 280, 160));
    id.appendChild(cd);

    var dd = document.createElement('div');
    dd.id = "charge_details";
    var dtc = document.createElement('table');
    var dt = document.createElement('tbody');
    dtc.appendChild(dt);

    var current_charge = $ext.number.format(atom.getCharge(), 1, 3, 9);
    var other_charge = current_charge;
    var avg_charge = current_charge;
    if (charges[atom.id] !== undefined) {
      other_charge = charges[atom.id];
      if (!this.oframp.settings.atom.showHAtoms) {
        $ext.each(atom.getHydrogenAtoms(), function (hydrogen) {
          if (charges[hydrogen.id] !== undefined) {
            other_charge += charges[hydrogen.id];
          }
        })
      }
      avg_charge = $ext.number.format((atom.getCharge() + other_charge) / 2, 1, 3, 9);
      other_charge = $ext.number.format(other_charge, 1, 3, 9);
    }

    $ext.dom.addTableRow(dt, atom.getLabel(), "Element");
    $ext.dom.addTableRow(dt, current_charge, "Current charge");
    $ext.dom.addTableRow(dt, other_charge, "Fragment charge");

    var rc = document.createElement('input');
    rc.disabled = "disabled";
    rc.value = avg_charge;

    var ss = document.createElement('select');
    ss.className = "border_box";
    $ext.dom.addSelectOption(ss, "current", "Current charge");
    $ext.dom.addSelectOption(ss, "other", "Fragment charge");
    $ext.dom.addSelectOption(ss, "average", "Average charge", true);
    if(this.oframp.settings.atom.showHAtoms
        || atom.getHydrogenAtoms().length === 0) {
      $ext.dom.addSelectOption(ss, "custom", "Custom charge");
    } // TODO maybe add some slider-like thing for old:new ratio otherwise?
    $ext.dom.addEventListener(ss, 'change', function() {
      rc.disabled = "disabled";
      var value = rc.value;
      switch(ss.value) {
        case "current":
          value = current_charge;
          break;

        case "other":
          value = other_charge;
          break;

        case "average":
          value = avg_charge;
          break;

        case "custom":
          rc.disabled = "";
          break;
      }
      rc.value = $ext.number.format(value, 1, 3, 9);
    });

    $ext.dom.addTableRow(dt, ss, "Solution");
    $ext.dom.addTableRow(dt, rc, "Resulting charge");
    dd.appendChild(dtc);
    id.appendChild(dd);
    content.appendChild(id);

    var rb = document.createElement('button');
    rb.className = "border_box";
    rb.appendChild(document.createTextNode("Apply solution"));
    content.appendChild(rb);

    function getResultingCharge(atom, method, charges) {
      var value = rc.value;
      switch(method) {
        case "current":
          value = atom.charge;
          break;

        case "other":
          if (charges[atom.id] !== undefined) {
            value = charges[atom.id];
          } else {
            value = atom.charge;
          }
          break;

        case "average":
          if (charges[atom.id] !== undefined) {
            value = (atom.charge + charges[atom.id]) / 2;
          } else {
            value = atom.charge;
          }
          break;
      }
      return parseFloat($ext.number.format(value, 1, 3, 9)) || undefined;
    }

    var _this = this;
    $ext.dom.onMouseClick(rb, function() {
      atom.setCharge(getResultingCharge(atom, ss.value, charges), fragment);
      if(!_this.oframp.settings.atom.showHAtoms) {
        $ext.each(atom.getHydrogenAtoms(), function(a) {
          a.setCharge(getResultingCharge(a, ss.value, charges), fragment);
          a.previewCharge = undefined;
          a.resetHighlight();
        });
      }
      atom.previewCharge = undefined;
      atom.resetHighlight();
      _this.oframp.hidePopup();

      var needsFix = false;
      rem.each(function(atom, i) {
        if(charges[atom.id]) {
          if(atom.isCharged()
              && !$ext.number.approx(charges[atom.id], atom.charge)) {
            if(this.oframp.settings.atom.showHAtoms || atom.element !== "H") {
              this.showChargeFixer(atom, rem.slice(i + 1), charges, fragment);
              needsFix = true;
              return $ext.BREAK;
            }
          } else {
            atom.setCharge(charges[atom.id], fragment);
          }
        }
      }, _this);
      _this.oframp.redraw();

      var unpar = _this.oframp.mv.molecule.getUnparameterized();
      if(!needsFix) {
        _this.oframp.mv.molecule.atoms.each(function(atom) {
          atom.previewCharge = undefined;
        });
        _this.oframp.checkpoint();
        _this.oframp.selectionChanged();
        if(unpar.length === 0) {
          _this.oframp.parameterizationFinished();
        } else {
          var parunpar = $ext.array.filter(unpar, function(atom) {
            return _this.oframp.off_missing.indexOf(atom.id) === -1;
          });
          if(parunpar.length === 0) {
            _this.oframp.parameterizationFinished(true);
          }
        }
      }
    }, $ext.mouse.LEFT);
    this.oframp.showPopup(title, content);
  },

  parameterizationFinished: function(incomplete) {
    if(this.oframp.finished) {
      return;
    }
    var _this = this;

    if (incomplete === undefined) {
      incomplete = false;
    }

    if(incomplete === true) {
      var title = "No more options available";
      var message = "The molecule has been parameterised up to the point "
          + "where there are no more available fragments for the "
          + "unparameterised atoms. You may manually add charges for these "
          + "atoms by selecting them and using the charge edit buttons in "
          + "the selection details window. Charges for other atoms can be "
          + "edited here as well.";
    }
    else {
      var title = "Fully parameterised";
      var message = "All atoms in the molecule have been parameterised. If "
          + "you feel some charges need to be adjusted, this can be done by "
          + "selecting those atoms and using the charge edit buttons in the "
          + "selection details window.";
    }

    var content = document.createElement('div');

    var mp = document.createElement('p');
    $ext.dom.addText(mp, message);
    content.appendChild(mp);

    var total_charge = this.oframp.mv.molecule.total_charge();
    var truncate = function(x, n){return Math.trunc(x * Math.pow(10, n)) / Math.pow(10, n) };
    var has_integer_total_charge = Math.round(total_charge) === truncate(total_charge, 3);
    if (!has_integer_total_charge) {
      var dp2 = document.createElement('p');
      $ext.dom.addText(dp2, "The total charge is not an integer. Please edit the charges so that their sum adds to an "
        + "integer or let OFraMP distribute the difference to an integer charge over all atoms:");
      content.appendChild(dp2);

      var td = document.createElement("div");
      var dtc = document.createElement('table');
      dtc.setAttribute("style", "width: 50%; margin: auto;");
      var dt = document.createElement('tbody');
      dtc.appendChild(dt);
      td.appendChild(dtc);
      content.appendChild(td);

      var table_cell = $ext.dom.addTableRow(dt, $ext.number.format(total_charge, 1, 3, 9) || "unknown",
        "Molecule total charge").children[1];
      table_cell.id = 'mol_total_charge';

      var smcb = document.createElement("button");
      smcb.className = "border_box";
      smcb.appendChild(document.createTextNode("Set total to"));

      var smci = document.createElement("input");

      var max_tc = Math.max(Math.ceil(Math.abs(total_charge)), 2);
      smci.setAttribute("type", "number");
      smci.setAttribute("min", (-max_tc).toString());
      smci.setAttribute("max", max_tc.toString());
      smci.setAttribute("step", "1");
      smci.setAttribute("value", "0");

      var setMolTC = function() {
        _this.setIntegerCharge(_this.oframp.mv.molecule.atoms.atoms, smci.value);
        total_charge = _this.oframp.mv.molecule.total_charge()
        document.getElementById('mol_total_charge').textContent = ($ext.number.format(total_charge, 1, 3, 9) || "unknown");
      }
      $ext.dom.onMouseClick(smcb, setMolTC, $ext.mouse.LEFT);
      $ext.dom.addTableRow(dt, [smcb, smci]);

    }

    if (URLParams && URLParams.user_token && this.oframp.mv.molecule.molid) {

      var dp2 = document.createElement('p');
      if (incomplete === true) {
        var dp3 = document.createElement('p');
        $ext.dom.addText(dp3, "Or you may click the 'Send missing to ATB' button to compute the charges of the missing"
          + "(unparameterized) parts of the molecule with the ATB."
        );
        content.appendChild(dp3);

        $ext.dom.addText(dp2, "Once finished, click the 'Send charges to ATB' button above to send the charges to the ATB "
          + "to make them available for Force Field parametrisation."
        );
      } else {
        $ext.dom.addText(dp2, "Click the 'Send charges to ATB' button to send your charge assignment to the ATB. "
          + "If you are done, you can close this window and refresh the ATB molecule's page. "
          + "A new panel should be available to use the charges in a molecular topology file of your choice."
        );
      }
      content.appendChild(dp2);

    }


    var cd = document.createElement('div');
    cd.className = "controls";
    content.appendChild(cd);

    var db = document.createElement('button');
    db.className = "border_box";
    if (URLParams && URLParams.user_token && _this.oframp.mv.molecule.molid) {
      if (incomplete === true) {
        $ext.dom.addText(db, "Send missing to ATB");
        $ext.dom.onMouseClick(db, transfer_missing, $ext.mouse.LEFT);
        function transfer_missing() {
          _this.oframp.mv.molecule.transfer_missing(
            _this.oframp.settings.atb.api_url,
            _this.oframp.off,
            _this.oframp.settings.omfraf.version);
        }
      } else {
        $ext.dom.addText(db, "Send charges to ATB");
        $ext.dom.onMouseClick(db, transfer_charges, $ext.mouse.LEFT);
        function transfer_charges() {
          _this.oframp.mv.molecule.transfer_charges(_this.oframp.settings.atb.api_url);
        }
        _this.update_molecule_total_charge();
      }

    } else {

      $ext.dom.addText(db, "Download LGF");
      $ext.dom.onMouseClick(db, function() {
        _this.oframp.hidePopup();
        _this.oframp.mv.molecule.downloadLGF();
      }, $ext.mouse.LEFT);

    }
    cd.appendChild(db);

    var nb = document.createElement('button');
    $ext.dom.addText(nb, "Enter new molecule");
    nb.className = "border_box";
    $ext.dom.onMouseClick(nb, function() {
      _this.oframp.showInsertMoleculePopup();
    }, $ext.mouse.LEFT);
    cd.appendChild(nb);

    var cb = document.createElement('button');
    $ext.dom.addText(cb, "Close");
    $ext.dom.setFloat(cb, 'left');
    cb.className = "border_box";
    $ext.dom.onMouseClick(cb, function() {
      _this.oframp.hidePopup();
    }, $ext.mouse.LEFT);
    cd.appendChild(cb);

    this.oframp.showPopup(title, content, true);
  }
};

NaiveBehavior.prototype = $ext.extend($ext.copy(Behavior.prototype),
    NaiveBehavior.prototype);
