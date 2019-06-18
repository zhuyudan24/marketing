<template>
  <el-dialog title="修改库存" :visible.sync="show" width="30%" :before-close="close" append-to-body>
    <div>
      <span class="mr20">库存数量</span><el-radio v-model="calculate" :label="true">增加</el-radio>
      <el-radio v-model="calculate" :label="false">减少</el-radio>
      <div class="pt20" style="margin-left:76px;">
        <el-input-number controls-position="right" :min="0" v-model="count" class="w200 block-center" size="small" @blur="checkCalc"></el-input-number>
      </div>
      <div class="pt20">
        <span class="fz14">剩余库存：</span>
        <span>{{ calculate ? parseInt(totalCount) + parseInt(count) : parseInt(totalCount) - parseInt(count) }}</span>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { updateCardStock } from '@/service/api/cardApi.js';
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
    coupCardId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      count: 0,
      calculate: true
    };
  },
  watch: {
    calculate(val) {
      this.count = 0;
    }
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
      this.count = 0;
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
        coupCardId: this.coupCardId
      };
      updateCardStock(params).then(res => {
        if (res.errorCode === 0) {
          this.$emit('refresh', this.calculate ? parseInt(this.totalCount) + parseInt(this.count) : parseInt(this.totalCount) - parseInt(this.count));
          this.close();
        } else {
          this.tips({ type: 'warning', message: res.message || '调整库存出错' });
        }
      });
    }
  }
};
</script>
