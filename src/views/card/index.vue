<template>
  <div>
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'card',
  created() {
    this.$store.commit('aside_handler', false);
    this.$nextTick(_ => {
      this.$store.commit('aside_handler', true);
    });
  }
};
</script>
