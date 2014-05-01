let { ToggleButton } = require('sdk/ui/button/toggle');
let tabs = require('sdk/tabs');
const { defer } = require('sdk/core/promise');
const { Cc, Ci } = require('chrome');

const wm = Cc['@mozilla.org/appshell/window-mediator;1']
         .getService(Ci.nsIWindowMediator);

let shoot = new Shooter();

function Shooter() {
  this.currentTab = null;

  this.Target = new Target();

  this.kill = (tab) => {
    tabs.removeListener('activate', this.kill);
    tab.close();
    this.currentTab.activate();
    this.button.click();
  }

  this.button = ToggleButton({
    id: 'shoot',
    label: 'shootem',
    icon: './icon.png',
    onChange: (state) => {
      if (state.checked) {
        this.currentTab = tabs.activeTab;
        this.Target.getReady();
        console.log('activated');
        tabs.on('activate', this.kill);
      }
      else {
        this.Target.dismiss();
        console.log('deactivated');
        tabs.removeListener('activate', this.kill);
      }
    }
  }); 
}

function Target() {
  this.windows = [];
  this.curTabbrowser = null;
  this.tabbrowsers = [];

  this.enumToArray = (enumerator) => {
    let array = new Array();
    while (enumerator.hasMoreElements()) {
      array.push(enumerator.getNext());
    }
    return array;
  }

  // Get an array of all the existing browser windows.
  this.getWindows = () => this.enumToArray(wm.getEnumerator('navigator:browser'));

  // Attach target listeners on all the windows.
  this.getReady = () => {
    this.tabbrowsers = [];
    this.windows = this.getWindows();
    this.windows.forEach(this.magic);
  }

  // Remove target listeners from all the windows.
  this.dismiss = () => {
    console.log('dismissing');
    this.tabbrowsers.forEach(this.clear);
  }

  // Set the cursor to crosshair.
  this.addCrosshair = () => {
    this.curTabbrowser.style.cursor = 'crosshair';
  }

  // Ser the cursor to default.
  this.removeCrosshair = () => {
    this.curTabbrowser.style.cursor = 'default';
  }

  // Perform listener attachment
  this.magic = (window) => {
    console.log('a window');
    this.onLoaded(window).then(({ document }) => {
      this.curTabbrowser = document.querySelector('#tabbrowser-tabs');
      this.curTabbrowser.addEventListener('mouseover', this.addCrosshair);
      this.curTabbrowser.addEventListener('mouseleave', this.removeCrosshair);

      this.tabbrowsers.push(this.curTabbrowser);
    });
  }

  // Perform listener removal
  this.clear = (tabbrowser) => {
    console.log('inside clear');
    tabbrowser.removeEventListener('mouseover', this.addCrosshair);
    tabbrowser.removeEventListener('mouseleave', this.removeCrosshair);
    tabbrowser.style.cursor = 'default';
  }


  this.onLoaded = (window) => {
    let deferred = defer();
    if (window.document.readyState = 'complete')
      deferred.resolve(window);
    else {
      let onWindowLoad = (event) => {
        window.removeEventListener('load', onWindowLoad);
        deferred.resolve(window);
      };
      window.addEventListener('load', onWindowLoad);
    }
    return deferred.promise;
  }
}
