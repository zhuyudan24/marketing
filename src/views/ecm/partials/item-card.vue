<template>
  <div class="dm-card__item__wrap">
    <div class="dm-card__item" :style="{ background: item.cardColor }">
      <img class="dm-card__item__avatar" :src="item.brandLogo || loadErrorImg" alt="" />
      <div class="inline-block">
        <p class="dm-card__item__title">{{ item.cardName }}</p>
        <p class="dm-card__item__desc" v-if="item.cardEffectiveMode !== 0">领取后第{{ item.startDay + 1 }}-{{ item.limitDay + item.startDay }}天</p>
        <p class="dm-card__item__desc" v-if="item.cardEffectiveMode === 0">{{ formatDateTimeByType(item.beginDate, 'yyyy-MM-dd') }} 至 {{ formatDateTimeByType(item.endDate, 'yyyy-MM-dd') }}</p>
      </div>
    </div>
    <p class="dm-card__item--bottom">
      <span>适用{{ item.storeMode === 0 ? '所有门店' : item.storeMode === 1 ? '部分分组' : '部分门店' }}</span>
    </p>
  </div>
</template>

<script>
import { formatDateTimeByType } from '@/utils';
export default {
  name: 'item-card',
  data() {
    return {
      formatDateTimeByType,
      // eslint-disable-next-line
      loadErrorImg: require('../../../assets/img/loaderror.png')
    };
  },
  props: {
    item: {
      type: Object,
      default() {
        return {};
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* card */
.dm-card__item__wrap {
  display: inline-block;
  position: relative;
  width: 298px;
  height: 142px;
  margin: 0 10px;
  vertical-align: middle;
  border: 1px solid rgba(228, 231, 237, 1);
  border-radius: 4px;
}
.dm-card__item {
  padding: 0 15px;
  background: rgba(72, 170, 3, 0.85);
  height: 106px;
  line-height: 106px;
}
.dm-card__item__avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  vertical-align: middle;
}

.dm-card__item__title {
  vertical-align: middle;
  margin-left: 8px;
  max-width: 180px;
  font-size: 16px;
  font-weight: 500;
  line-height: 30px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dm-card__item__desc {
  vertical-align: middle;
  margin-left: 8px;
  max-width: 200px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dm-card__item--bottom {
  vertical-align: middle;
  line-height: 106px;
  color: #909399;
  font-size: 12px;
  line-height: 36px;
  padding-left: 15px;
}
</style>
