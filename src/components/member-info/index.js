import memberInfo from './index.vue';

const gicMemberInfo = {
  install(Vue, options) {
    Vue.component(memberInfo.name, memberInfo);
  }
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(gicMemberInfo);
}
export default gicMemberInfo;
