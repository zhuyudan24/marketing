// import evalIndex from '../../views/evaluation';
// import newest from '../../views/evaluation/newest';
// import evalCharts from '../../views/evaluation/charts';
// import suggestion from '../../views/evaluation/suggestion';
// import problem from '../../views/evaluation/problem';

export default {
  path: 'evaluation',
  name: '服务监督',
  component: () => import(/* webpackChunkName: "evaluation" */ '../../views/evaluation/index.vue'),
  redirect: '/evaluation/newest',
  children: [
    {
      path: 'index',
      name: '最新评价',
      // component: newest,
      redirect: '/evaluation/newest',
      meta: {
        path: '/evaluation/newest'
      }
    },
    {
      path: 'newest',
      name: '最新评价',
      component: () => import(/* webpackChunkName: "evaluation" */ '../../views/evaluation/newest.vue'),
      meta: {
        path: '/evaluation/newest'
      }
    },
    {
      path: 'charts',
      name: '评论概览',
      component: () => import(/* webpackChunkName: "evaluation" */ '../../views/evaluation/charts.vue'),
      meta: {
        path: '/evaluation/charts'
      }
    },
    {
      path: 'bad/:type',
      name: '差评详情',
      component: () => import(/* webpackChunkName: "evaluation" */ '../../views/evaluation/newest.vue'),
      meta: {
        type: 'bad',
        path: '/evaluation/charts'
      }
    },
    {
      path: 'suggestion',
      name: '投诉与建议',
      component: () => import(/* webpackChunkName: "evaluation" */ '../../views/evaluation/suggestion.vue'),
      meta: {
        path: '/evaluation/suggestion'
      }
    },
    {
      path: 'suggestion/:id',
      name: '投诉与建议处理',
      component: () => import(/* webpackChunkName: "evaluation" */ '../../views/evaluation/problem.vue'),
      meta: {
        path: '/evaluation/suggestion'
      }
    },
    {
      path: 'suggestion/info/:id',
      name: '投诉与建议处理',
      component: () => import(/* webpackChunkName: "evaluation" */ '../../views/evaluation/problem.vue'),
      meta: {
        type: 'info',
        path: '/evaluation/suggestion'
      }
    }
  ]
};
