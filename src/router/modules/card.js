//卡券营销
// import card from '../../views/card';
// import cardList from '../../views/card/list';
// import cardRecord from '../../views/card/record';
// import cardRecordSend from '../../views/card/record-send';
// import cardRecordSendInfo from '../../views/card/record-send-info';
// import cardRecordGet from '../../views/card/record-get';
// import cardRecordCache from '../../views/card/record-cache';
// import cardGroupSend from '../../views/card/group-send';
// import cardAnalysis from '../../views/card/analysis';
// import cardForm from '../../views/card/form.vue';
// import cardShelf from '../../views/card/shelf';
// import cardManager from '../../views/card/manager';
// import cardCheck from '../../views/card/check';

export default {
  path: 'card',
  name: '卡券营销',
  component: () => import(/* webpackChunkName: "card" */ '../../views/card/index.vue'),
  meta: {},
  redirect: 'card/list',
  children: [
    {
      path: 'list',
      name: '卡券库',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/list.vue'),
      meta: {
        path: '/card/list'
      }
    },
    {
      path: 'record',
      name: '卡券记录',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/record.vue'),
      meta: {},
      redirect: 'record/send',
      children: [
        {
          path: 'get',
          name: '领取记录',
          component: () => import(/* webpackChunkName: "card" */ '../../views/card/record-get.vue'),
          meta: {
            path: '/card/record/get'
          }
        },
        {
          path: 'send',
          name: '投放记录',
          component: () => import(/* webpackChunkName: "card" */ '../../views/card/record-send.vue'),
          meta: {}
        },
        {
          path: 'sendInfo/:id',
          name: '投放记录详情',
          component: () => import(/* webpackChunkName: "card" */ '../../views/card/record-send-info.vue'),
          meta: {
            type: 'send',
            path: '/card/record/send'
          }
        },
        {
          path: 'cache',
          name: '临时领取记录',
          component: () => import(/* webpackChunkName: "card" */ '../../views/card/record-cache.vue'),
          meta: {}
        }
      ]
    },
    {
      path: 'groupsend',
      name: '新建卡券群发',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/group-send.vue'),
      meta: {
        type: 'add'
      }
    },
    {
      path: 'groupsend/:id',
      name: '卡券群发',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/group-send.vue'),
      meta: {
        type: 'edit',
        path: '/card/record/send'
      }
    },
    {
      path: 'addgroupsend/:id',
      name: '卡券投放',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/group-send.vue'),
      meta: {
        type: 'send',
        path: '/card/list'
      }
    },
    {
      path: 'groupinfo/:id',
      name: '卡券群发详情',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/group-send.vue'),
      meta: {
        type: 'info',
        path: '/card/record/send'
      }
    },
    {
      path: 'edit/:id',
      name: '卡券编辑',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/form.vue'),
      meta: {
        type: 'edit',
        path: '/card/list'
      }
    },
    {
      path: 'info/:id',
      name: '卡券详情',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/form.vue'),
      meta: {
        type: 'info',
        path: '/card/record/get'
      }
    },
    {
      path: 'copy/:id',
      name: '卡券复制',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/form.vue'),
      meta: {
        type: 'copy',
        path: '/card/record/get'
      }
    },
    {
      path: 'add',
      name: '新增卡券',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/form.vue'),
      meta: {
        type: 'add',
        path: '/card/list'
      }
    },
    {
      path: 'analysis/:id',
      name: '卡券报表',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/analysis.vue'),
      meta: {
        path: '/card/list'
      }
    },
    {
      path: 'shelfanalysis/:id',
      name: '卡券展架报表',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/analysis.vue'),
      meta: {
        type: 'shelf',
        path: '/card/shelf'
      }
    },
    {
      path: 'shelf',
      name: '卡券展架',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/shelf.vue'),
      meta: {
        path: '/card/shelf'
      }
    },
    {
      path: 'shelf/:id',
      name: '卡券管理',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/manager.vue'),
      meta: {
        path: '/card/shelf'
      }
    },
    {
      path: 'check',
      name: '核销纠错',
      component: () => import(/* webpackChunkName: "card" */ '../../views/card/check.vue'),
      meta: {
        path: '/card/check'
      }
    }
  ]
};
