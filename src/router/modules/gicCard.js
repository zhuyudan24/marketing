//卡券营销
// import card from '../../views/giccard';
// import cardList from '../../views/giccard/list';
// import cardRecord from '../../views/giccard/record';
// import cardRecordSend from '../../views/giccard/record-send';
// import cardRecordGet from '../../views/giccard/record-get';
// import cardGroupSend from '../../views/giccard/group-send';
// import cardAnalysis from '../../views/giccard/card-analysis';
// import cardInfo from '../../views/giccard/card-info';
// import cardShelf from '../../views/giccard/shelf';
// import cardManager from '../../views/giccard/card-manager';
// import cardCheck from '../../views/giccard/check';

export default {
  path: 'giccard',
  name: '卡券营销-新',
  component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/index.vue'),
  meta: {},
  redirect: 'giccard/list',
  children: [
    {
      path: 'list',
      name: '卡券库-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/list.vue'),
      meta: {}
    },
    {
      path: 'record',
      name: '卡券记录-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/record.vue'),
      meta: {},
      redirect: 'record/send',
      children: [
        {
          path: 'get',
          name: '领取记录-新',
          component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/record-get.vue'),
          meta: {}
        },
        {
          path: 'send',
          name: '投放记录-新',
          component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/record-send.vue'),
          meta: {}
        }
      ]
    },
    {
      path: 'groupsend',
      name: '新建卡券群发-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/group-send.vue'),
      meta: {
        type: 'add'
      }
    },
    {
      path: 'groupsend/:id',
      name: '卡券群发-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/group-send.vue'),
      meta: {
        type: 'edit'
      }
    },
    {
      path: 'info/:id',
      name: '编辑卡券-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/card-info.vue'),
      meta: {
        type: 'edit'
      }
    },
    {
      path: 'info',
      name: '新增卡券-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/card-info.vue'),
      meta: {
        type: 'add'
      }
    },
    {
      path: 'analysis/:id',
      name: '卡券报表-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/card-analysis.vue'),
      meta: {}
    },
    {
      path: 'shelfanalysis/:id',
      name: '卡券展架报表-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/card-analysis.vue'),
      meta: { type: 'shelf' }
    },
    {
      path: 'shelf',
      name: '卡券展架-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/shelf.vue'),
      meta: {}
    },
    {
      path: 'shelf/:id',
      name: '卡券管理-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/card-manager.vue'),
      meta: {}
    },
    {
      path: 'check',
      name: '核销纠错-新',
      component: () => import(/* webpackChunkName: "gicCard" */ '../../views/giccard/check.vue'),
      meta: {}
    }
  ]
};
