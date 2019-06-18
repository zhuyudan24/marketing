<template>
  <div id="app">
    <keep-alive :include="include">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      include: []
    };
  }
};
</script>

<style lang="scss">
@import './assets/theme/index.css';
@import './assets/style/base/index.scss';
@import './assets/iconfont/iconfont.css';
#app {
  height: 100%;
  background-color: #f0f2f5;
}
</style>
