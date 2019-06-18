//智能营销
// import ecm from '../../views/ecm';
// import ecmList from '../../views/ecm/list';
// import ecmForm from '../../views/ecm/form.vue';
// import batchList from '../../views/ecm/batch-list';
// import currentList from '../../views/ecm/current-list';

export default {
  path: 'ecm',
  name: '智能营销管理',
  component: () => import(/* webpackChunkName: "ecm" */ '../../views/ecm/index.vue'),
  redirect: '/ecm/list',
  children: [
    {
      path: 'list',
      name: '智能营销',
      component: () => import(/* webpackChunkName: "ecm" */ '../../views/ecm/list.vue'),
      meta: {
        path: '/ecm/list'
      }
    },
    {
      path: 'edit/:id',
      name: '智能营销编辑',
      component: () => import(/* webpackChunkName: "ecm" */ '../../views/ecm/form.vue'),
      meta: {
        type: 'edit',
        path: '/ecm/list'
      }
    },
    {
      path: 'add',
      name: '智能营销新增',
      component: () => import(/* webpackChunkName: "ecm" */ '../../views/ecm/form.vue'),
      meta: {
        type: 'add',
        path: '/ecm/list'
      }
    },
    {
      path: 'batchlist/:id/:name',
      name: '批次记录',
      component: () => import(/* webpackChunkName: "ecm" */ '../../views/ecm/batch-list.vue'),
      meta: {
        path: '/ecm/list'
      }
    },
    {
      path: 'currentlist/:id/:name',
      name: '实时发送记录',
      component: () => import(/* webpackChunkName: "ecm" */ '../../views/ecm/current-list.vue'),
      meta: {
        path: '/ecm/list'
      }
    }
  ]
};
