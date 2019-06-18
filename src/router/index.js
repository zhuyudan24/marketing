import Vue from 'vue';
import Router from 'vue-router';
import routes from './routes';
Vue.use(Router);

let router = new Router({
  routes,
  // scrollBehavior: () => ({ y: 0 })
  //使用keep-alive标签后部分安卓机返回缓存页位置不精确问题
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition && to.meta.keepAlive) {
      return savedPosition;
    }
    const layoutRight = document.querySelector('.layout-right');
    if (layoutRight) {
      layoutRight.scrollTo(0, 0);
    }
  }
});

router.beforeEach((to, from, next) => {
  document.title = to.name;
  next();
});

export default router;
