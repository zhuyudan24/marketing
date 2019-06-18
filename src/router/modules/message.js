// 短信营销
// import message from '../../views/message';
// import form from '../../views/message/form';
// import record from '../../views/message/record';
// import temp from '../../views/message/temp';
// import addTemp from '../../views/message/addTemp';
// import recordDetail from '../../views/message/detail';

export default {
  path: 'message',
  name: '短信营销',
  component: () => import(/* webpackChunkName: "message" */ '../../views/message/index.vue'),
  meta: {},
  redirect: 'message/record',
  children: [
    {
      path: 'record',
      name: '短信群发',
      component: () => import(/* webpackChunkName: "message" */ '../../views/message/record.vue'),
      meta: {
        path: '/message/record'
      }
    },
    {
      path: 'temp',
      name: '模板库',
      component: () => import(/* webpackChunkName: "message" */ '../../views/message/temp.vue'),
      meta: {
        path: '/message/temp'
      }
    },
    {
      path: 'temp/add',
      name: '新增模板',
      component: () => import(/* webpackChunkName: "message" */ '../../views/message/addTemp.vue'),
      meta: {
        type: 'add',
        path: '/message/temp'
      }
    },
    {
      path: 'temp/edit/:id',
      name: '编辑模板',
      component: () => import(/* webpackChunkName: "message" */ '../../views/message/addTemp.vue'),
      meta: {
        type: 'edit',
        path: '/message/temp'
      }
    },
    {
      path: 'record/add',
      name: '新建群发',
      component: () => import(/* webpackChunkName: "message" */ '../../views/message/form.vue'),
      meta: {
        path: '/message/record'
      }
    },
    {
      path: 'record/detail/:id',
      name: '短信群发详情',
      component: () => import(/* webpackChunkName: "message" */ '../../views/message/detail.vue'),
      meta: {
        path: '/message/record'
      }
    }
  ]
};
