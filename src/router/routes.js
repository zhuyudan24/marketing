import Layout from '@/components/layout';
import page401 from '@/views/error/401';
import page403 from '@/views/error/403';
import page404 from '@/views/error/404';
import page500 from '@/views/error/500';

//微信营销
import wechat from './modules/wechat';
//游戏营销
import game from './modules/game';
//短信营销
import message from './modules/message';
//卡券营销
import card from './modules/card';
//新卡券营销
// import giccard from './modules/giccard'
//智能营销
import ecm from './modules/ecm';
//模板消息
import msg from './modules/msg';
//通话中心
import calllog from './modules/calllog';
//服务监督
import evaluation from './modules/evaluation';
//计费中心
import recharge from './modules/recharge';

export default [
  {
    path: '/',
    name: 'layout',
    component: Layout,
    redirect: '/wechat/record',
    children: [card, ecm, game, message, wechat, msg, calllog, recharge, evaluation]
  },
  {
    path: '/401',
    name: '未授权',
    component: page401
  },
  {
    path: '/403',
    name: '禁止访问',
    component: page403
  },
  {
    path: '/500',
    name: '系统错误',
    component: page500
  },
  {
    path: '*',
    name: '未知领域',
    component: page404
  }
];
