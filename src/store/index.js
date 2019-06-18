import Vue from 'vue';
import Vuex from 'vuex';

import marketing from './modules/marketing';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    marketing
  }
});
