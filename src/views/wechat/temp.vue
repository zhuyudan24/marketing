<template>
  <router-view></router-view>
</template>
<script>
export default {
  name: 'wechat-temp',
  data() {
    return {};
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理' }, { name: '微信营销', path: '' }, { name: '素材库', path: '' }]);
  }
};
</script>
