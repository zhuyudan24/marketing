<template>
  <section class="c-p">
    <div class="c-p_l">
      <header>
        <el-input style="width:200px;" placeholder="请输入昵称卡号" prefix-icon="el-icon-search" v-model="keyWord" clearable @change="loadList"></el-input>
      </header>
      <el-table v-loading="loading" tooltipEffect="light" ref="multipleTable" :data="leftList" tooltip-effect="dark" style="width: 100%" height="400px" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="会员信息" min-width="120">
          <template slot-scope="scope">
            <img style="vertical-align: middle;" :src="scope.row.photoUrl || avatar" width="32px" height="32px" alt="" srcset="" />
            <span class="avatar">
              <p>{{ scope.row.name }}</p>
              <p style="color:#909399;">{{ scope.row.cardNo }}</p>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="gradeName" label="会员等级" width="100"></el-table-column>
      </el-table>
    </div>

    <div class="c-p_c">
      <el-button type="primary" icon="el-icon-arrow-right" circle @click="toRight"></el-button>
      <el-button icon="el-icon-arrow-left" circle @click="removeAll"></el-button>
    </div>
    <div class="c-p_r">
      <header>
        <el-input style="width:200px;" placeholder="请输入昵称卡号" clearable prefix-icon="el-icon-search" v-model="keyWordRight" @change="filterRight"></el-input>
      </header>
      <el-table tooltipEffect="light" ref="multipleTable" :data="rightList" tooltip-effect="dark" style="width: 100%" height="400px" @selection-change="handleSelectionChangeRight">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="会员信息" min-width="120">
          <template slot-scope="scope">
            <img style="vertical-align: middle;" :src="scope.row.photoUrl || avatar" width="32px" height="32px" alt="" srcset="" />
            <span class="avatar">
              <p>{{ scope.row.name }}</p>
              <p style="color:#909399;">{{ scope.row.cardNo }}</p>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="gradeName" label="会员等级" width="100"></el-table-column>
        <el-table-column prop="gradeName" label="操作" width="50">
          <template slot-scope="scope">
            <el-button type="text" @click="remove(scope.$index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script>
import qs from 'qs';
/**
 * 清除重复
 */
function uniqueByType(arr, type) {
  let res = [];
  let json = {};
  for (let i = 0; i < arr.length; i++) {
    if (!json[arr[i][type]]) {
      res.push(arr[i]);
      json[arr[i][type]] = 1;
    }
  }
  return res;
}

let allList = [];

export default {
  props: {
    idType: {
      type: String,
      default: 'openId'
    },
    list: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      loading: false,
      keyWord: '',
      keyWordRight: '',
      leftList: [],
      rightList: [],
      leftSelected: [],
      rightSelected: [],
      avatar: () => import('../../assets/img/head_default.png')
    };
  },
  watch: {
    rightList(val) {
      // console.log(val)
      this.$emit('get-data', val.map(v => v[this.idType]).join(','));
    },
    list(val) {
      allList = this.rightList = val.slice();
    }
  },
  methods: {
    handleSelectionChange(val) {
      // console.log(val)
      this.leftSelected = val;
    },
    handleSelectionChangeRight(val) {
      this.rightSelected = val;
    },
    toRight() {
      // console.log(this.leftSelected)
      this.leftSelected.map(v => {
        const index = this.rightList.indexOf(v);
        if (index < 0) {
          this.rightList.push(v);
        }
      });
      console.log(this.rightList.map(v => v.memberId));
      allList = this.rightList = uniqueByType(this.rightList, 'memberId');
    },
    loadList() {
      this.loading = true;
      this.leftSelected = [];
      let params = {
        searchParams: this.keyWord,
        onlyWxMember: 1,
        requestProject: 'gic-web'
      };
      this.axios.post('/api-marketing/member-search-engine', qs.stringify(params), {}).then(res => {
        if (res.data.errorCode === 0 && res.data.result) {
          this.leftList = res.data.result;
        }
        this.loading = false;
      });
    },
    removeAll() {
      let currentList = this.rightList.slice();
      this.rightSelected.map(v => {
        const index = currentList.indexOf(v);
        if (index > -1) {
          currentList.splice(index, 1);
        }
      });
      allList = this.rightList = currentList;
    },
    remove(index) {
      this.rightList.splice(index, 1);
      allList.splice(index, 1);
    },
    //TODO
    filterRight() {
      if (!this.keyWordRight) {
        this.rightList = Object.assign([], allList);
      } else {
        const list = Object.assign([], this.rightList);
        const filterList = list.filter(v => {
          let flag = false;
          if (v.cardNo) flag = v.cardNo.indexOf(this.keyWordRight) > -1;
          if (v.memberName) flag = v.memberName.indexOf(this.keyWordRight) > -1;
          return flag;
        });
        this.rightList = filterList;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.c-p {
  width: 1000px;
  &_l,
  &_r {
    display: inline-block;
    width: 400px;
    border: 1px solid #dcdfe6;
    vertical-align: middle;
    header {
      height: 80px;
      line-height: 80px;
      padding: 0 10px;
    }
  }
  &_c {
    display: inline-block;
    vertical-align: middle;
    margin: 0 10px;
    button {
      display: block;
      margin: 10px auto;
    }
  }
  /deep/ .avatar {
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
