var MESSAGE_TYPES = {
  info: 1,
  warning: 2,
  error: 3,
  critical: 4,
  debug: 5
};

var ATOM_STATUSES = {
  normal: 0,
  unparameterizable: 1,
  selected: 2,
  hover: 4,
  preview: 8,
  conflict: 16
};

var PARTIALLY_SUPPORTED_BROWSERS = [{
  browser: "Chrome",
  minVersion: "0"
}, {
  browser: "Firefox",
  minVersion: "4"
}, {
  browser: "Explorer",
  minVersion: "7"
}, {
  browser: "Safari",
  minVersion: "5"
}, {
  browser: "Opera",
  minVersion: "12"
}, { // IE 11
  browser: "Mozilla",
  minVersion: "11"
}];

/*
 * Note that Opera has a strange right mouse drag default shortcut that prevents
 * full support.
 */
var FULLY_SUPPORTED_BROWSERS = [{
  browser: "Chrome",
  minVersion: "25"
}, {
  browser: "Firefox",
  minVersion: "25"
}, {
  browser: "Explorer",
  minVersion: "10"
}, {
  browser: "Safari",
  minVersion: "5"
}, { // IE 11
  browser: "Mozilla",
  minVersion: "11"
}];

var PREDEFINED_MOLECULES = ["CC(NC)CC1=CC=C(OCO2)C2=C1", "c1ccccc1"];

var DEFAULT_SETTINGS = {
  oapoc: {
    url: "http://fragments.atb.uq.edu.au/oapoc/generate/",
    loadUrl: "http://fragments.atb.uq.edu.au/oapoc/load/",
    version: "1.0"
  },

  omfraf: {
    url: "http://fragments.atb.uq.edu.au/fdb/fragments/load/",
    repoUrl: "http://fragments.atb.uq.edu.au/fdb/fragments/repos/",
    generateUrl: "http://fragments.atb.uq.edu.au/fdb/fragments/generate/",
    coordsUrl: "http://fragments.atb.uq.edu.au/fdb/fragments/coordinates/",
    version: "1.0",
  },

  defaults: {
    repo: "qm_1_and_2",
    defaultShell: 2,
    maxShell: 5
  },

  zoom: {
    factor: 1.1,
    min: 40,
    max: 300,
    minBondLength: 50,
    idealBondLength: 70,
    maxBondLength: 150
  },

  deoverlap: {
    deoverlap: true,
    deoverlapAtoms: true,
    deoverlapBonds: false,
    decrossBonds: false,
    lengthenBonds: false,
    timeLimit: .5
  },

  cursor: {
    normal: "default",
    drag: "move",
    click: "pointer"
  },

  popup: {
    borderWidth: 10,
    borderColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    font: "13px Arial",
    color: "rgb( 48, 48, 48)",
    bgColors: {
      1: "rgba(255, 255, 255, 0.9)",
      2: "rgba(253, 198, 137, 0.9)",
      3: "rgba(246, 150, 121, 0.9)",
      4: "rgba(189, 140, 191, 0.9)",
      5: "rgba(131, 147, 202, 0.9)"
    }
  },

  atom: {
    showHAtoms: false,
    combineHLabels: true,
    showCLabels: true,
    showCirc: true,
    showID: false,
    radius: {
      standard: 20,
      charged: 20
    },
    backgroundColor: {
      standard: "rgb(255, 255, 255)",
      charged: "rgb(194, 255, 147)",
      hover: "rgb(210, 180, 245)",
      selected: "rgb(150, 140, 205)",
      preview: "rgb(114, 198, 105)",
      conflict: "rgb(204, 166,  40)",
      unparameterizable: "rgb(255, 210, 208)"
    },
    borderWidth: {
      standard: 1,
      active: 3
    },
    borderColor: {
      standard: "rgb( 48, 48, 48)",
      active: "rgb( 48, 48, 48)"
    },
    color: {
      standard: "rgb( 48, 48, 48)",
      charged: "rgb( 48, 48, 48)"
    },
    elementFont: "bold 12px Arial",
    chargeFont: "9px Arial",
    chargeOffset: 6
  },

  bond: {
    width: 1,
    color: "rgb( 48, 48, 48)",
    connectorWidth: 3,
    connectorColor: "rgb( 48, 48, 48)",
    spacing: 4,
    dashCount: 5,
    id: {
      show: false,
      radius: 8,
      bgColor: "rgb(205, 205, 205)",
      font: "9px Arial",
      color: "rgb( 48, 48, 48)"
    }
  },

  selection: {
    color: "rgba(44, 10, 205, .3)",
    borderWidth: 1,
    borderColor: "rgba(44, 10, 205, .5)"
  }
};

var SETTINGS_OPTIONS = {
  "oapoc, omfraf, atb, defaults": {
    hidden: true
  },

  zoom: {
    factor: {
      min: 1.01,
      max: 2,
      step: 0.01
    },
    "min, max, minBondLength, idealBondLength, maxBondLength": {
      min: 0,
      max: 500,
      step: 1
    }
  },

  deoverlap: {
    "deoverlap, deoverlapAtoms, deoverlapBonds, decrossBonds, lengthenBonds": {
      onChange: function(v) {
        if(v) {
          this.__gui.getRootObject().getMV().deoverlap();
        }
      }
    },
    timeLimit: {
      min: .1,
      max: 10,
      step: .1
    }
  },

  cursor: {
    "normal, drag, click": {
      options: ["crosshair", "default", "e-resize", "help", "move", "n-resize",
          "ne-resize", "nw-resize", "pointer", "progress", "s-resize",
          "se-resize", "sw-resize", "text", "w-resize", "wait"]
    }
  },

  popup: {
    "borderWidth, padding": {
      min: 0,
      max: 100,
      step: 1
    },
    "borderWidth, borderColor, padding, font, color": {
      onChange: function() {
        this.__gui.getRootObject().getMV().redraw();
      }
    },
    bgColors: {
      "1, 2, 3, 4, 5": {
        onChange: function() {
          this.__gui.getRootObject().getMV().redraw();
        }
      }
    }
  },

  atom: {
    showHAtoms: {
      onChange: function() {
        var mv = this.__gui.getRootObject().getMV();
        if(mv.molecule) {
          mv.molecule.atoms.each(function(a) {
            a.clearCache('appearance.visible');
          });
          mv.molecule.bonds.each(function(b) {
            b.clearCache('appearance.visible');
          });
          mv.redraw();
        }
      }
    },
    combineHLabels: {
      onChange: function() {
        var mv = this.__gui.getRootObject().getMV();
        if(mv.molecule) {
          mv.molecule.atoms.each(function(a) {
            a.clearCache('appearance.label');
          });
          mv.redraw();
        }
      }
    },
    showCLabels: {
      onChange: function() {
        var mv = this.__gui.getRootObject().getMV();
        if(mv.molecule) {
          mv.molecule.atoms.each(function(a) {
            a.clearCache('appearance.showLabel');
          });
          mv.molecule.bonds.each(function(b) {
            b.clearCache('position.coords');
          });
          mv.redraw();
        }
      }
    },
    "showCirc, showID, elementFont, chargeFont, chargeOffset": {
      onChange: function() {
        this.__gui.getRootObject().getMV().redraw();
      }
    },
    radius: {
      "standard, charged": {
        min: 0,
        max: 50,
        step: 1,
        onChange: function() {
          var mv = this.__gui.getRootObject().getMV();
          if(mv.molecule) {
            mv.molecule.atoms.each(function(a) {
              a.clearCache('appearance.radius');
            });
            mv.molecule.bonds.each(function(b) {
              b.clearCache('position');
            });
            mv.redraw();
          }
        },
        onFinishChange: function() {
          this.__gui.getRootObject().getMV().deoverlap();
        }
      }
    },
    backgroundColor: {
      "standard, charged, hover, selected, preview, conflict, unparameterizable": {
        onChange: function() {
          this.__gui.getRootObject().getMV().redraw();
        }
      }
    },
    borderWidth: {
      "standard, active": {
        min: 0,
        max: 10,
        step: 1,
        onChange: function() {
          this.__gui.getRootObject().getMV().redraw();
        }
      }
    },
    borderColor: {
      "standard, active": {
        onChange: function() {
          this.__gui.getRootObject().getMV().redraw();
        }
      }
    },
    color: {
      "standard, charged": {
        onChange: function() {
          this.__gui.getRootObject().getMV().redraw();
        }
      }
    },
    chargeOffset: {
      min: 0,
      max: 50,
      step: 1
    }
  },

  bond: {
    "width, connectorWidth, spacing": {
      min: 0,
      max: 10,
      step: 1
    },
    connectorWidth: {
      onChange: function() {
        var mv = this.__gui.getRootObject().getMV();
        if(mv.molecule) {
          mv.molecule.bonds.each(function(b) {
            b.clearCache('appearance.connectors');
          });
          mv.redraw();
        }
      }
    },
    spacing: {
      onChange: function() {
        var mv = this.__gui.getRootObject().getMV();
        if(mv.molecule) {
          mv.molecule.bonds.each(function(b) {
            b.clearCache('appearance.lines');
            b.clearCache('appearance.connectors');
          });
          mv.redraw();
        }
      }
    },
    dashCount: {
      min: 1,
      max: 20,
      step: 1,
      onChange: function() {
        var mv = this.__gui.getRootObject().getMV();
        if(mv.molecule) {
          mv.molecule.bonds.each(function(b) {
            b.clearCache('appearance.lines');
          });
          mv.redraw();
        }
      }
    },
    "width, color, connectorColor": {
      onChange: function() {
        this.__gui.getRootObject().getMV().redraw();
      }
    },
    id: {
      radius: {
        min: 0,
        max: 30,
        step: 1
      },
      "show, radius, bgColor, font, color": {
        onChange: function() {
          this.__gui.getRootObject().getMV().redraw();
        }
      }
    }
  }
};
