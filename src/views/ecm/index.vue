<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'ecm',
  data() {
    return {};
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '智能营销', path: '/ecm' }]);
    this.$store.commit('aside_handler', false);
  }
};
</script>
