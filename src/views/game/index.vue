<template>
  <div>
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'game',
  created() {
    this.$store.commit('aside_handler', false);
    this.$nextTick(_ => {
      this.$store.commit('aside_handler', true);
    });
  }
};
</script>
