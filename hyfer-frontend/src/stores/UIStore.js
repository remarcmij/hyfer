import { action, observable } from 'mobx';

export default class UIStore {

  get isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  @observable
  showAdmin = false;

  @action
  toggleShowAdmin = () => this.showAdmin = !this.showAdmin;
}
