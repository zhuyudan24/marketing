<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'wechat',
  data() {
    return {};
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理' }, { name: '微信营销', path: '/wechat' }, { name: '素材库', path: '' }]);
    this.$store.commit('aside_handler', false);
    this.$nextTick(_ => {
      this.$store.commit('aside_handler', true);
    });
  }
};
</script>
