<template>
  <div>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'message',
  created() {
    this.$store.commit('aside_handler', false);
    this.$nextTick(_ => {
      this.$store.commit('aside_handler', true);
    });
  }
};
</script>
