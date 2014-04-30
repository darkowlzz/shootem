let { ToggleButton } = require('sdk/ui/button/toggle');
let tabs = require('sdk/tabs');

function kill (tab) {
  tabs.removeListener('activate', kill);
  tab.close();
  currentTab.activate();
  button.click();
}

let currentTab = null;

let button = ToggleButton({
  id: 'shoot',
  label: 'shootem',
  icon: './icon.png',
  onChange: function(state) {
    if (state.checked) {
      currentTab = tabs.activeTab;
      console.log('activated');
      tabs.on('activate', kill);
    }
    else {
      console.log('deactivated');
      tabs.removeListener('activate', kill);
    }
  }
});
