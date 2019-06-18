<template>
  <div class="layout-container" :style="{ height: bodyHeight + 'px' }">
    <vue-gic-header class="user-header-pop" style="z-index: 1999;" :projectName="projectName" :collapseFlag="collapseFlag" @collapseTag="collapseTagHandler" @toRouterView="toRouterView"></vue-gic-header>
    <div class="layout">
      <aside-menu class="layout-left" v-if="asideShow" :projectName="projectName" :leftModulesName="leftModulesName" :collapseFlag.sync="collapseFlag"></aside-menu>
      <div class="layout-right" :class="[{ asideShow: asideShow }, { collapseFlag: asideShow && collapseFlag }]">
        <div class="layout-title">
          <el-breadcrumb class="dm-breadcrumb" separator="/">
            <el-breadcrumb-item :to="{ path: '' }"><a href="/report/#/memberSummary">首页</a></el-breadcrumb-item>
            <el-breadcrumb-item :class="{ 'no-link': !v.path }" v-for="(v, i) in breadcrumb" :key="i" :to="{ path: v.path }">{{ v.name }}</el-breadcrumb-item>
          </el-breadcrumb>
          <h3>
            <span>{{ contentTitle }}</span>
            <div v-html="layoutTips" class="layout--tips--wrap"></div>
          </h3>
        </div>
        <div class="layout-content__wrap">
          <div class="layout-content" :class="[{ asideShow: asideShow }, { collapseFlag: asideShow && collapseFlag }]">
            <router-view></router-view>
          </div>
        </div>
        <vue-gic-footer></vue-gic-footer>
      </div>
    </div>
  </div>
</template>
<script>
import asideMenu from '../aside-menu';
export default {
  components: {
    asideMenu
  },
  data() {
    return {
      collapseFlag: false,
      projectName: 'marketing',
      leftModulesName: '公众号配置',
      bodyHeight: 0
    };
  },
  mounted() {
    this.bodyHeight = document.body.clientHeight || document.documentElement.clientHeight;
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    },
    contentTitle() {
      return this.$route.name;
    },
    breadcrumb() {
      return this.$store.state.marketing.breadcrumb;
    },
    layoutTips() {
      return this.$store.state.marketing.layoutTips;
    }
  },
  // watch:{
  //   asideShow(val) {
  //     this.collapseFlag =  this.asideShow;
  //   }
  // },
  methods: {
    // 处理路由跳转
    toRouterView(val) {
      this.$router.push({
        path: val.path
      });
    },
    // 折叠事件
    collapseTagHandler(val) {
      this.collapseFlag = val;
    }
  }
};
</script>
<style lang="scss">
.layout-container {
  height: 100%;
  display: flex;
}
.layout {
  display: flex;
  flex-direction: row;
  background-color: #f0f2f5;
  height: calc(100% - 64px);
  overflow-x: auto;
  overflow-y: hidden;
  margin-top: 64px;
  width: 100%;
  &-left {
    width: 200px;
    display: inline-block;
    position: fixed;
    left: 0;
    z-index: 9;
  }
  &-right {
    position: relative;
    flex: 1;
    overflow-x: auto;
    transition: width 0.5s;
    -moz-transition: width 0.5s;
    -webkit-transition: width 0.5s;
    -o-transition: width 0.5s;
    height: 100%;
    // overflow-y: auto;
    margin-left: 0px;
    min-width: 1400px;
    &.asideShow {
      min-width: 1200px;
      margin-left: 200px;
    }
    &.collapseFlag {
      min-width: 1336px;
      margin-left: 64px;
    }
  }
  &-title {
    background: #fff;
    padding: 15px 0 0 30px;
    border-bottom: 1px solid #e4e7ed;
    h3 {
      color: #303133;
      font-size: 20px;
      padding: 24px 0;
      font-weight: 500;
    }
  }
  &-content__wrap {
    // overflow-y: auto;
    position: relative;
    top: -1px;
    min-height: calc(100% - 200px);
    &::-webkit-scrollbar {
      display: none;
    }
  }
  &--tips--wrap {
    margin-right: 24px;
  }
  &--tips {
    margin-top: 24px;
    padding: 8px 16px;
    line-height: 1.5;
    font-size: 13px;
    border-radius: 4px;
    color: #606266;
    background-color: #f4f4f5;
    i {
      margin-right: 4px;
      color: #1890ff;
    }
    &__content {
      display: inline-block;
      vertical-align: middle;
      width: calc(100% - 50px);
      p {
        color: #606266;
      }
    }
  }
}
.dm-breadcrumb {
  display: inline-block;
  vertical-align: middle;
}

.user-header-pop {
  min-width: 95px;
}
.el-popover.user-header-pop {
  min-width: 95px;
}
</style>
