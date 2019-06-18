// import wechat from '../../views/wechat/index';
// import record from '../../views/wechat/record';
// import wechatTemp from '../../views/wechat/temp';
// import imgTextTemp from '../../components/libs/imgTextTemp';
// import imgTemp from '../../components/libs/imgTemp';
// import audioTemp from '../../views/wechat/audio/index.vue';
// import videoTemp from '../../views/wechat/video/index.vue';
// import videoAddEdit from '../../views/wechat/video/addEdit';
// import form from '../../views/wechat/form';
// import editor from '../../views/wechat/editor';

export default {
  path: 'wechat',
  name: '微信营销',
  component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/index.vue'),
  redirect: 'wechat/record',
  meta: {},
  children: [
    {
      path: 'record',
      name: '发送记录',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/record.vue'),
      meta: {
        path: '/wechat/record'
      }
    },
    {
      path: 'record/add',
      name: '新建群发',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/form.vue'),
      meta: {
        type: 'add',
        path: '/wechat/record'
      }
    },
    {
      path: 'record/edit/:id',
      name: '编辑群发',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/form.vue'),
      meta: {
        type: 'edit',
        path: '/wechat/record'
      }
    },
    {
      path: 'record/info/:id',
      name: '群发详情',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/form.vue'),
      meta: {
        type: 'info',
        path: '/wechat/record'
      }
    },
    {
      path: 'record/add/:id',
      name: '使用图文群发',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/form.vue'),
      meta: {
        type: 'imgText',
        path: '/wechat/temp/imgtext'
      }
    },
    {
      path: 'editor/:id',
      name: '编辑图文',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/editor.vue'),
      meta: {
        type: 'edit',
        path: '/wechat/temp/imgtext'
      }
    },
    {
      path: 'editor',
      name: '新建图文',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/editor.vue'),
      meta: {
        type: 'add',
        path: '/wechat/temp/imgtext'
      }
    },
    {
      path: 'temp',
      name: '素材库',
      component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/temp.vue'),
      redirect: 'temp/imgtext',
      meta: {},
      children: [
        {
          path: 'imgtext',
          name: '图文',
          component: () => import(/* webpackChunkName: "wechat" */ '../../components/libs/imgTextTemp/index.vue'),
          meta: {
            path: '/wechat/temp/imgtext'
          }
        },
        {
          path: 'img',
          name: '图片',
          component: () => import(/* webpackChunkName: "wechat" */ '../../components/libs/imgTemp/index.vue'),
          meta: {
            path: '/wechat/temp/img'
          }
        },
        {
          path: 'audio',
          name: '语音',
          component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/audio/index.vue'),
          meta: {
            path: '/wechat/temp/audio'
          }
        },
        {
          path: 'video',
          name: '视频',
          component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/video/index.vue'),
          meta: {
            path: '/wechat/temp/video'
          }
        },
        {
          path: 'video/add',
          name: '新增视频',
          component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/video/addEdit.vue'),
          meta: {
            type: 'add',
            path: '/wechat/temp/video'
          }
        },
        {
          path: 'video/edit/:id',
          name: '编辑视频',
          component: () => import(/* webpackChunkName: "wechat" */ '../../views/wechat/video/addEdit.vue'),
          meta: {
            type: 'edit',
            path: '/wechat/temp/video'
          }
        }
      ]
    }
  ]
};
