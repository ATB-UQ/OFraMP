function SmartDemo(oframp, step) {
  this.__init(oframp, step);
}

SmartDemo.prototype = {
  step1: NaiveDemo.prototype.step1,
  step2: NaiveDemo.prototype.step2,
  step3: NaiveDemo.prototype.step3,
  step4: NaiveDemo.prototype.step4,

  step5: function() {
    var _this = this;

    if(this.oframp.off !== undefined) {
      return this.nextStep();
    }

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.bottom = "50px";
    this.overlay.style.left = "50%";
    this.overlay.style.width = "540px";
    this.overlay.style.marginLeft = "-270px";

    $ext.dom.addText(this.overlay, "Fragments are still being generated, "
        + "please wait until this is done");

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

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";
    this.overlay.style.bottom = "50px";
    this.overlay.style.left = "50%";
    this.overlay.style.width = "380px";
    this.overlay.style.marginLeft = "-350px";
    this.overlay.style.paddingBottom = "15px";
    this.overlay.style.paddingRight = "50px";
    this.overlay.style.background = "url('static/img/demo/arrow_down.png') bottom right no-repeat";

    $ext.dom.addText(this.overlay, "The parameterisation process can now be "
        + "started by clicking the 'Start parameterising' button");
    _this.oframp.mv.selectingDisabled = false;

    var sb = document.getElementById("find_fragments");
    $ext.dom.addClass(sb, "highlighted");
    var cbs = $ext.dom.onMouseClick(sb, function() {
      $ext.dom.removeClass(sb, "highlighted");
      $ext.dom.removeEventListeners(sb, cbs);
      _this.nextStep();
    }, $ext.mouse.LEFT);
  },

  step7: function() {
    var _this = this;

    if(this.oframp.behavior.__fragments !== undefined) {
      return this.nextStep();
    }

    $ext.dom.clear(this.overlay);
    this.overlay.style.cssText = "";

    this.overlay.style.bottom = "50px";
    this.overlay.style.left = "50%";
    this.overlay.style.width = "540px";
    this.overlay.style.marginLeft = "-270px";

    $ext.dom.addText(this.overlay, "The system is looking for fragments, "
        + "please wait");

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
    this.overlay.style.bottom = "50px";
    this.overlay.style.left = "50%";
    this.overlay.style.width = "430px";
    this.overlay.style.marginLeft = "-200px";
    this.overlay.style.paddingBottom = "15px";
    this.overlay.style.paddingLeft = "50px";
    this.overlay.style.background = "url('static/img/demo/arrow_down_2.png') bottom left no-repeat";

    $ext.dom.addText(this.overlay, "In order to properly judge a fragment, its "
        + "original molecule can be shown using the 'View original' button");

    var omb = document.getElementById("view_original");
    var afb = document.getElementById("accept_fragment");
    var rfb = document.getElementById("reject_fragment");
    $ext.dom.addClass(omb, "highlighted");
    afb.disabled = "disabled";
    rfb.disabled = "disabled";
    var cbs = $ext.dom.onMouseClick(omb, function() {
      $ext.dom.removeClass(omb, "highlighted");
      $ext.dom.removeEventListeners(omb, cbs);
      _this.nextStep();
    }, $ext.mouse.LEFT);
  }
};

SmartDemo.prototype = $ext.extend($ext.copy(Demo.prototype),
    SmartDemo.prototype);
