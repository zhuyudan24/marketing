<template>
  <el-popover placement="top-start" width="400" height="180" trigger="hover" @show="getSingleInfo">
    <div class="pointer" @click="linkDetail">
      <div class="singelinfo">
        <div class="singelinfo-img"><img width="100" height="100" :src="filterAvatar(singleInfo.photoUrl)" alt="" /></div>
        <div class="singelinfo-content pl10 pr10">
          <span class="lheigt"
            >{{ singleInfo.memberName }}
            <img :title="singleInfo.status == 0 ? '取消关注公众号' : singleInfo.status == 1 ? '已关注公众号' : '未关注公众号'" class="fr" :src="singleInfo.status == 0 ? gzhiconcanclegray : singleInfo.status == 1 ? gzhicon : gzhicongray" />
            <img :title="singleInfo.wxStatus == 0 ? '未使用小程序' : singleInfo.wxStatus == 1 ? '使用过小程序' : ''" class="channelicon fr mr6" :src="singleInfo.wxStatus == 0 ? xcxicongray : singleInfo.wxStatus == 1 ? xcxicon : ''" />
          </span>
          <p class="lheigth0">
            <span class="evl-right">{{ singleInfo.sex }}</span>
            <span class="evl-right">{{ singleInfo.age }}</span>
            <span :title="singleInfo.cardNo">{{ singleInfo.cardNo | formatCardName }}</span>
          </p>
          <p class="lheigth0">
            <span>{{ singleInfo.mainStoreName }}</span>
          </p>
          <div class="singelinfo-cost">
            <div class="singelinfo-costitem">
              <p>{{ singleInfo.costFee }}</p>
              <p>消费总额</p>
            </div>
            <div class="singelinfo-costitem">
              <p>{{ singleInfo.costTimes }}</p>
              <p>消费次数</p>
            </div>
            <div class="singelinfo-costitem">
              <p>{{ singleInfo.lastCost }}</p>
              <p>最近消费</p>
            </div>
          </div>
        </div>
      </div>
      <div class="singelinfo-jl  mb20 mt20">
        <a class="singelinfo-jlitem">消费记录 ({{ singleInfo.numOfSale }})</a>
        <a class="singelinfo-jlitem">营销记录 ({{ singleInfo.numOfmarket }})</a>
        <a class="singelinfo-jlitem">卡券记录 ({{ singleInfo.couponCount }})</a>
      </div>
    </div>
    <span slot="reference">
      <a :href="'/member/#/wechatmemberDetail?memberId=' + row.memberId" target="_blank">
        <img class="vertical-middle table__avatar--40" :src="filterAvatar(row.imageUrl)" width="40" height="40" alt="" srcset="" />
        <div class="inline-block vertical-middle">
          <p class="table-name--ellipsis">{{ row.memberName || '--' }}</p>
          <p class="table-name--ellipsis fz13">{{ row.cardNum || '--' }}</p>
        </div>
      </a>
    </span>
  </el-popover>
</template>

<script>
/* eslint-disable */
const host = window.location.origin;
export const baseUrl = host.indexOf('localhost') !== -1 ? 'http://gicdev.demogic.com/' : host;
export default {
  name: 'vue-gic-member-info',
  props: {
    row: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      singleInfo: {},
      defaultAvatar: require('./img/head_default.png'),
      gzhiconcanclegray: require('./img/status@gzhcanclegray.png'),
      gzhicon: require('./img/status@gzh.png'),
      gzhicongray: require('./img/status@gzhgray.png'),
      xcxicongray: require('./img/status@xcxgray.png'),
      xcxicon: require('./img/status@xcx.png')
    };
  },
  methods: {
    filterAvatar(img) {
      return img ? img.replace(/^http(s)?/, 'https') : this.defaultAvatar;
    },
    getSingleInfo() {
      this.axios({
        method: 'post',
        url: baseUrl + '/api-member/load-member-single-info?requestProject=member',
        data: JSON.stringify({ memberId: this.row.memberId }),
        headers: {
          'content-type': 'application/json;charset=utf-8'
        }
      }).then(res => {
        if (res.data.errorCode === 0) {
          this.singleInfo = res.data.result.memberSingle || {};
        }
      });
    },
    linkDetail() {
      window.open(`/member/#/wechatmemberDetail?memberId=${this.row.memberId}`);
    }
  },
  filters: {
    formatCardName(val) {
      if (val) {
        if (val.length > 10) {
          val = val.substr(0, 10) + '...';
        }
      }
      return val;
    }
  }
};
</script>
<style lang="scss">
.singelinfo {
  display: flex;
  justify-content: flex-start;
  &-img {
    flex: 0 0 100px;
  }
  &-content {
    flex: 1;
  }
  &-wrap {
    display: flex;
    flex-direction: column;
  }
  &-item {
    flex: 1;
    line-height: 0;
  }
  &-jl {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-jlitem {
    flex: 1;
    text-align: center;
  }
  &-cost {
    display: flex;
    text-align: center;
  }
  &-costitem {
    flex: 1;
  }
}

.lheigt {
  color: #303133;
  margin: 5px 0;
  span {
    color: #606266;
  }
}
</style>
