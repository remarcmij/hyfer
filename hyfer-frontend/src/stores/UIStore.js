import { action, observable } from 'mobx';

export default class UIStore {

  @observable
  showAdmin = false;

  @action
  toggleShowAdmin = () => this.showAdmin = !this.showAdmin;
}
