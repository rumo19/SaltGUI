import {DropDownMenu} from '../DropDown.js';
import {PageRoute} from './Page.js';
import {Route} from './Route.js';

export class MinionsRoute extends PageRoute {

  constructor(router) {
    super("^[\/]$", "Minions", "#page_minions", "#button_minions", router);
    this.keysLoaded = false;
    this.jobsLoaded = false;

    this._handleWheelKeyListAll = this._handleWheelKeyListAll.bind(this);
  }

  onShow() {
    const minions = this;

    return new Promise(function(resolve, reject) {
      minions.resolvePromise = resolve;
      if(minions.keysLoaded && minions.jobsLoaded) resolve();
      minions.router.api.getLocalGrainsItems(null).then(minions._updateMinions);
      minions.router.api.getWheelKeyListAll().then(minions._handleWheelKeyListAll);
      minions.router.api.getRunnerJobsListJobs().then(minions._handleRunnerJobsListJobs);
      minions.router.api.getRunnerJobsActive().then(minions._handleRunnerJobsActive);
      //we need these functions to populate the dropdown boxes
      minions.router.api.getWheelConfigValues().then(minions._handleWheelConfigValues);
    });
  }

  _handleWheelConfigValues(data) {
    // store for later use

    const templates = data.return[0].data.return.saltgui_templates;
    window.localStorage.setItem("templates", JSON.stringify(templates));

    const public_pillars = data.return[0].data.return.saltgui_public_pillars;
    window.localStorage.setItem("public_pillars", JSON.stringify(public_pillars));

    const preview_grains = data.return[0].data.return.saltgui_preview_grains;
    window.localStorage.setItem("preview_grains", JSON.stringify(preview_grains));

    let nodegroups = data.return[0].data.return.nodegroups;
    if(!nodegroups) nodegroups = {};
    window.localStorage.setItem("nodegroups", JSON.stringify(nodegroups));

    const output_formats = data.return[0].data.return.saltgui_output_formats;
    window.localStorage.setItem("output_formats", JSON.stringify(output_formats));

    const datetime_fraction_digits = data.return[0].data.return.saltgui_datetime_fraction_digits;
    window.localStorage.setItem("datetime_fraction_digits", JSON.stringify(datetime_fraction_digits));
  }

  _handleWheelKeyListAll(data) {
    const keys = data.return[0].data.return;

    const list = this.getPageElement().querySelector("#minions");

    const hostnames = keys.minions.sort();
    for(const hostname of hostnames) {
      this._addMinion(list, hostname, 1);

      // preliminary dropdown menu
      const element = document.getElementById(hostname);
      const menu = new DropDownMenu(element);
      this._addMenuItemStateApply(menu, hostname);

      element.addEventListener("click", evt => this._runCommand(evt, hostname, "state.apply"));
    }

    this.keysLoaded = true;
    if(this.keysLoaded && this.jobsLoaded) this.resolvePromise();
  }

  _updateOfflineMinion(container, hostname) {
    super._updateOfflineMinion(container, hostname);

    const element = document.getElementById(hostname);

    // force same columns on all rows
    element.appendChild(Route._createTd("saltversion", ""));
    element.appendChild(Route._createTd("os", ""));
    element.appendChild(Route._createTd("run-command-button", ""));
  }

  _updateMinion(container, minion, hostname) {
    super._updateMinion(container, minion, hostname);

    const element = document.getElementById(hostname);
    const menu = new DropDownMenu(element);
    this._addMenuItemStateApply(menu, hostname);

    element.addEventListener("click", evt => this._runCommand(evt, hostname, "state.apply"));
  }

  _addMenuItemStateApply(menu, hostname) {
    menu.addMenuItem("Apply&nbsp;state...", function(evt) {
      this._runCommand(evt, hostname, "state.apply");
    }.bind(this));
  }
}
