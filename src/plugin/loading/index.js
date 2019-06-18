import NwdLoadingComponent from './loading';

let $vm;

export default {
  install(Vue, options) {
    if (!$vm) {
      const NwdLoadingPlugin = Vue.extend(NwdLoadingComponent);
      $vm = new NwdLoadingPlugin({
        el: document.createElement('div')
      });
    }
    $vm.show = false;
    let loading = {
      show(text) {
        $vm.show = true;
        $vm.text = text;
        document.body.appendChild($vm.$el);
      },
      hide() {
        $vm.$el.parentElement.removeChild($vm.$el);
        $vm.show = false;
      }
    };
    if (!Vue.$loading) {
      Vue.$loading = loading;
    }
    // Vue.prototype.$loading = Vue.$loading;
    Vue.mixin({
      created() {
        this.$loading = Vue.$loading;
      }
    });
  }
};
