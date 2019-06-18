<template>
  <el-dialog title="提示" :visible.sync="show" width="30%" :before-close="close">
    <el-select v-model="value" placeholder="请选择">
      <el-option v-for="item in options" :key="item.label" :label="item.label" :value="item.label"> </el-option>
    </el-select>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    options: Array,
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      value: ''
    };
  },
  methods: {
    close() {
      this.$emit('update:show', false);
    },
    submit() {
      if (this.value) {
        this.$emit('get-data', this.value);
        this.close();
      } else {
        this.$tips({ type: 'warning', message: '未选择变量' });
      }
    }
  }
};
</script>
