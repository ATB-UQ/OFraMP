function NaiveDemo(oframp, step) {
  this.__init(oframp, step);
}

NaiveDemo.prototype = {
  step1: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";
    this.overlay.style.top = "150px";
    this.overlay.style.left = "50%";
    this.overlay.style.width = "120px";
    this.overlay.style.marginLeft = "-410px";
    this.overlay.style.paddingBottom = "34px";
    this.overlay.style.background = "url('static/img/demo/arrow_right.png') bottom right no-repeat";

    $ext.dom.addText(this.overlay, "You insert your molecule data here");

    var mi = document.getElementById("mds_input");
    $ext.dom.addClass(mi, "highlighted");
    var cbs = $ext.dom.onMouseClick(mi, function() {
      mi.disabled = "disabled";
      // TODO: better molecule
      $ext.dom.addText(mi, "CNc1ccc(CN)cc1");
      $ext.dom.removeClass(mi, "highlighted");
      $ext.dom.removeEventListeners(mi, cbs);
      _this.nextStep();
    }, $ext.mouse.LEFT);
  },

  step2: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";
    this.overlay.style.bottom = "35px";
    this.overlay.style.left = "50%";
    this.overlay.style.marginLeft = "-220px";
    this.overlay.style.paddingTop = "15px";
    this.overlay.style.paddingRight = "50px";
    this.overlay.style.background = "url('static/img/demo/arrow_up.png') top right no-repeat";

    $ext.dom.addText(this.overlay,
        "We will use this molecule for the demo, now click 'Submit'");
    document.getElementById("mds_submit").disabled = "";

    var ms = document.getElementById("mds_submit");
    $ext.dom.addClass(ms, "highlighted");
    var cbs = $ext.dom.onMouseClick(ms, function() {
      $ext.dom.removeClass(ms, "highlighted");
      $ext.dom.removeEventListeners(ms, cbs);
      _this.nextStep();
    }, $ext.mouse.LEFT);
  },

  step3: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    $ext.dom.addEventListener(this.oframp.container, "moleculedisplayed",
        moleculeDisplayed);

    function moleculeDisplayed() {
      $ext.dom.removeEventListener(_this.oframp.container, "moleculedisplayed",
          moleculeDisplayed);

      _this.overlay.style.top = "30px";
      _this.overlay.style.left = "30px";
      _this.overlay.style.width = "220px";
      _this.overlay.style.paddingBottom = "30px";
      _this.overlay.style.background = "url('static/img/demo/mouse_drag_left.png') bottom center no-repeat";

      $ext.dom.addText(_this.overlay, "You can now move around the molecule " +
          "by holding down the left mouse button and dragging it");
      _this.oframp.mv.selectingDisabled = true;

      $ext.dom.onMouseDrag(_this.oframp.container, null, $ext.mouse.LEFT);
      var cbs = $ext.dom.onMouseDragEnd(_this.oframp.container, function() {
        $ext.dom.removeEventListeners(_this.oframp.container, cbs);
        _this.nextStep();
      }, $ext.mouse.LEFT);
    }
  },

  step4: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.top = "30px";
    this.overlay.style.right = "30px";
    this.overlay.style.width = "220px";

    $ext.dom.addText(this.overlay, "You can also zoom the molecule by " +
        "using your mouse's scrollwheel");

    $ext.dom.onMouseWheel(this.oframp.container, null);
    var cbs = $ext.dom.onMouseWheelEnd(this.oframp.container, function() {
      $ext.dom.removeEventListeners(_this.oframp.container, cbs);
      _this.nextStep();
    });
  },

  step5: function() {
    var _this = this;

    if(this.oframp.off !== undefined) {
      return this.nextStep();
    }

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.bottom = "30px";
    this.overlay.style.left = "30px";
    this.overlay.style.width = "220px";

    $ext.dom.addText(this.overlay, "Fragments are still being generated, " +
        "please wait until this is done");

    $ext.dom.addEventListener(this.oframp.container, "fragmentsgenerated",
        fragmentsGenerated);
    function fragmentsGenerated() {
      $ext.dom.removeEventListener(_this.oframp.container,
          "fragmentsgenerated", fragmentsGenerated);
      _this.nextStep();
    }
  },

  step6: function() {
    var _this = this;

    if(this.oframp.mv.molecule.getSelected().length > 0) {
      return this.nextStep();
    }

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.bottom = "30px";
    this.overlay.style.right = "30px";
    this.overlay.style.width = "220px";

    $ext.dom.addText(this.overlay, "You can now select an atom by clicking " +
        "on it");
    _this.oframp.mv.selectingDisabled = false;

    $ext.dom.addEventListener(this.oframp.container, "selectionchanged",
        selectionChanged);
    function selectionChanged() {
      $ext.dom.removeEventListener(_this.oframp.container,
          "selectionchanged", selectionChanged);
      _this.oframp.mv.selectingDisabled = true;
      _this.nextStep();
    }
  },

  step7: function() {
    var _this = this;

    if(this.oframp.behavior.relatedFragmentViewers !== undefined) {
      return this.nextStep();
    }

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.top = "60px";
    this.overlay.style.right = "260px";
    this.overlay.style.width = "220px";
    this.overlay.style.paddingBottom = "34px";
    this.overlay.style.background = "url('static/img/demo/arrow_right.png') bottom right no-repeat";

    $ext.dom.addText(this.overlay, "The system is looking for fragments " +
        "that match your selection. They will appear here shortly");

    $ext.dom.addEventListener(this.oframp.container, "fragmentsfound",
        fragmentsFound);
    function fragmentsFound() {
      $ext.dom.removeEventListener(_this.oframp.container, "fragmentsfound",
          fragmentsFound);
      _this.nextStep();
    }
  },

  step8: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.top = "60px";
    this.overlay.style.right = "250px";
    this.overlay.style.width = "220px";
    this.overlay.style.paddingTop = "34px";
    this.overlay.style.background = "url('static/img/demo/arrow_right.png') top right no-repeat";

    $ext.dom.addText(this.overlay, "You can now preview fragments' charges " +
        "by clicking on them");
    _this.oframp.mv.selectingDisabled = false;

    var frag = document.getElementById("fc_0");
    var cbs = $ext.dom.onMouseClick(frag, function() {
      $ext.dom.removeEventListeners(frag, cbs);
      _this.nextStep();
    }, $ext.mouse.LEFT);
  },

  step9: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.top = "60px";
    this.overlay.style.right = "250px";
    this.overlay.style.width = "220px";
    this.overlay.style.paddingBottom = "34px";
    this.overlay.style.background = "url('static/img/demo/arrow_right.png') bottom right no-repeat";

    $ext.dom.addText(this.overlay, "The molecule from which this fragment " +
        "originated can be shown by clicking the 'Show molecule' button");
    _this.oframp.mv.selectingDisabled = false;

    var smb = document.getElementById("fc_0").children[0];
    var sfb = document.getElementById("fc_0").children[1];
    $ext.dom.addClass(smb, "highlighted");
    sfb.disabled = "disabled";
    var cbs = $ext.dom.onMouseClick(smb, function() {
      $ext.dom.removeEventListeners(smb, cbs);
      $ext.dom.removeClass(smb, "highlighted");
      sfb.disabled = "";
      _this.nextStep();
    }, $ext.mouse.LEFT);
  },

  step10: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.bottom = "15px";
    this.overlay.style.left = "50%";
    this.overlay.style.width = "380px";
    this.overlay.style.marginLeft = "-420px";
    this.overlay.style.paddingTop = "15px";
    this.overlay.style.paddingRight = "50px";
    this.overlay.style.background = "url('static/img/demo/arrow_up.png') top right no-repeat";

    $ext.dom.addText(this.overlay, "Once you have seen enough of this " +
        "molecule, you can close the viewer by clicking 'Close'");

    var cb = document.getElementById("popup_content").getElementsByTagName(
        "button")[0];
    $ext.dom.addClass(cb, "highlighted");
    var cbs = $ext.dom.onMouseClick(cb, function() {
      $ext.dom.removeEventListeners(cb, cbs);
      $ext.dom.removeClass(cb, "highlighted");
      _this.nextStep();
    }, $ext.mouse.LEFT);
  },

  step11: function() {
    var _this = this;

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.top = "60px";
    this.overlay.style.right = "250px";
    this.overlay.style.width = "220px";
    this.overlay.style.paddingBottom = "34px";
    this.overlay.style.background = "url('static/img/demo/arrow_right.png') bottom right no-repeat";

    $ext.dom.addText(this.overlay, "This fragment's charges can now be " +
        "applied by clicking the 'Select fragment' button");

    var sfb = document.getElementById("fc_0").children[1];
    $ext.dom.addClass(sfb, "highlighted");
    var cbs = $ext.dom.onMouseClick(sfb, function() {
      $ext.dom.removeEventListeners(sfb, cbs);
      $ext.dom.removeClass(sfb, "highlighted");
      _this.nextStep();
    }, $ext.mouse.LEFT);
  }
};

NaiveDemo.prototype = $ext.extend($ext.copy(Demo.prototype),
    NaiveDemo.prototype);
