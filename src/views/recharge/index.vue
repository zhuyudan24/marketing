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
    this.$store.commit('mutations_breadcrumb', [{ name: '计费中心', path: '/recharge' }]);
    this.$store.commit('aside_handler', false);
  }
};
</script>
