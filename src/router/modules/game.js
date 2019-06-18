//游戏营销
// import game from '../../views/game';

// import dzp from '../../views/game/dzp/index.vue';
// import dzpForm from '../../views/game/dzp/form.vue';
// import dzpRecord from '../../views/game/dzp/record.vue';

// import ggk from '../../views/game/ggk/index.vue';
// import ggkForm from '../../views/game/ggk/form.vue';
// import ggkRecord from '../../views/game/ggk/record.vue';

// import ptyx from '../../views/game/ptyx/index.vue';
// import ptyxForm from '../../views/game/ptyx/form.vue';
// import ptyxRecord from '../../views/game/ptyx/record.vue';

// import znm from '../../views/game/znm/index.vue';
// import znmForm from '../../views/game/znm/form.vue';
// import znmRecord from '../../views/game/znm/record.vue';

// import klfl from '../../views/game/klfl/index.vue';
// import klflForm from '../../views/game/klfl/form.vue';
// import klflRecord from '../../views/game/klfl/record.vue';

export default {
  path: 'game',
  name: '游戏营销',
  component: () => import(/* webpackChunkName: "game" */ '../../views/game/index.vue'),
  redirect: 'game/dzp',
  children: [
    {
      path: 'dzp',
      name: '大转盘',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/dzp/index.vue'),
      meta: {
        path: '/game/dzp'
      }
    },
    {
      path: 'dzp/add',
      name: '大转盘新增',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/dzp/form.vue'),
      meta: {
        type: 'add',
        path: '/game/dzp'
      }
    },
    {
      path: 'dzp/edit/:id',
      name: '大转盘编辑',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/dzp/form.vue'),
      meta: {
        type: 'edit',
        path: '/game/dzp'
      }
    },
    {
      path: 'dzp/detail/:id',
      name: '大转盘查看',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/dzp/form.vue'),
      meta: {
        type: 'info',
        path: '/game/dzp'
      }
    },
    {
      path: 'dzp/record/:id',
      name: '大转盘中奖记录',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/dzp/record.vue'),
      meta: {
        path: '/game/dzp'
      }
    },
    {
      path: 'ggk',
      name: '刮刮卡',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ggk/index.vue'),
      meta: {
        path: '/game/ggk'
      }
    },
    {
      path: 'ggk/add',
      name: '刮刮卡新增',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ggk/form.vue'),
      meta: {
        type: 'add',
        path: '/game/ggk'
      }
    },
    {
      path: 'ggk/edit/:id',
      name: '刮刮卡编辑',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ggk/form.vue'),
      meta: {
        type: 'edit',
        path: '/game/ggk'
      }
    },
    {
      path: 'ggk/detail/:id',
      name: '刮刮卡详情',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ggk/form.vue'),
      meta: {
        type: 'info',
        path: '/game/ggk'
      }
    },
    {
      path: 'ggk/record/:id',
      name: '刮刮卡中奖记录',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ggk/record.vue'),
      meta: {
        path: '/game/ggk'
      }
    },
    {
      path: 'ptyx',
      name: '拼图游戏',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ptyx/index.vue'),
      meta: {
        path: '/game/ptyx'
      }
    },
    {
      path: 'ptyx/add',
      name: '拼图游戏新增',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ptyx/form.vue'),
      meta: {
        type: 'add',
        path: '/game/ptyx'
      }
    },
    {
      path: 'ptyx/edit/:id',
      name: '拼图游戏编辑',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ptyx/form.vue'),
      meta: {
        type: 'edit',
        path: '/game/ptyx'
      }
    },
    {
      path: 'ptyx/query/:id',
      name: '拼图游戏详情',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ptyx/form.vue'),
      meta: {
        type: 'query',
        path: '/game/ptyx'
      }
    },
    {
      path: 'ptyx/record/:id',
      name: '拼图游戏统计',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/ptyx/record.vue'),
      meta: {
        path: '/game/ptyx'
      }
    },
    {
      path: 'znm',
      name: '找你马',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/znm/index.vue'),
      meta: {
        path: '/game/znm'
      }
    },
    {
      path: 'znm/add',
      name: '找你马新增',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/znm/form.vue'),
      meta: {
        type: 'add',
        path: '/game/znm'
      }
    },
    {
      path: 'znm/edit/:id',
      name: '找你马编辑',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/znm/form.vue'),
      meta: {
        type: 'edit',
        path: '/game/znm'
      }
    },
    {
      path: 'znm/info/:id',
      name: '找你马查看',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/znm/form.vue'),
      meta: {
        type: 'info',
        path: '/game/znm'
      }
    },
    {
      path: 'znm/record/:id',
      name: '找你马统计',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/znm/record.vue'),
      meta: {
        path: '/game/znm'
      }
    },
    {
      path: 'klfl',
      name: '口令福利',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/klfl/index.vue'),
      meta: {
        path: '/game/klfl'
      }
    },
    {
      path: 'klfl/add',
      name: '口令福利新增',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/klfl/form.vue'),
      meta: {
        type: 'add',
        path: '/game/klfl'
      }
    },
    {
      path: 'klfl/edit/:id',
      name: '口令福利编辑',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/klfl/form.vue'),
      meta: {
        type: 'edit',
        path: '/game/klfl'
      }
    },
    {
      path: 'klfl/info/:id',
      name: '口令福利查看',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/klfl/form.vue'),
      meta: {
        type: 'info',
        path: '/game/klfl'
      }
    },
    {
      path: 'klfl/record/:id',
      name: '口令福利中奖记录',
      component: () => import(/* webpackChunkName: "game" */ '../../views/game/klfl/record.vue'),
      meta: {
        path: '/game/klfl'
      }
    }
  ]
};
