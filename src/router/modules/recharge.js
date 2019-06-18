// import recharge from '../../views/recharge';
// import board from '../../views/recharge/board';
// import rechargeRecord from '../../views/recharge/record';
// import rechargeConsume from '../../views/recharge/consume';
// import rechargeDo from '../../views/recharge/recharge';

export default {
  path: 'recharge',
  name: '计费中心面板',
  component: () => import(/* webpackChunkName: "recharge" */ '../../views/recharge/index.vue'),
  redirect: 'recharge/board',
  children: [
    {
      path: 'board',
      name: '计费中心',
      component: () => import(/* webpackChunkName: "recharge" */ '../../views/recharge/board.vue')
    },
    {
      path: 'record',
      name: '充值记录',
      component: () => import(/* webpackChunkName: "recharge" */ '../../views/recharge/record.vue')
    },
    {
      path: 'consume/:type',
      name: '消费详情',
      component: () => import(/* webpackChunkName: "recharge" */ '../../views/recharge/consume.vue')
    },
    {
      path: 'do',
      name: '充值',
      component: () => import(/* webpackChunkName: "recharge" */ '../../views/recharge/recharge.vue')
    }
  ]
};
