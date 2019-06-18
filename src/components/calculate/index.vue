<template>
  <el-dialog title="修改数量" :visible.sync="show" width="30%" :before-close="close" append-to-body>
    奖品数量 <el-radio v-model="calculate" :label="true">增加</el-radio>
    <el-radio v-model="calculate" :label="false">减少</el-radio>
    <div class="text-center pt10">
      <el-input-number controls-position="right" :min="0" v-model="count" class="w200 block-center" @blur="checkCalc"></el-input-number>
      <span class="fz14 pl20">结果：</span>
      <span>{{ calculate ? parseInt(totalCount) + parseInt(count) : parseInt(totalCount) - parseInt(count) }}</span>
    </div>
    <div class="text-center pt10"></div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { updatePrizeStock } from '@/service/api/gameApi.js';
export default {
  props: {
    totalCount: {
      type: Number,
      default: 0
    },
    show: {
      type: Boolean,
      default: false
    },
    prizeReferType: {
      type: Number,
      default: 0
    },
    prizeId: {
      type: String,
      default: ''
    },
    prizeReferId: {
      type: String,
      default: ''
    },
    useStrategy: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      count: 0,
      calculate: true
    };
  },
  methods: {
    checkCalc() {
      if (!this.calculate) {
        if (this.count > this.totalCount) {
          this.count = this.totalCount;
          this.$tips({ type: 'warning', message: '输入数量不能大于总数' });
        }
      }
    },
    close() {
      this.$emit('update:show', false);
      // this.count = 0;
    },
    submit() {
      if (!this.calculate) {
        if (this.count > this.totalCount) {
          this.count = this.totalCount;
          this.$tips({ type: 'warning', message: '输入数量不能大于总数' });
          return;
        }
      }

      let params = {
        optType: this.calculate ? 1 : 2, //是	int	1: 增加; 2: 减少
        addCount: this.count, //是	int	增加或者减少数量
        prizeReferType: this.prizeReferType, //	是	int	奖品类型: 积分: 1; 卡券: 2; 礼品: 3
        useStrategy: this.useStrategy, //是	int	首奖特殊策略: 1; 奖项设置: 0
        prizeReferId: this.prizeReferType === 1 ? null : this.prizeReferId, //是	string	卡券, 礼品都存在, 积分传null
        prizeId: this.prizeId
      };
      updatePrizeStock(params).then(res => {
        this.$emit('countRefresh', { calc: this.calculate, num: this.count });
      });

      this.close();
    }
  }
};
</script>
