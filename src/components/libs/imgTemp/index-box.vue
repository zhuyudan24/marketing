<template>
  <section class="dm-ilib clearfix">
    <nav class="fl">
      <h4 class="text-left pl10"><el-button style="font-weight: 500;" size="small" type="text" icon="el-icon-plus" @click.stop="addGroup">新建分组</el-button></h4>
      <ul class="dm-ilib-category" :style="scrollStyle">
        <li v-for="(v, i) in groupsList" :key="i" @click="changeCate(v)" :class="{ active: listParams.wechatImageGroupId === v.wechatImageGroupId }">
          <span class="ellipsis-80">{{ v.groupName }}</span
          ><span class="fz10 gray"> ({{ v.imageCount }})</span>
        </li>
      </ul>
    </nav>
    <article class="fr">
      <div class="dm-ilib-header">
        <h4>{{ listParams.wechatImageGroupId ? currentGroup.groupName : '所有图片' }}</h4>
        <div class="dm-ilib-opt_right">
          <span class="fz12 gray pr10">大小不超过2M</span>
          <label class="el-button el-button--primary el-button--small" :class="{ 'is-disabled': upLoadDisabled }"
            >{{ upLoadDisabled ? '上传中...' : '上传图片' }}
            <input type="file" style="display:none;" :disabled="upLoadDisabled" accept="image/gif, image/jpeg,image/png" ref="uploader" v-imglibupload="this" />
          </label>
        </div>
      </div>
      <el-checkbox-group v-loading="loading" v-model="newMediaId" :max="1" class="clearfix img-item__wrap" :style="scrollStyle">
        <img-item-radio v-for="(v, i) in imgList" :key="i" :imgData="v" @click.native.stop.prevent="selectImg(v)"></img-item-radio>
      </el-checkbox-group>
      <el-pagination v-show="imgList.length" background class="dm-pagination imglib-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    </article>
  </section>
</template>
<script>
import imgItemRadio from './imgItemRadio';
import { loadImgList, addGroupService } from '@/service/api/wechatApi.js';
export default {
  name: 'dm-ilib',
  props: {
    activeName: String,
    scrollStyle: Object,
    mediaId: String
  },
  created() {
    this.loadImgList();
  },
  watch: {
    mediaId(val) {
      // console.log(val);
      if (!this.newMediaId.includes(val)) {
        this.newMediaId.push(val);
      }
    }
  },
  data() {
    return {
      upLoadDisabled: false,
      imgList: [],
      listParams: {
        currentPage: 1,
        pageSize: 20,
        wechatImageGroupId: ''
      },
      total: 0,
      newMediaId: [],
      groupsList: [],
      groupsMoveList: [],
      loading: true,
      currentGroup: { groupName: '' },
      moveImgVal: '',
      fileList: []
    };
  },
  components: {
    imgItemRadio
  },
  methods: {
    selectImg(row) {
      this.newMediaId.splice(0, 1);
      this.newMediaId.push(row.imageMediaId);
      this.$emit('get-data', this.newMediaId[0]);
    },
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
    async loadImgList() {
      this.loading = true;
      let res = await loadImgList(this.listParams);
      this.total = res.result.page.totalCount;
      this.currentGroup = res.result.currentGroup;
      this.groupsMoveList = Object.assign([], res.result.groups);
      this.groupsList = res.result.groups;
      this.groupsList.unshift({ wechatImageGroupId: '', groupName: '所有图片', imageCount: res.result.totalPicsCount });
      this.imgList = [];
      if (res.result.page.result) {
        const resList = res.result.page.result;
        this.$nextTick(_ => {
          resList.map(v => {
            this.imgList.push(v);
          });
        });
      } else {
        this.imgList = [];
      }
      this.loading = false;
    },

    //图片上传相关
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    uploadSuccess(response, file, fileList) {
      if (response.errorCode === 0) {
        this.$tips({ type: 'warning', message: '上传成功' });
        this.fileList = [];
        this.loadImgList();
      } else {
        this.$tips({ type: 'warning', message: response.message });
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
          console.log(err);
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
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../assets/style/base/var.scss';
@import '../../../assets/style/mixin/index.scss';
.dm-ilib {
  border: 1px solid $border-color;
  border-radius: 2px;
  & > article {
    position: relative;
    width: calc(80% - 1px);
    border-left: 1px solid $border-color;
    border-radius: 0 2px 2px 0;
    min-height: 573px;
    // border-bottom: 1px solid $border-color;
    .dm-ilib-header {
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      align-items: center;
      border-bottom: 1px solid $border-color;
    }
    h4 {
      height: 50px;
      line-height: 50px;
      font-size: 16px;
      i {
        font-size: 20px;
        padding-left: 10px;
        cursor: pointer;
      }
    }
  }
  .img-item__wrap {
    min-height: 456px;
    margin-left: 6px;
  }
  & > nav {
    width: 20%;
    h4 {
      height: 50px;
      line-height: 50px;
      padding-right: 20px;
      font-size: 16px;
      border-bottom: 1px solid $border-color;
      cursor: pointer;
    }
    .dm-ilib-category {
      height: 522px;
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
.imglib-pagination {
  // position:absolute;
  // bottom:7px;
  padding-right: 20px;
}
</style>
