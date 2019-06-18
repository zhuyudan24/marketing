// initial state
const state = {
  all: 0,
  cartData: [],
  total: 0,
  leftMenu: [],
  storeObj: {},
  asideShow: false,
  breadcrumb: [],
  layoutTips: ''
};

// getters
const getters = {
  allProducts: (state, getters, rootState) => {
    return state.all;
  },

  allCartData: state => state.cartData,

  total: state => {
    state.total = 0;
    for (let item of state.cartData) {
      state.total += item.price;
    }
    return state.total;
  }
};

// actions
const actions = {
  setAll({ commit }, data) {
    commit('mutations_setAll', data);
  },

  setCartData({ commit }, item) {
    commit('mutations_CartData', item);
  },

  removecartData({ commit }, item) {
    commit('mutations_removeCartData', item);
  }
};

// mutations
const mutations = {
  mutations_setAll(state, num) {
    state.all = num;
  },

  mutations_CartData(state, item) {
    state.cartData.push(item);
  },

  mutations_removeCartData(state, item) {
    for (let i in state.cartData) {
      if (state.cartData[i].id === item.id) {
        state.cartData.splice(i, 1);
      }
    }
  },
  aside_handler(state, val) {
    state.asideShow = val;
  },
  mutations_breadcrumb(state, val) {
    state.breadcrumb = val;
  },
  mutations_layoutTips(state, val) {
    state.layoutTips = val;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
