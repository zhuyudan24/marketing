<template>
  <div style="display:inline-block;">
    <el-popover class="store__popover" placement="bottom" width="200" trigger="click" v-model="popoverShow">
      <el-input slot="reference" suffix-icon="el-icon-arrow-down" :value="newModel.label" :placeholder="newModel.label ? '' : placeholder"></el-input>
      <el-tree style="height: 260px;overflow-y: auto;" ref="tree" node-key="id" :data="treeData" :highlight-current="true" @node-click="handleNodeClick"> </el-tree>
      <div class="store-btn-wrap">
        <span @click="close" class="cursor fz12 pr10 vertical-middle">取消</span>
        <el-button size="mini" type="text" @click="submit">确定</el-button>
      </div>
    </el-popover>
  </div>
</template>
<script>
import { storeGroupList } from '@/service/api/commonApi.js';
export default {
  props: {
    placeholder: {
      type: String,
      default: '请选择门店分组'
    },
    model: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      popoverShow: false,
      treeData: [],
      newModel: Object.assign({}, this.model)
    };
  },
  created() {
    this.storeGroupList();
  },
  methods: {
    async storeGroupList() {
      let res = await storeGroupList();
      const result = res.result;
      function _rec(list) {
        list.map(v => {
          v.label = v.storeGroupName;
          v.id = v.storeGroupId;
          if (v.children instanceof Array && v.children.length > 0) {
            _rec(v.children);
          }
        });
      }
      _rec(result);
      this.treeData = result;
      this.$nextTick(_ => {
        this.$refs.tree.setCurrentKey(this.newModel.id);
      });
    },
    handleNodeClick(data, node, comp) {
      this.newModel = data;
    },
    submit() {
      this.popoverShow = false;
      console.log(this.newModel);
      this.$emit('commit-store', this.newModel);
    },
    close() {
      this.popoverShow = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.store__popover {
  padding: 0;
}
.store-btn-wrap {
  text-align: right;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}
</style>
