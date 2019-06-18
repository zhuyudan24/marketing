<template>
  <section :class="{ 'dm-wrap': auto }">
    <div class="dm-imgtext_head" :class="pbSize">
      <div>
        图文消息(共{{ total }}条) <el-input v-model="listParams.searchName" clearable class="w200 ml10" placeholder="请输入标题/作者" @change="loadImgTextList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      </div>
      <div>
        <el-button type="primary" @click="add">新建图文</el-button>
        <el-button v-if="auto" @click="check">检查同步</el-button>
      </div>
    </div>
    <el-radio-group class="dm-imgtext-list" v-model="selectedData" v-loading="loading" :style="scrollStyle">
      <el-table tooltipEffect="light" :data="textImgList" style="width: 100%" @row-click="rowClick">
        <el-table-column label="" align="center" v-if="radioShow">
          <template slot-scope="scope">
            <div class="label-hidden"><el-radio :label="scope.row"></el-radio></div>
          </template>
        </el-table-column>
        <el-table-column label="图片" align="left">
          <template slot-scope="scope">
            <img width="100" height="100" :src="scope.row.itemList.length ? scope.row.itemList[0].qcloudImageUrl || '' : ''" alt="" />
          </template>
        </el-table-column>
        <el-table-column label="图文标题" align="left">
          <template slot-scope="scope">
            <a class="blue" :href="scope.row.itemList.length ? scope.row.itemList[0].mediaUrl || '' : ''" target="_blank">{{ scope.row.itemList.length ? scope.row.itemList[0].titleName || '' : '' }}</a>
          </template>
        </el-table-column>
        <el-table-column label="作者" prop="authorName" align="left">
          <template slot-scope="scope">
            <p>{{ scope.row.itemList.length ? scope.row.itemList[0].authorName || '--' : '' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="修改时间" prop="updateTimeStr" align="left">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.updateTime, 'yyyy-MM-dd-HH-mm', true).y }}<br /><span>{{ formatDateTimeByType(scope.row.updateTime, 'yyyy-MM-dd-HH-mm', true).h }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="left" v-if="auto">
          <template slot-scope="scope">
            <el-button type="text" @click="editData(scope.row)">编辑</el-button>
            <dm-delete @confirm="delData(scope.row)" tips="确认删除该图文?">
              <el-button type="text">删除</el-button>
            </dm-delete>
            <el-button type="text" @click="$router.push('/wechat/record/add/' + scope.row.imageTextId)">使用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-radio-group>
    <el-pagination v-show="textImgList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <sync-imgtext :show.sync="syncImgTextShow"></sync-imgtext>
  </section>
</template>

<script>
import { loadImgTextList, deleteImageText } from '@/service/api/wechatApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import syncImgtext from './syncImgtext';
export default {
  props: {
    scrollStyle: Object,
    auto: {
      type: Boolean,
      default: true
    },
    radioShow: {
      type: Boolean,
      default: false
    },
    activeId: String,
    pbSize: {
      type: String,
      default: 'pb22'
    }
  },
  created() {
    this.loadImgTextList();
  },
  data() {
    return {
      textImgList: [],
      listParams: {
        currentPage: 1,
        pageSize: 20,
        searchName: ''
      },
      total: 0,
      loading: false,
      syncImgTextShow: false,
      selectedImgTextId: '',
      selectedData: {}
    };
  },
  components: {
    syncImgtext
  },
  watch: {
    activeId(val) {
      this.textImgList.map(v => {
        if (this.activeId === v.imageTextWechatId) {
          this.selectedData = v;
        }
      });
    }
  },
  methods: {
    async loadImgTextList() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      try {
        let res = await loadImgTextList(this.listParams);
        if (res.errorCode === 0) {
          this.textImgList = res.result.result || [];
          this.total = res.result.totalCount;
          this.textImgList.map(v => {
            v.createTimeStr = v.createTime;
            // v.updateTimeStr = v.updateTime;
            if (this.activeId === v.imageTextWechatId) {
              this.selectedData = v;
            }
          });
        }
      } catch (err) {
        this.$tips({ type: 'warning', message: '列表请求出错，请稍后再试' });
      }
      this.loading = false;
    },
    reset() {
      this.listParams.searchName = '';
      this.loadImgTextList();
    },
    check() {
      this.syncImgTextShow = true;
    },
    rowClick(row) {
      this.selectedData = row;
      this.$emit('get-data', { imageTextId: row.imageTextId, imageTextWechatId: row.imageTextWechatId });
    },
    add() {
      this.$router.push('/wechat/editor');
    },
    editData(row) {
      this.$router.push('/wechat/editor/' + row.imageTextId);
    },
    delData(row) {
      deleteImageText({ imageTextId: row.imageTextId })
        .then(res => {
          this.$tips({ type: 'success', message: '删除成功!' });
          if (this.textImgList.length === 1 && this.listParams.currentPage !== 1) {
            this.listParams.currentPage--;
          }
          this.loadImgTextList();
        })
        .catch(err => {
          this.$tips({ type: 'error', message: '删除失败!' });
        });
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.loadImgTextList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.loadImgTextList();
    },
    formatDateTimeByType
  }
};
</script>

<style lang="scss" scoped>
.dm-imgtext_head {
  display: flex;
  justify-content: space-between;
}
.dm-imgtext-list {
  width: 100%;
  & > .dm-imgtext-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #e7e7eb;
  }
  .dm-imgtext_left {
    & > img {
      width: 100px;
      height: 100px;
      display: inline-block;
      vertical-align: middle;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    & > div {
      display: inline-block;
      vertical-align: middle;
      line-height: 26px;
      padding-left: 10px;
    }
  }
}
</style>
