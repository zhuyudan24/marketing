// import index from '../../views/calllog/index';
// import calllog from '../../views/calllog/calllog';
// import record from '../../views/calllog/record';

export default {
  path: 'calllog',
  name: '通话记录',
  component: () => import(/* webpackChunkName: "calllog" */ '../../views/calllog/index.vue'),
  meta: {},
  redirect: 'calllog/index',
  children: [
    {
      path: 'index',
      name: '通话记录',
      component: () => import(/* webpackChunkName: "calllog" */ '../../views/calllog/calllog.vue'),
      meta: {}
    },
    {
      path: 'record',
      name: '录音存储设置',
      component: () => import(/* webpackChunkName: "calllog" */ '../../views/calllog/record.vue'),
      meta: {}
    }
  ]
};
