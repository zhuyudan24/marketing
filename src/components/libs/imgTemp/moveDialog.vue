<template>
  <el-dialog title="移动图片" :visible.sync="show" width="30%" :before-close="close" v-loading="loading">
    <el-select v-model="radio" placeholder="请选择">
      <el-option v-for="item in dataList" :key="item.wechatImageGroupId" :label="item.groupName" :value="item.wechatImageGroupId"> </el-option>
    </el-select>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    dataList: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      loading: false,
      radio: ''
    };
  },
  methods: {
    close() {
      this.$emit('update:show', false);
      this.radio = '';
    },
    submit() {
      if (!this.radio) {
        this.$tips({ type: 'warning', message: '请选择移入选择分组' });
        return;
      }
      this.$emit('moveFinish', this.radio);
      this.radio = '';
    }
  }
};
</script>
