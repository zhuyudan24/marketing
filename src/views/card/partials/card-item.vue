<template>
  <li class="card-item inline-block" :style="'border:1px solid ' + item.cardColor">
    <div class="card-item_head" :style="'background:' + item.cardColor">
      <h4>{{ item.cardName }}</h4>
      <p>{{ item.subName }}</p>
    </div>
    <div class="card-item_body">
      <div class="card-item__count clearfix">
        <div>
          <h5>{{ item.getedQuantity }}</h5>
          <p>领取数量</p>
        </div>
        <div>
          <h5>{{ item.usageQuantity }}</h5>
          <p>使用数量</p>
        </div>
        <div>
          <h5>{{ ((item.usageQuantity * 100) / (item.getedQuantity === 0 ? 1 : item.getedQuantity)).toFixed(2) }}%</h5>
          <p>核销率</p>
        </div>
        <div>
          <h5>{{ item.saleAmount }}</h5>
          <p>销售额</p>
        </div>
      </div>
      <div class="card-item__detail">
        <p class="ellipsis-100">
          有效期：<span v-if="item.cardEffectiveMode !== 0">领取后第{{ item.startDay + 1 }}-{{ item.limitDay + item.startDay }}天</span>
          <span v-if="item.cardEffectiveMode === 0">{{ formatDateTimeByType(item.beginDate, 'yyyy-MM-dd') }} 至 {{ formatDateTimeByType(item.endDate, 'yyyy-MM-dd') }}</span>
        </p>
        <p class="ellipsis-100">
          使用条件：<el-popover placement="top-start" width="200" trigger="hover" :content="item.useCondition | filterUseCondition">
            <span slot="reference" class="ellipsis-100">{{ item.useCondition | filterUseCondition }}</span>
          </el-popover>
        </p>
        <p class="ellipsis-100">
          适用门店：<span>{{ item.storeMode === 0 ? '所有门店' : item.storeMode === 1 ? '部分分组' : '部分门店' }}</span>
        </p>
        <p class="ellipsis-100">
          领取限制：<span>每人限制{{ item.cardLimit }}张</span>
        </p>
        <p class="ellipsis-100">
          卡券编号：<span>{{ item.coupCardId }}</span>
        </p>
        <p v-if="item.erpDemoCode" class="ellipsis-100">
          demo券号：<span>{{ item.erpDemoCode || '--' }}</span>
        </p>
      </div>
      <div class="card-item_foot clearfix">
        <div class="fl">
          <span v-if="item.auditingStatus !== -1"
            >剩余库存：{{ item.couponStock }} <a title="编辑库存" v-if="!shelfFlag && item.useCustomCode === 0" @click="preAdjustStock(item)"><i class="el-icon-edit"></i></a
          ></span>
        </div>
        <render-temp v-if="!shelfFlag" :item="item" @handler="handler"></render-temp>
        <a title="删除" class="fr" v-if="shelfFlag" @click="delShelf(item)"><i class="el-icon-delete"></i></a>
      </div>
    </div>
  </li>
</template>

<script>
import renderTemp from './status-render.js';
import { formatDateTimeByType } from '@/utils/index.js';
export default {
  props: {
    item: {
      type: Object,
      default() {
        return {
          cardEffectiveMode: 0
        };
      }
    },
    //是否为展架里的卡券 默认为false
    shelfFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formatDateTimeByType
    };
  },
  components: {
    'render-temp': renderTemp
  },
  methods: {
    /**
     * @param val
     * 1 投放  2 报表  3 编辑  4 删除 5 详情
     */
    handler(val) {
      switch (val) {
        case 1:
          this.$router.push({
            path: '/card/addgroupsend/' + this.item.coupCardId,
            query: {
              name: this.item.cardName
            }
          });
          break;
        case 2:
          this.$router.push('/card/analysis/' + this.item.coupCardId);
          break;
        case 3:
          this.$router.push('/card/edit/' + this.item.coupCardId);
          break;
        case 4:
          this.$emit('delete-card', this.item.coupCardId);
          break;
        case 5:
          this.$router.push('/card/info/' + this.item.coupCardId);
          break;
        case 6:
          this.$router.push('/card/copy/' + this.item.coupCardId);
          break;
      }
    },
    //编辑库存 前置
    preAdjustStock() {
      this.$emit('adjust-stock', this.item);
    },
    delShelf(obj) {
      this.$emit('del-shelf', obj);
    }
  },
  filters: {
    filterUseCondition(val) {
      var _useCondition = JSON.parse(val);
      return (typeof _useCondition.sale_limit === 'undefined' ? '' : (typeof _useCondition.sale_limit.fee === 'undefined' ? '' : (_useCondition.sale_limit.fee ? '最低消费满' + _useCondition.sale_limit.fee : '无最低消费要求') + '；') + (typeof _useCondition.sale_limit.goods === 'undefined' ? '' : '消费指定商品' + _useCondition.sale_limit.goods + '；')) + (typeof _useCondition['goods'] === 'undefined' ? '' : (typeof _useCondition.goods.ok === 'undefined' ? '' : '适用商品（' + (_useCondition.goods.ok || '无') + ')；') + (typeof _useCondition.goods.no === 'undefined' ? '' : '不适用商品（' + (_useCondition.goods.no || '无') + ')；')) + (typeof _useCondition.only === 'undefined' || _useCondition.only == 0 ? '' : '不可与其他优惠共享');
    }
  }
};
</script>
<style lang="scss" scoped>
.card-item {
  width: 340px;
  margin: 10px;
  border: 1px solid #63b359;
  border-radius: 4px;
  overflow-y: none;
  vertical-align: middle;
  min-height: 376px;
  &_head {
    width: 100%;
    text-align: center;
    color: #fff;
    background: #63b359;
    padding: 10px 0;
    h4 {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.8em;
    }
    p {
      color: #fff;
      line-height: 1.8em;
      font-size: 13px;
    }
  }
  &_body {
    .card-item__count {
      border-bottom: 1px solid #ddd;
      & > div {
        width: 50%;
        float: left;
        text-align: center;
        margin: 10px 0;
        h5 {
          font-size: 20px;
          line-height: 28px;
        }
        p {
          font-size: 12px;
          color: #999;
          line-height: 20px;
        }
      }
    }
    .card-item__detail {
      padding: 10px;
      height: 150px;
      p {
        line-height: 1.8em;
        span {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
  &_foot {
    background: #f8f9fb;
    height: 44px;
    line-height: 44px;
    padding: 0 10px;
    /deep/ a {
      color: #909399;
      &:hover {
        color: #1890ff;
      }
    }

    /deep/ i {
      font-size: 16px;
      padding-left: 2px;
      cursor: pointer;
    }
    /deep/ .el-icon-delete {
      &:hover {
        color: #f56c6c;
      }
    }
    /deep/ .fr span {
      font-size: 13px;
    }
  }
}
</style>
