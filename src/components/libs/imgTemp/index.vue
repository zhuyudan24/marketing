<template>
  <section class="dm-wrap dm-ilib clearfix">
    <nav>
      <h4 class="text-left pl10">
        <el-button style="font-weight: 500;" size="small" type="text" icon="el-icon-plus" @click.stop="addGroup">新建分组</el-button>
      </h4>
      <ul class="dm-ilib-category" :style="scrollStyle">
        <li v-for="(v, i) in groupsList" :key="i" @click="changeCate(v)" :class="{ active: listParams.wechatImageGroupId === v.wechatImageGroupId }">
          <span class="ellipsis-80">{{ v.groupName || '' }}</span
          ><span class="fz10 gray"> ({{ v.imageCount }})</span>
        </li>
      </ul>
    </nav>
    <article>
      <div class="dm-ilib-header">
        <h4>
          {{ listParams.wechatImageGroupId ? currentGroup.groupName : '所有图片' }}
          <i v-if="listParams.wechatImageGroupId" class="el-icon-edit" @click="editGroup"></i>
          <i v-if="listParams.wechatImageGroupId" class="el-icon-delete" @click="delGroup"></i>
        </h4>
        <div class="dm-ilib-opt_right">
          <span class="fz12 gray pr10">大小不超过2M</span>
          <label class="el-button el-button--primary el-button--small" :class="{ 'is-disabled': upLoadDisabled }"
            >{{ upLoadDisabled ? '上传中...' : '本地上传' }}
            <input type="file" style="display:none;" :disabled="upLoadDisabled" accept="image/gif, image/jpeg,image/png" ref="uploader" v-imglibupload="this" />
          </label>
        </div>
      </div>
      <div class="dm-ilib-opt">
        <div class="dm-ilib-opt_left">
          <el-checkbox style="background:#fff;" :indeterminate="isIndeterminate" v-model="checkAll" label="全选" border @change="handleCheckAllChange"></el-checkbox>
          <el-button class="pl20" type="text" @click="moveImgGroupBatch">移动分组</el-button>
          <el-button type="text" @click="delBatchImg">删除</el-button>
        </div>
      </div>
      <el-checkbox-group v-loading="loading" :isIndeterminate="isIndeterminate" v-model="checkedList" @change="handlecheckedListChange" class="clearfix img-item__wrap" :style="scrollStyle">
        <img-item v-for="(v, i) in imgList" :key="i" :imgData="v" @refresh="loadImgList" @delSingleImg="delImg" @moveSingleImg="moveImgGroup"></img-item>
      </el-checkbox-group>
      <el-pagination v-show="imgList.length" background class="dm-pagination pb20 pr20" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    </article>
    <dm-move-dialog :show.sync="moveDialogShow" :dataList="groupsMoveList" @moveFinish="moveFinish"></dm-move-dialog>
  </section>
</template>

<script>
import imgItem from './imgItem';
import dmMoveDialog from './moveDialog';
import { loadImgList, updateGroupName, addGroupService, deleteGroupService, deleteImageService, changeGroupService } from '@/service/api/wechatApi.js';

export default {
  name: 'dm-ilib',
  props: {
    scrollStyle: Object
  },
  created() {
    this.loadImgList();
  },
  data() {
    return {
      upLoadDisabled: false,
      checkAll: false,
      imgList: [],
      listParams: {
        currentPage: 1,
        pageSize: 20,
        wechatImageGroupId: ''
      },
      total: 0,
      checkedList: [],
      checkedOptions: [],
      groupsList: [],
      groupsMoveList: [],
      isIndeterminate: false,
      moveDialogShow: false,
      loading: true,
      currentGroup: { groupName: '--' },
      moveImgVal: '',
      fileList: []
    };
  },
  components: {
    imgItem,
    dmMoveDialog
  },
  methods: {
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.loadImgList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.loadImgList();
    },
    changeCate(v) {
      this.listParams.wechatImageGroupId = v.wechatImageGroupId;
      this.loadImgList();
    },
    handleCheckAllChange(val) {
      this.checkedList = val ? this.checkedOptions : [];
      this.isIndeterminate = false;
    },
    handlecheckedListChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.checkedOptions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.checkedOptions.length;
    },
    async loadImgList() {
      this.loading = true;
      let res = await loadImgList(this.listParams);
      this.total = res.result.page.totalCount;
      this.currentGroup = res.result.currentGroup;
      this.groupsMoveList = Object.assign([], res.result.groups);
      this.groupsList = res.result.groups;
      this.groupsList.unshift({ wechatImageGroupId: '', groupName: '所有图片', imageCount: res.result.totalPicsCount });
      this.checkedOptions = [];
      this.imgList = [];
      if (res.result.page.result) {
        const resList = res.result.page.result;
        this.$nextTick(_ => {
          resList.map(v => {
            this.checkedOptions.push(v.imageId);
            this.imgList.push(v);
          });
        });
      } else {
        this.imgList = [];
      }
      this.loading = false;
    },
    //将图片移动分组
    moveImgGroup(val) {
      this.moveImgVal = val;
      this.moveDialogShow = true;
    },
    moveImgGroupBatch() {
      if (this.checkedList.length === 0) {
        this.$tips({ type: 'warning', message: '请选择图片' });
        return;
      }
      this.moveDialogShow = true;
    },
    moveFinish(val) {
      if (this.moveImgVal) {
        this.changeGroupService(val, this.moveImgVal);
      } else {
        this.changeGroupService(val, this.checkedList.join(','));
      }
    },
    async changeGroupService(wechatImageGroupId, imageId) {
      try {
        await changeGroupService({ imageId: imageId, wechatImageGroupId: wechatImageGroupId });
        this.$tips({ type: 'success', message: '移动分组成功' });
        this.moveImgVal = '';
        this.checkedList = [];
        this.moveDialogShow = false;
        this.loadImgList();
      } catch (err) {
        this.$tips({ type: 'error', message: '移动分组失败' });
      }
    },
    delBatchImg() {
      if (this.checkedList.length === 0) {
        this.$tips({ type: 'warning', message: '请选择图片' });
        return;
      }
      this.delImg(this.checkedList.join(','));
    },
    //批量删除图片
    delImg(val) {
      this.$confirm('是否删除所选图片?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteImageService(val);
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消删除' });
        });
    },
    async deleteImageService(val) {
      try {
        await deleteImageService({ imageIds: val });
        this.checkAll = false;
        this.$tips({ type: 'success', message: '删除图片成功' });
        if (this.imgList.length === val.split(',').length) {
          this.listParams.currentPage--;
        }
        this.checkedList = []; // 移除存在的项
        this.loadImgList();
      } catch (err) {
        this.$tips({ type: 'error', message: '删除图片失败' });
      }
    },
    //删除分组
    delGroup() {
      this.$confirm('是否删除该分组?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteGroupService();
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消删除' });
        });
    },
    async deleteGroupService() {
      try {
        await deleteGroupService({ wechatImageGroupId: this.listParams.wechatImageGroupId });
        this.$tips({ type: 'success', message: '删除分组成功!' });
        this.listParams.wechatImageGroupId = '';
        this.loadImgList();
      } catch (err) {
        this.$tips({ type: 'error', message: '删除分组失败!' });
      }
    },
    addGroup() {
      this.$prompt('', '新增分组', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        inputPattern: /\S/,
        inputPlaceholder: '请输入分组名称',
        inputErrorMessage: '名称不能为空',
        inputValue: '新分组'
      })
        .then(({ value }) => {
          this.addGroupService(value);
        })
        .catch(err => {
          // this.$tips({
          //   type: 'info',
          //   message: '取消新增'
          // });
        });
    },
    async addGroupService(val) {
      await addGroupService({ groupName: val });
      this.$tips({ type: 'success', message: '新增成功' });
      this.loadImgList();
    },
    //编辑分组
    editGroup() {
      this.$prompt('', '修改分组名称', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        inputPattern: /\S/,
        inputPlaceholder: '请输入新名称',
        inputErrorMessage: '名称不能为空',
        inputValue: this.currentGroup.groupName
      })
        .then(({ value }) => {
          this.updateGroupName(value);
        })
        .catch(() => {
          this.$tips({
            type: 'info',
            message: '取消修改'
          });
        });
    },
    async updateGroupName(val) {
      await updateGroupName({ wechatImageGroupId: this.listParams.wechatImageGroupId, groupName: val });
      this.$tips({ type: 'success', message: '修改成功' });
      this.loadImgList();
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../assets/style/base/var.scss';
@import '../../../assets/style/mixin/index.scss';
.dm-ilib {
  display: flex;
  flex-direction: row;
  & > article {
    flex: 100;
    border: 1px solid $border-color;
    border-radius: 2px;
    min-height: 640px;
    .dm-ilib-header {
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      align-items: center;
    }
    h4 {
      height: 50px;
      line-height: 50px;
      font-size: 16px;
      i {
        font-size: 16px;
        padding-left: 10px;
        cursor: pointer;
        color: #909399;
        &.el-icon-edit:hover {
          color: #1890ff;
        }
        &.el-icon-delete:hover {
          color: #f5222d;
        }
      }
    }
  }
  .img-item__wrap {
    min-height: 456px;
    margin-left: 6px;
  }
  & > nav {
    flex: 200px;
    width: 200px;
    margin-right: 10px;
    border: 1px solid $border-color;
    border-radius: 2px;
    h4 {
      height: 50px;
      line-height: 50px;
      padding-right: 20px;
      font-size: 16px;
      border-bottom: 1px solid $border-color;
      cursor: pointer;
    }
    .dm-ilib-category {
      height: 588px;
      overflow-y: scroll;
      cursor: pointer;
      li {
        height: 40px;
        line-height: 40px;
        // border-bottom:1px dashed $border-color;
        padding-left: 10px;
        &.active {
          background: $gray-color;
        }
        &:hover {
          background: $gray-color;
        }
      }
    }
  }
  &-opt {
    background: $gray-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 20px;
  }
}
.ellipsis-80 {
  @include ellipsis(80px);
  display: inline-block;
  vertical-align: middle;
}
.dm-upload {
  display: inline-block;
  position: relative;
}
</style>
