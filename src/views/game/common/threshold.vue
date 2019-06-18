<template>
  <section class="dm-form__wrap clearfix">
    <h3 class="dm-title__label">
      参与门槛
      <i class="iconfont icon-xinxixianshi pl5 gray"></i>
      <span class="gray fz13">满足参与门槛会员才可以参与游戏</span>
    </h3>
    <el-form-item label="参与门槛" prop="memberType">
      <el-radio v-model="form.memberType" :label="0">所有用户</el-radio>
      <el-radio v-model="form.memberType" :label="1">会员筛选</el-radio>
      <el-radio v-model="form.memberType" :label="2">会员分组</el-radio>
    </el-form-item>
    <div class="">
      <!-- 会员筛选 -->
      <el-form-item label="选择会员" v-if="form.memberType === 1" class="calc1">
        <vue-gic-people :projectName="projectName" :isAdd="false" :triggerReset="true" :useId="thresholdData.useId" :hasSearchData="thresholdData.hasSearchData" :sceneValue="sceneValue" ref="peopleFilter" @findFilter="findFilter" @getBackData="getBackData" @editHide="editHide" @editShow="editShow" @hideBtn="hideBtn" />
        <div class="gic-people--button" v-show="toggleTag">
          <el-button size="small" type="primary" @click="getData">确 定</el-button>
          <el-button size="small" @click="cancelFilter">取 消</el-button>
        </div>
      </el-form-item>
      <!-- 会员分组 -->
      <vue-gic-member-group class="calc2" v-if="form.memberType === 2" :defaltSelected="thresholdData.defaltSelected" :height="400" :projectName="projectName" :headerList="headerList" @handleDataTransferred="handleDataTransferred" @handleDataLeft="handleDataLeft"></vue-gic-member-group>
    </div>
    <div class="width60 fl">
      <el-form-item label="提示图片" prop="tipsImg">
        <dm-upload-avatar :limit="{ maxSize: 1 }" :model.sync="form.tipsImg" fileType="fileShare" label="上传图片" tips="图片建议尺寸：200*200，格式为jpg/png/gif。图片大小不超过1MB，点击图片可重新上传。"></dm-upload-avatar>
      </el-form-item>
      <el-form-item label="提示文字" prop="tipTitle">
        <dm-input v-model="form.tipTitle" type="textarea" placeholder="最多输入60个字" :maxlength="60" class="w400" :rows="6"></dm-input>
      </el-form-item>
    </div>
    <div class="width40 fr">
      <div class="game-tips__preview">
        <div class="game-tips__preview__inner">
          <p class="game-tips__preview--title">你还未满足参与游戏条件！</p>
          <img class="game-tips__preview--img" :src="form.tipsImg.imgUrl || defaultImg" alt="" />
          <p class="game-tips__preview--desc">{{ form.tipTitle }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import dmUploadAvatar from '@/components/upload/avatar';
// 参与门槛组件
export default {
  name: 'threshold',
  props: {
    thresholdData: {
      type: Object,
      default() {
        return {
          searchParams: '', //  会员筛选
          hasSearchData: '', // 反显数据保存
          getSaveData: '', // 会员筛选回显保存的数据
          useId: '', // 会员筛选filter
          memberGroupIds: '', // 会员分组
          defaltSelected: [] // 会员分组默认穿梭窗已选入数据
        };
      }
    },
    form: {
      type: Object
    },
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 会员分组可传参数
      projectName: 'marketing', // 默认是memberTag
      headerList: ['isRealTime', 'latestUpdateTime', 'updateType', 'effectiveStatus', 'effectiveDate'],
      effectiveStatus: 1, // 不传： 所有状态 1： 有效 0： 失效
      // 人群筛选器可传参数
      // memberGroupIds: '', // 传入数据 放入
      sceneValue: 'member', // 场景值
      toggleTag: false, // 控制按钮显示的参数,仅供参考,可自行修改
      saveTag: false
    };
  },
  components: {
    dmUploadAvatar
  },
  methods: {
    async triggerPeopleSet() {
      await this.$refs.peopleFilter.confirmSet();
    },
    /**---------人群筛选器的方法-------------*/
    getData() {
      this.$refs.peopleFilter.confirmSet();
    },
    // 子组件触发父组件事件,返回过滤条件数据
    findFilter(value) {
      this.thresholdData.searchParams = value;
    },
    // 取消
    cancelFilter() {
      this.$refs.peopleFilter.cancelSet();
    },
    // 获取需要回显的数据, 供保存时候使用
    getBackData(val) {
      this.thresholdData.getSaveData = val === 'remove' ? '' : val; // 回显数据写在父组件对象中
    },
    // 显示编辑,保存按钮隐藏,确认按钮显示 (子组件会调用)
    editShow() {
      this.toggleTag = true;
      this.saveTag = false;
    },
    // 显示保存按钮,隐藏确认按钮显示  (子组件会调用)
    editHide() {
      this.toggleTag = false;
      this.saveTag = true;
    },
    // 隐藏保存按钮和确认按钮  (子组件会调用)
    hideBtn() {
      this.toggleTag = false;
      this.saveTag = false;
    },
    /**---------会员分组的方法-------------*/
    handleDataTransferred(data) {
      // 会员分组 情况下 memberSearchDTO 传数组字符串
      if (this.form.memberType === 2) {
        this.thresholdData.memberGroupIds = data
          .map(v => v.memberTagGroupId)
          .filter(v => v)
          .join(',');
      }
    },
    handleDataLeft(selectedData, selectionToRemove) {
      // 删除右侧
      this.thresholdData.memberGroupIds = selectedData
        .map(v => v.memberTagGroupId)
        .filter(v => v)
        .join(',');
    }
  }
};
</script>

<style scoped>
.calc1 {
  width: calc(60% + 330px);
}
.calc2 {
  width: calc(60% + 330px + 30px);
}
</style>
