<template>
  <el-option :value="value" :label="label" :disabled="disabled">
    <span style="float: left">{{ item.value }}</span>
    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.label }}</span>
  </el-option>
</template>

<script>
export default {
  props: {
    value: {
      required: true
    },
    label: [String, Number],
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    parent() {
      let parent = this.$parent;
      let parentName = parent.$options.componentName;
      while (parentName !== 'BDSelect') {
        parent = parent.$parent;
        parentName = parent.$options.componentName;
      }
      return parent;
    }
  },

  created() {
    this.parent.options.push({ label: this.label, value: this.value });
  }
};
</script>
