<template>
  <div>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'msg',
  created() {
    this.$store.commit('aside_handler', false);
  }
};
</script>
