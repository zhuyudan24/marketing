<template>
  <section>
    <draggable class="drag-list" v-model="copylist" :options="{ group: 'people' }" @start="drag = true" @end="getSortData">
      <div class="drag-item" v-for="(v, i) in copylist" :key="i">
        <div class="drag-item--preview clearfix" v-show="v.flag" @mouseover="v.maskShow = true" @mouseout="v.maskShow = false">
          <div class="drag-item--editor__left fl">
            <div class="drag-item--editor__opt">
              <div class="drag-item--img" :style="'background-image:url(' + v.imgUrl + ')'"></div>
            </div>
          </div>
          <div class="drag-item--editor__right fl pl20">
            <div class="drag-item--content">
              <p>{{ v.text }}</p>
            </div>
          </div>
        </div>
        <div class="drag-item--editor clearfix" v-show="!v.flag">
          <div class="drag-item--editor__left fl">
            <div class="drag-item--editor__opt">
              <el-upload-wrap :imgUrl.sync="v.copyImgUrl" :imgCode.sync="v.copyImgCode"></el-upload-wrap>
            </div>
          </div>
          <div class="drag-item--editor__right fl pl20">
            <dm-input type="textarea" :rows="10" v-model="v.copyText" :maxlength="5000"></dm-input>
          </div>
          <div class="text-right pt20 fr">
            <el-button size="small" @click="cancel(v, i)">取消</el-button>
            <el-button size="small" type="primary" @click="confirm(v)">确认</el-button>
          </div>
        </div>
        <div class="drag-item--mask" v-show="v.maskShow" @mouseover="v.maskShow = true" @mouseout="v.maskShow = false">
          <i class="el-icon-rank"></i>
          <span>可拖拽排序</span>
        </div>
        <div class="drag-item--opt" v-show="v.flag">
          <i class="el-icon-edit" @click="edit(v, i)"></i>
          <i class="el-icon-delete" @click="del(v, i)"></i>
        </div>
      </div>
    </draggable>
    <div class="add--opt__icon" @click="addImgText">
      <i class="el-icon-plus"></i>
      <span>添加图文</span>
    </div>
  </section>
</template>

<script>
import draggable from 'vuedraggable';
import elUploadWrap from '@/components/upload/el-upload-wrap';
export default {
  name: 'imgtext-drag',
  props: {
    list: Array,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    draggable,
    elUploadWrap
  },
  data() {
    return {
      drag: true,
      copylist: []
    };
  },
  watch: {
    list(val) {
      this.copylist = this.list.slice(0);
    }
  },
  methods: {
    addImgText() {
      if (this.disabled) {
        this.$tips({ type: 'warning', message: '审核通过的卡券不能修改图文' });
        return;
      }
      this.list.push({
        flag: false,
        maskShow: false,
        copyImgUrl: '',
        copyText: '',
        copyImgCode: '',
        imgUrl: '',
        imgCode: '',
        text: ''
      });
    },
    edit(v) {
      if (this.disabled) {
        this.$tips({ type: 'warning', message: '审核通过的卡券不能修改图文' });
        return;
      }
      v.flag = false;
      v.copyImgCode = v.imgCode;
      v.copyText = v.text;
      v.copyImgUrl = v.imgUrl;
    },
    confirm(v) {
      v.flag = true;
      v.imgCode = v.copyImgCode;
      v.text = v.copyText;
      v.imgUrl = v.copyImgUrl;
      this.$emit('update:list', this.copylist);
    },
    cancel(v, i) {
      v.flag = true;
      if (!v.imgUrl && !v.text) {
        this.copylist.splice(i, 1);
      }
      this.$emit('update:list', this.copylist);
    },
    del(v, i) {
      if (this.disabled) {
        this.$tips({ type: 'warning', message: '审核通过的卡券不能修改图文' });
        return;
      }
      this.$confirm('是否删除该图文消息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.list.splice(i, 1);
          this.$tips({ type: 'success', message: '删除成功!' });
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消删除' });
        });
    },
    getSortData(val) {
      this.$nextTick(_ => {
        this.$emit('update:list', this.copylist);
      });
      this.drag = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.drag-list {
  width: 908px;
}
.drag-item {
  position: relative;
  border-bottom: 4px solid #fff;
  min-width: 1000px;
  &:last-child {
    border-bottom: none;
  }
  &--editor {
    display: inline-block;
    vertical-align: middle;
    background: #f0f2f5;
    padding: 15px;
    width: 888px;
    &__opt {
      width: 397px;
      height: 222px;
    }
    &__right {
      width: 470px;
      height: 222px;
    }
  }
  &--preview {
    display: inline-block;
    vertical-align: middle;
    background: #f0f2f5;
    padding: 15px;
  }
  &--content {
    width: 470px;
    height: 222px;
    background: #fff;
    line-height: 1.5;
    border-radius: 4px;
    p {
      padding: 15px;
    }
  }
  &--img {
    width: 397px;
    height: 222px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
  &--mask {
    width: 878px;
    height: 222px;
    background: rgba(0, 0, 0, 0.6);
    position: absolute;
    top: 15px;
    left: 15px;
    cursor: move;
    color: #fff;
    line-height: 222px;
    text-align: center;
    span {
      font-size: 16px;
      vertical-align: middle;
    }
    i {
      font-size: 23px;
      vertical-align: middle;
    }
  }
  &--opt {
    display: inline-block;
    vertical-align: middle;
    padding-left: 10px;
    i {
      cursor: pointer;
      font-size: 19px;
      color: #909399;
      padding: 5px;
      &:hover {
        color: #1890ff;
      }
    }
    .el-icon-delete {
      &:hover {
        color: #f56c6c;
      }
    }
  }
}

.add--opt__icon {
  width: 915px;
  height: 61px;
  border: 1px dashed #e1e1e1;
  text-align: center;
  margin: 10px 0;
  line-height: 61px;
  color: #8c939d;
  cursor: pointer;
  &:hover {
    border: 1px dashed #1890ff;
    color: #1890ff;
  }
  i {
    font-size: 18px;
    text-align: center;
    vertical-align: middle;
  }
  span {
    vertical-align: middle;
  }
}
</style>
