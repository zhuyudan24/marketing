<template>
  <div class="nwd-loading" v-show="show">
    <div>{{ text }}</div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    text: '正在加载中...'
  }
};
</script>
<style lang="scss" scoped>
.nwd-loading {
  width: 100%;
  height: 100%;
  position: fixed;
  background: #fff;
  top: 0;
  left: 0;
  z-index: 999;
}
</style>
