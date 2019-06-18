//模板消息
// import msg from '../../views/msg/index';
// import msgList from '../../views/msg/list';
// import msgEdit from '../../views/msg/edit';

export default {
  path: 'msg',
  name: '模板消息',
  component: () => import(/* webpackChunkName: "msg" */ '../../views/msg/index.vue'),
  redirect: 'msg/list',
  children: [
    {
      path: 'list',
      name: '模板消息列表',
      component: () => import(/* webpackChunkName: "msg" */ '../../views/msg/list.vue'),
      meta: {
        path: '/msg/list'
      }
    },
    {
      path: 'edit/:id',
      name: '模板消息编辑',
      component: () => import(/* webpackChunkName: "msg" */ '../../views/msg/edit.vue'),
      meta: {
        path: '/msg/list'
      }
    }
  ]
};
