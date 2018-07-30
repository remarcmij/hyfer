import { observable, action, runInAction } from 'mobx';
import { fetchJSON } from './util';
import stores from '.';

export default class ModulesStore {

  maxDuration = 6;

  @observable
  modules = [];

  @observable
  isChanged = false;

  serverModules = [];

  @action
  async getModules() {
    try {
      this.serverModules = await fetchJSON('/api/modules');
      runInAction(() => this.setModules(this.serverModules, false));
    } catch (error) {
      stores.notification.reportError(error);
    }
  }

  @action
  setModules = (modules, isChanged = true) => {
    this.modules = [...modules];
    this.isChanged = isChanged;
  }

  @action
  addModule = (module) => {
    this.setModules([...this.modules, module]);
  }

  @action
  updateModule = (module) => {
    const modules = this.modules.map(m => m.id === module.id ? module : m);
    this.setModules(modules);
  }

  @action
  deleteModule = (module) => {
    const modules = this.modules.filter(m => m.id !== module.id);
    this.setModules(modules);
  }

  @action
  saveChanges = async () => {
    try {
      await fetchJSON('/api/modules', 'PATCH', this.modules);
      await this.getModules();
      stores.notification.reportSuccess('Your changes have been successfully saved.');
    } catch (error) {
      stores.notification.reportError(error);
    }
  }

  @action
  undoChanges = () => {
    this.setModules(this.serverModules, false);
  }
}
