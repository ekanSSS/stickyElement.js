'use strict';

var stickyElement = stickyElement || (() => {
  var self = {};
  var lastScroll = 0; // value of lastScroll for determining if we scrolling up or down
  var list = []; // list of sticky element with configuration
  var isReady = true; // requestanimationframe flag (for prevent to much fonction call)
  var basePosition = {
    position: "absolute", 
    bottom: "", 
    top: ""
  }

  /**
  * @desc init module and trigger event if window has already scrolled
  **/
  var init = () => {
    window.addEventListener("scroll", handler);
  }

  /**
  * @desc handle scroll for add element
  * @param [mixed] e scroll event
  **/
  var handler = (e) => {
      if(isReady){
        window.requestAnimationFrame(calcPos);
      }

      isReady = false;
  }

  /**
  * @desc calc style and position of every sticky element
  **/
  var calcPos = () =>{
    var scroll = window.scrollY;
    var dir = scroll <= lastScroll ? "up" : "down";

    list.forEach(val => {
      var newPos = "";
      var css = Object.assign({}, basePosition);

      var windowTop = scroll + val.stickyTop;
      var windowBottom = scroll + window.innerHeight - val.stickyBottom;
      var containerTop = val.container.offsetTop;
      var containerBottom = containerTop + val.container.offsetHeight;
      var elTop = containerTop + val.el.offsetTop;
      var elBottom = elTop + val.el.offsetHeight;

      // set element in fixed position for a more smoother animation
      // fixed element on bottom of screen
      if(
        windowBottom > elBottom && 
        windowBottom < containerBottom && 
        dir == "down" &&
        val.position !== "fixedBottom"
      ){
        newPos = "fixedBottom";
        css.position = "fixed";
        css.top = '';
        css.bottom = val.stickyBottom + "px";
      }

      // fixed element on top of screen
      if(
        windowTop <= elTop && 
        windowTop > containerTop && 
        dir == "up" &&
        val.position !== "fixedTop"
      ){
        newPos = "fixedTop";
        css.position = "fixed";
        css.top = val.stickyTop + "px";
        css.bottom = '';
      }

      // if we scroll up or down while element is fixed, just put element is absolution with corresponding position
      // absolute positioning element on last bottom fixed position
      if(
        windowTop <= containerBottom  && 
        windowTop > containerTop && 
        dir == "up" &&
        val.position === "fixedBottom"
      ){
        newPos = "absoluteBottom";
        css.position = "absolute";
        css.top = '';
        css.bottom = containerBottom - windowBottom + "px";
      }            

      // absolute positioning element on last top fixed position
      if(
        windowBottom > containerTop && 
        windowBottom < containerBottom && 
        dir == "down" &&
        val.position === "fixedTop"
      ){
        newPos = "absoluteTop";
        css.position = "absolute";
        css.top = windowTop - containerTop - val.el.getBoundingClientRect().top + "px";
        css.bottom = '';
      }

      // if where are on top or bottom of container
      // absolute position with top = 0
      if(
        windowTop <= val.container.offsetTop && 
        dir == "up" &&
        val.position !== "absoluteTop"
      ){
        newPos = "absoluteTop";
        css.position = 'absolute';
        css.top = 0;
        css.bottom = '';
      }

      // absolute position with bottom = 0
      if(
        windowBottom > containerBottom &&
        dir == "down" &&
        val.position !== "absoluteBottom"
      ){
        newPos = "absoluteBottom";
        css.position = 'absolute';
        css.top = ''; 
        css.bottom = 0;
      }

      if(newPos){
        setPosition(val.el, css);
        val.position = newPos;
      }
    })

    lastScroll = scroll;
    isReady = true;

  }

  /**
  * @desc set position classes for sticky element
  * @param [DOMNode] el
  * @param [object] css object with specific key value css rule
  **/
  var setPosition = (el, css) => {
    Object.keys(css).map(rule => {
      el.style[rule] = css[rule];
    })
  }

  /**
  * @desc remove every class that sticky element can have add
  * @param [object] options the list of options of element to remove for watching
  **/
  var removeSticky = options => {
    setPosition(options.el, {position:'',top:'',bottom:''});
  }

  /**
  * @desc add a sticky element
  * @param [DOMNode] el element to be sticky
  * @param [DOMNode] container containing element of sticky, parentNode if null
  * @param [number] stickyTop : height in pixel of sticky header to be placed under
  * @param [number] stickyBottom : height in pixel of sticky footer to be placed bellow
  **/
  self.add = (el, container, stickyTop = 0, stickyBottom = 0) => {
    if(!container)
      container = el.parentNode;
    if(!container.style.position || container.style.position === "static")
      container.style.position = "relative";
    list.push({el, container, stickyTop, stickyBottom, position:"absoluteTop"});
    setPosition(el, basePosition);
    handler();
  }

  /**
  * @desc remove element  of being watched
  * @param [DOMNode] el element to be sticky
  * @return [boolean] true if element is removed, false if it is not find
  **/
  self.remove = (el) => {
    var index = list.findIndex(val => val.el === el)
    removeSticky(list[index]);
    list.splice(index,1);
    return index !== -1;
  }

  /**
  * @desc trigger sticky position calcul
  **/
  self.trigger = () =>{
    handler();
  }


  init();
  return self;

})();
