(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _states = require('./components/states');

var _states2 = _interopRequireDefault(_states);

var _dialogs = require('./components/dialogs');

var _dialogs2 = _interopRequireDefault(_dialogs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* app
 ========================================================================== */

var keyCodes = {
  enter: 13,
  escape: 27,
  tab: 9
};

var testComponentType = function testComponentType(component) {
  var dataComponent = component.dataset.component;

  if (dataComponent === 'state') {
    (0, _states2.default)(component, keyCodes);
  }
  if (dataComponent === 'dialog') {
    (0, _dialogs2.default)(component, keyCodes);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  var components = document.querySelectorAll('[data-component]');

  components.forEach(function (component) {
    testComponentType(component);
  });

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (component) {
        if (typeof component.getAttribute === 'function') {
          if (component.getAttribute('data-component')) {
            testComponentType(component);
          }
        }
      });
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

},{"./components/dialogs":2,"./components/states":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dialog;
/* dialogs
 ========================================================================== */

var page = document.querySelector('.js-page');
var doc = document.querySelector('.js-document');

var openDialog = function openDialog(dialogWidget, keyCodes) {
  var focusableElems = dialogWidget.querySelectorAll('[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]');
  var firstFocusableElem = focusableElems[0];
  var secondFocusableElem = focusableElems[1];
  var lastFocusableElem = focusableElems[focusableElems.length - 1];

  dialogWidget.setAttribute('aria-hidden', false);
  doc.setAttribute('aria-hidden', true);
  page.classList.add('is-inactive');

  // return if no focusable element
  if (!firstFocusableElem) {
    return;
  }

  window.setTimeout(function () {
    if (secondFocusableElem) {
      secondFocusableElem.focus();
    } else {
      firstFocusableElem.focus();
    }

    // trapping focus inside the dialog
    focusableElems.forEach(function (focusableElem) {
      if (focusableElem.addEventListener) {
        focusableElem.addEventListener('keydown', function (event) {
          var isTabPressed = event.which === keyCodes.tab;

          if (!isTabPressed) {
            return;
          }
          if (event.shiftKey) {
            if (event.target === firstFocusableElem) {
              // shift + tab
              event.preventDefault();

              lastFocusableElem.focus();
            }
          } else if (event.target === lastFocusableElem) {
            // tab
            event.preventDefault();

            firstFocusableElem.focus();
          }
        });
      }
    });
  }, 100);
};

var closeDialog = function closeDialog(dialogWidget, dialogSrc) {
  var inception = dialogSrc.dataset.inception;

  // check if dialog is inside another dialog

  if (!inception || inception === 'false') {
    doc.setAttribute('aria-hidden', false);
    page.classList.remove('is-inactive');
  }

  dialogWidget.setAttribute('aria-hidden', true);

  // restoring focus
  dialogSrc.focus();
};

function dialog(dialogSrc, keyCodes) {
  var dialogWidget = document.querySelector('.' + dialogSrc.dataset.target);
  var dialogsToDismiss = dialogWidget.querySelectorAll('[data-dismiss]');
  var overlay = dialogSrc.dataset.overlay;

  var overlayIsEnabled = !overlay || overlay === 'true';

  // open dialog
  dialogSrc.addEventListener('click', function (event) {
    event.preventDefault();

    openDialog(dialogWidget, keyCodes);
  });

  dialogSrc.addEventListener('keydown', function (event) {
    if (event.which === keyCodes.enter) {
      event.preventDefault();

      openDialog(dialogWidget, keyCodes);
    }
  });

  // close dialog
  dialogWidget.addEventListener('keydown', function (event) {
    if (event.which === keyCodes.escape) {
      closeDialog(dialogWidget, dialogSrc);
    }
  });

  dialogsToDismiss.forEach(function (dialogToDismiss) {
    var dialogWidgetToDismiss = document.querySelector('.' + dialogToDismiss.dataset.dismiss);

    dialogToDismiss.addEventListener('click', function (event) {
      event.preventDefault();

      closeDialog(dialogWidgetToDismiss, dialogSrc);
    });
    dialogToDismiss.addEventListener('keydown', function (event) {
      if (event.which === keyCodes.enter) {
        event.preventDefault();

        closeDialog(dialogWidgetToDismiss, dialogSrc);
      }
    });
  });

  window.addEventListener('click', function (event) {
    if (event.target === dialogWidget && overlayIsEnabled) {
      closeDialog(dialogWidget, dialogSrc);
    }
  });
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = state;
/* states
 ========================================================================== */

var add = 'add';
var remove = 'remove';
var toggle = 'toggle';
var ariaAttributes = [{
  type: 'aria-hidden',
  init: true
}, {
  type: 'aria-disabled',
  init: true
}, {
  type: 'aria-selected',
  init: false
}, {
  type: 'aria-expanded',
  init: false
}, {
  type: 'aria-pressed',
  init: false
}, {
  type: 'aria-checked',
  init: false
}];

var setClass = function setClass(elem, stateClass, behaviour) {
  if (stateClass !== 'false') {
    if (behaviour === add) {
      elem.classList.add(stateClass);
    } else if (behaviour === remove) {
      elem.classList.remove(stateClass);
    } else {
      elem.classList.toggle(stateClass);
    }
  }
};

var setAria = function setAria(elem, behaviour) {
  ariaAttributes.forEach(function (ariaAttribute) {
    var type = ariaAttribute.type;
    var init = ariaAttribute.init;


    if (elem.hasAttribute(type)) {
      if (behaviour === add) {
        elem.setAttribute(type, !init);
      } else if (behaviour === remove) {
        elem.setAttribute(type, init);
      } else {
        elem.setAttribute(type, elem.getAttribute(type) !== 'true');
      }
    }
  });
};

var setTabindex = function setTabindex(elem, tabindex, behaviour) {
  if (tabindex === 'true') {
    if (behaviour === add) {
      elem.setAttribute('tabindex', 0);
    } else if (behaviour === remove) {
      elem.setAttribute('tabindex', -1);
    } else {
      elem.setAttribute('tabindex', elem.getAttribute('tabindex') === '-1' ? 0 : -1);
    }
  }
};

var setState = function setState(parameters) {
  parameters.behaviours.forEach(function (behaviour, index) {
    var elems = document.querySelectorAll('.' + parameters.targets[index]);
    var stateClass = parameters.states[index];
    var tabindex = parameters.tabindexes !== null ? parameters.tabindexes[index] : null;

    elems.forEach(function (elem) {
      if (behaviour === add) {
        setClass(elem, stateClass, add);
        setAria(elem, add);
        setTabindex(elem, tabindex, add);
      } else if (behaviour === remove) {
        setClass(elem, stateClass, remove);
        setAria(elem, remove);
        setTabindex(elem, tabindex, remove);
      } else {
        setClass(elem, stateClass, toggle);
        setAria(elem, toggle);
        setTabindex(elem, tabindex, toggle);
      }
    });
  });
};

function state(elem, keyCodes) {
  var parameters = {
    behaviours: elem.dataset.behaviour.split(', '),
    states: elem.dataset.state.split(', '),
    tabindexes: elem.dataset.tabindex ? elem.dataset.tabindex.split(', ') : null,
    targets: elem.dataset.target.split(', ')
  };

  elem.addEventListener('click', function (event) {
    event.preventDefault();

    setState(parameters);
  });
  elem.addEventListener('keydown', function (event) {
    if (event.which === keyCodes.enter) {
      event.preventDefault();

      setState(parameters);
    }
  });
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwLmpzIiwic3JjL2pzL2NvbXBvbmVudHMvZGlhbG9ncy5qcyIsInNyYy9qcy9jb21wb25lbnRzL3N0YXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7Ozs7QUFDQTs7Ozs7O0FBSkE7OztBQU1BLElBQU0sV0FBVztBQUNmLFNBQU8sRUFEUTtBQUVmLFVBQVEsRUFGTztBQUdmLE9BQUs7QUFIVSxDQUFqQjs7QUFNQSxJQUFNLG9CQUFvQixTQUFwQixpQkFBb0IsQ0FBVSxTQUFWLEVBQXFCO0FBQzdDLE1BQU0sZ0JBQWdCLFVBQVUsT0FBVixDQUFrQixTQUF4Qzs7QUFFQSxNQUFJLGtCQUFrQixPQUF0QixFQUErQjtBQUM3QiwwQkFBTSxTQUFOLEVBQWlCLFFBQWpCO0FBQ0Q7QUFDRCxNQUFJLGtCQUFrQixRQUF0QixFQUFnQztBQUM5QiwyQkFBTyxTQUFQLEVBQWtCLFFBQWxCO0FBQ0Q7QUFDRixDQVREOztBQVdBLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQU07QUFDbEQsTUFBTSxhQUFhLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLENBQW5COztBQUVBLGFBQVcsT0FBWCxDQUFtQixVQUFDLFNBQUQsRUFBZTtBQUNoQyxzQkFBa0IsU0FBbEI7QUFDRCxHQUZEOztBQUlBLE1BQU0sV0FBVyxJQUFJLGdCQUFKLENBQXFCLFVBQUMsU0FBRCxFQUFlO0FBQ25ELGNBQVUsT0FBVixDQUFrQixVQUFDLFFBQUQsRUFBYztBQUM5QixlQUFTLFVBQVQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFBQyxTQUFELEVBQWU7QUFDekMsWUFBSSxPQUFPLFVBQVUsWUFBakIsS0FBa0MsVUFBdEMsRUFBa0Q7QUFDaEQsY0FBSSxVQUFVLFlBQVYsQ0FBdUIsZ0JBQXZCLENBQUosRUFBOEM7QUFDNUMsOEJBQWtCLFNBQWxCO0FBQ0Q7QUFDRjtBQUNGLE9B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QUFUO0FBQ0QsR0FKRDtBQUtBLE9BQUssZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsVUFBQyxLQUFELEVBQVc7QUFDMUMsUUFBSSxNQUFNLEtBQU4sS0FBZ0IsU0FBUyxLQUE3QixFQUFvQztBQUNsQyxZQUFNLGNBQU47O0FBRUEsZUFBUyxVQUFUO0FBQ0Q7QUFDRixHQU5EO0FBT0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogYXBwXG4gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuaW1wb3J0IHN0YXRlIGZyb20gJy4vY29tcG9uZW50cy9zdGF0ZXMnO1xuaW1wb3J0IGRpYWxvZyBmcm9tICcuL2NvbXBvbmVudHMvZGlhbG9ncyc7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICBlbnRlcjogMTMsXG4gIGVzY2FwZTogMjcsXG4gIHRhYjogOSxcbn07XG5cbmNvbnN0IHRlc3RDb21wb25lbnRUeXBlID0gZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICBjb25zdCBkYXRhQ29tcG9uZW50ID0gY29tcG9uZW50LmRhdGFzZXQuY29tcG9uZW50O1xuXG4gIGlmIChkYXRhQ29tcG9uZW50ID09PSAnc3RhdGUnKSB7XG4gICAgc3RhdGUoY29tcG9uZW50LCBrZXlDb2Rlcyk7XG4gIH1cbiAgaWYgKGRhdGFDb21wb25lbnQgPT09ICdkaWFsb2cnKSB7XG4gICAgZGlhbG9nKGNvbXBvbmVudCwga2V5Q29kZXMpO1xuICB9XG59O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBjb25zdCBjb21wb25lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtY29tcG9uZW50XScpO1xuXG4gIGNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgdGVzdENvbXBvbmVudFR5cGUoY29tcG9uZW50KTtcbiAgfSk7XG5cbiAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgbXV0YXRpb25zLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XG4gICAgICBtdXRhdGlvbi5hZGRlZE5vZGVzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGNvbXBvbmVudC5nZXRBdHRyaWJ1dGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpZiAoY29tcG9uZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGVzdENvbXBvbmVudFR5cGUoY29tcG9uZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gIH0pO1xufSk7XG4iLCIvKiBkaWFsb2dzXG4gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuY29uc3QgcGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1wYWdlJyk7XG5jb25zdCBkb2MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtZG9jdW1lbnQnKTtcblxuY29uc3Qgb3BlbkRpYWxvZyA9IGZ1bmN0aW9uIChkaWFsb2dXaWRnZXQsIGtleUNvZGVzKSB7XG4gIGNvbnN0IGZvY3VzYWJsZUVsZW1zID0gZGlhbG9nV2lkZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tocmVmXSwgYnV0dG9uLCBpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0nKTtcbiAgY29uc3QgZmlyc3RGb2N1c2FibGVFbGVtID0gZm9jdXNhYmxlRWxlbXNbMF07XG4gIGNvbnN0IHNlY29uZEZvY3VzYWJsZUVsZW0gPSBmb2N1c2FibGVFbGVtc1sxXTtcbiAgY29uc3QgbGFzdEZvY3VzYWJsZUVsZW0gPSBmb2N1c2FibGVFbGVtc1tmb2N1c2FibGVFbGVtcy5sZW5ndGggLSAxXTtcblxuICBkaWFsb2dXaWRnZXQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcbiAgZG9jLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcbiAgcGFnZS5jbGFzc0xpc3QuYWRkKCdpcy1pbmFjdGl2ZScpO1xuXG4gIC8vIHJldHVybiBpZiBubyBmb2N1c2FibGUgZWxlbWVudFxuICBpZiAoIWZpcnN0Rm9jdXNhYmxlRWxlbSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICBpZiAoc2Vjb25kRm9jdXNhYmxlRWxlbSkge1xuICAgICAgc2Vjb25kRm9jdXNhYmxlRWxlbS5mb2N1cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaXJzdEZvY3VzYWJsZUVsZW0uZm9jdXMoKTtcbiAgICB9XG5cbiAgICAvLyB0cmFwcGluZyBmb2N1cyBpbnNpZGUgdGhlIGRpYWxvZ1xuICAgIGZvY3VzYWJsZUVsZW1zLmZvckVhY2goKGZvY3VzYWJsZUVsZW0pID0+IHtcbiAgICAgIGlmIChmb2N1c2FibGVFbGVtLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgZm9jdXNhYmxlRWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgaXNUYWJQcmVzc2VkID0gZXZlbnQud2hpY2ggPT09IGtleUNvZGVzLnRhYjtcblxuICAgICAgICAgIGlmICghaXNUYWJQcmVzc2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChldmVudC5zaGlmdEtleSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZmlyc3RGb2N1c2FibGVFbGVtKSB7IC8vIHNoaWZ0ICsgdGFiXG4gICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgbGFzdEZvY3VzYWJsZUVsZW0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gbGFzdEZvY3VzYWJsZUVsZW0pIHsgLy8gdGFiXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBmaXJzdEZvY3VzYWJsZUVsZW0uZm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LCAxMDApO1xufTtcblxuY29uc3QgY2xvc2VEaWFsb2cgPSBmdW5jdGlvbiAoZGlhbG9nV2lkZ2V0LCBkaWFsb2dTcmMpIHtcbiAgY29uc3QgeyBpbmNlcHRpb24gfSA9IGRpYWxvZ1NyYy5kYXRhc2V0O1xuXG4gIC8vIGNoZWNrIGlmIGRpYWxvZyBpcyBpbnNpZGUgYW5vdGhlciBkaWFsb2dcbiAgaWYgKCFpbmNlcHRpb24gfHwgaW5jZXB0aW9uID09PSAnZmFsc2UnKSB7XG4gICAgZG9jLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCBmYWxzZSk7XG4gICAgcGFnZS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1pbmFjdGl2ZScpO1xuICB9XG5cbiAgZGlhbG9nV2lkZ2V0LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcblxuICAvLyByZXN0b3JpbmcgZm9jdXNcbiAgZGlhbG9nU3JjLmZvY3VzKCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkaWFsb2coZGlhbG9nU3JjLCBrZXlDb2Rlcykge1xuICBjb25zdCBkaWFsb2dXaWRnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtkaWFsb2dTcmMuZGF0YXNldC50YXJnZXR9YCk7XG4gIGNvbnN0IGRpYWxvZ3NUb0Rpc21pc3MgPSBkaWFsb2dXaWRnZXQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZGlzbWlzc10nKTtcbiAgY29uc3QgeyBvdmVybGF5IH0gPSBkaWFsb2dTcmMuZGF0YXNldDtcbiAgY29uc3Qgb3ZlcmxheUlzRW5hYmxlZCA9ICFvdmVybGF5IHx8IG92ZXJsYXkgPT09ICd0cnVlJztcblxuICAvLyBvcGVuIGRpYWxvZ1xuICBkaWFsb2dTcmMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgb3BlbkRpYWxvZyhkaWFsb2dXaWRnZXQsIGtleUNvZGVzKTtcbiAgfSk7XG5cbiAgZGlhbG9nU3JjLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQud2hpY2ggPT09IGtleUNvZGVzLmVudGVyKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBvcGVuRGlhbG9nKGRpYWxvZ1dpZGdldCwga2V5Q29kZXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gY2xvc2UgZGlhbG9nXG4gIGRpYWxvZ1dpZGdldC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LndoaWNoID09PSBrZXlDb2Rlcy5lc2NhcGUpIHtcbiAgICAgIGNsb3NlRGlhbG9nKGRpYWxvZ1dpZGdldCwgZGlhbG9nU3JjKTtcbiAgICB9XG4gIH0pO1xuXG4gIGRpYWxvZ3NUb0Rpc21pc3MuZm9yRWFjaCgoZGlhbG9nVG9EaXNtaXNzKSA9PiB7XG4gICAgY29uc3QgZGlhbG9nV2lkZ2V0VG9EaXNtaXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7ZGlhbG9nVG9EaXNtaXNzLmRhdGFzZXQuZGlzbWlzc31gKTtcblxuICAgIGRpYWxvZ1RvRGlzbWlzcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY2xvc2VEaWFsb2coZGlhbG9nV2lkZ2V0VG9EaXNtaXNzLCBkaWFsb2dTcmMpO1xuICAgIH0pO1xuICAgIGRpYWxvZ1RvRGlzbWlzcy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQud2hpY2ggPT09IGtleUNvZGVzLmVudGVyKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY2xvc2VEaWFsb2coZGlhbG9nV2lkZ2V0VG9EaXNtaXNzLCBkaWFsb2dTcmMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBkaWFsb2dXaWRnZXQgJiYgb3ZlcmxheUlzRW5hYmxlZCkge1xuICAgICAgY2xvc2VEaWFsb2coZGlhbG9nV2lkZ2V0LCBkaWFsb2dTcmMpO1xuICAgIH1cbiAgfSk7XG59XG4iLCIvKiBzdGF0ZXNcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5jb25zdCBhZGQgPSAnYWRkJztcbmNvbnN0IHJlbW92ZSA9ICdyZW1vdmUnO1xuY29uc3QgdG9nZ2xlID0gJ3RvZ2dsZSc7XG5jb25zdCBhcmlhQXR0cmlidXRlcyA9IFtcbiAge1xuICAgIHR5cGU6ICdhcmlhLWhpZGRlbicsXG4gICAgaW5pdDogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIHR5cGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICBpbml0OiB0cnVlLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ2FyaWEtc2VsZWN0ZWQnLFxuICAgIGluaXQ6IGZhbHNlLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ2FyaWEtZXhwYW5kZWQnLFxuICAgIGluaXQ6IGZhbHNlLFxuICB9LFxuICB7XG4gICAgdHlwZTogJ2FyaWEtcHJlc3NlZCcsXG4gICAgaW5pdDogZmFsc2UsXG4gIH0sXG4gIHtcbiAgICB0eXBlOiAnYXJpYS1jaGVja2VkJyxcbiAgICBpbml0OiBmYWxzZSxcbiAgfSxcbl07XG5cbmNvbnN0IHNldENsYXNzID0gZnVuY3Rpb24gKGVsZW0sIHN0YXRlQ2xhc3MsIGJlaGF2aW91cikge1xuICBpZiAoc3RhdGVDbGFzcyAhPT0gJ2ZhbHNlJykge1xuICAgIGlmIChiZWhhdmlvdXIgPT09IGFkZCkge1xuICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKHN0YXRlQ2xhc3MpO1xuICAgIH0gZWxzZSBpZiAoYmVoYXZpb3VyID09PSByZW1vdmUpIHtcbiAgICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZShzdGF0ZUNsYXNzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS5jbGFzc0xpc3QudG9nZ2xlKHN0YXRlQ2xhc3MpO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3Qgc2V0QXJpYSA9IGZ1bmN0aW9uIChlbGVtLCBiZWhhdmlvdXIpIHtcbiAgYXJpYUF0dHJpYnV0ZXMuZm9yRWFjaCgoYXJpYUF0dHJpYnV0ZSkgPT4ge1xuICAgIGNvbnN0IHsgdHlwZSB9ID0gYXJpYUF0dHJpYnV0ZTtcbiAgICBjb25zdCB7IGluaXQgfSA9IGFyaWFBdHRyaWJ1dGU7XG5cbiAgICBpZiAoZWxlbS5oYXNBdHRyaWJ1dGUodHlwZSkpIHtcbiAgICAgIGlmIChiZWhhdmlvdXIgPT09IGFkZCkge1xuICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZSh0eXBlLCAhaW5pdCk7XG4gICAgICB9IGVsc2UgaWYgKGJlaGF2aW91ciA9PT0gcmVtb3ZlKSB7XG4gICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKHR5cGUsIGluaXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUodHlwZSwgZWxlbS5nZXRBdHRyaWJ1dGUodHlwZSkgIT09ICd0cnVlJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IHNldFRhYmluZGV4ID0gZnVuY3Rpb24gKGVsZW0sIHRhYmluZGV4LCBiZWhhdmlvdXIpIHtcbiAgaWYgKHRhYmluZGV4ID09PSAndHJ1ZScpIHtcbiAgICBpZiAoYmVoYXZpb3VyID09PSBhZGQpIHtcbiAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIDApO1xuICAgIH0gZWxzZSBpZiAoYmVoYXZpb3VyID09PSByZW1vdmUpIHtcbiAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIC0xKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgZWxlbS5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JykgPT09ICctMScgPyAwIDogLTEpO1xuICAgIH1cbiAgfVxufTtcblxuY29uc3Qgc2V0U3RhdGUgPSBmdW5jdGlvbiAocGFyYW1ldGVycykge1xuICBwYXJhbWV0ZXJzLmJlaGF2aW91cnMuZm9yRWFjaCgoYmVoYXZpb3VyLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLiR7cGFyYW1ldGVycy50YXJnZXRzW2luZGV4XX1gKTtcbiAgICBjb25zdCBzdGF0ZUNsYXNzID0gcGFyYW1ldGVycy5zdGF0ZXNbaW5kZXhdO1xuICAgIGNvbnN0IHRhYmluZGV4ID0gcGFyYW1ldGVycy50YWJpbmRleGVzICE9PSBudWxsID8gcGFyYW1ldGVycy50YWJpbmRleGVzW2luZGV4XSA6IG51bGw7XG5cbiAgICBlbGVtcy5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICBpZiAoYmVoYXZpb3VyID09PSBhZGQpIHtcbiAgICAgICAgc2V0Q2xhc3MoZWxlbSwgc3RhdGVDbGFzcywgYWRkKTtcbiAgICAgICAgc2V0QXJpYShlbGVtLCBhZGQpO1xuICAgICAgICBzZXRUYWJpbmRleChlbGVtLCB0YWJpbmRleCwgYWRkKTtcbiAgICAgIH0gZWxzZSBpZiAoYmVoYXZpb3VyID09PSByZW1vdmUpIHtcbiAgICAgICAgc2V0Q2xhc3MoZWxlbSwgc3RhdGVDbGFzcywgcmVtb3ZlKTtcbiAgICAgICAgc2V0QXJpYShlbGVtLCByZW1vdmUpO1xuICAgICAgICBzZXRUYWJpbmRleChlbGVtLCB0YWJpbmRleCwgcmVtb3ZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldENsYXNzKGVsZW0sIHN0YXRlQ2xhc3MsIHRvZ2dsZSk7XG4gICAgICAgIHNldEFyaWEoZWxlbSwgdG9nZ2xlKTtcbiAgICAgICAgc2V0VGFiaW5kZXgoZWxlbSwgdGFiaW5kZXgsIHRvZ2dsZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RhdGUoZWxlbSwga2V5Q29kZXMpIHtcbiAgY29uc3QgcGFyYW1ldGVycyA9IHtcbiAgICBiZWhhdmlvdXJzOiBlbGVtLmRhdGFzZXQuYmVoYXZpb3VyLnNwbGl0KCcsICcpLFxuICAgIHN0YXRlczogZWxlbS5kYXRhc2V0LnN0YXRlLnNwbGl0KCcsICcpLFxuICAgIHRhYmluZGV4ZXM6IGVsZW0uZGF0YXNldC50YWJpbmRleCA/IGVsZW0uZGF0YXNldC50YWJpbmRleC5zcGxpdCgnLCAnKSA6IG51bGwsXG4gICAgdGFyZ2V0czogZWxlbS5kYXRhc2V0LnRhcmdldC5zcGxpdCgnLCAnKSxcbiAgfTtcblxuICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHNldFN0YXRlKHBhcmFtZXRlcnMpO1xuICB9KTtcbiAgZWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LndoaWNoID09PSBrZXlDb2Rlcy5lbnRlcikge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgc2V0U3RhdGUocGFyYW1ldGVycyk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==
