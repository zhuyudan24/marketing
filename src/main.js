import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import { axios } from './service/api/index';
import directives from './directives';

Vue.config.productionTip = false;

if (process.env.NODE_ENV == 'development') { // eslint-disable-line
  Vue.config.devtools = true;
} else {
  Vue.config.devtools = false;
}

Vue.prototype.axios = axios;
Vue.prototype.axios.withCredentials = true;
Object.keys(directives).map(item => Vue.directive(item, directives[item]));
window.$bus = new Vue();
let flag = false;
Vue.prototype.$tips = function({ message = '提示', type = 'success' }) {
  if (flag) {
    return;
  } else {
    this.$message({ message, type });
  }
  flag = true;
  setTimeout(_ => {
    flag = false;
  }, 1000);
};

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
