<template>
  <el-form ref="form" :model="form" label-width="100px" :rules="rules" v-loading="loading" element-loading-text="拼命加载中">
    <!-- 计划内容设置 -->
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">计划内容设置</h3>
      <el-form-item label="计划名称" prop="ecmPlanName">
        <dm-input class="w400" :maxlength="9" v-model="form.ecmPlanName" :disabled="isEdit"></dm-input>
      </el-form-item>
      <el-form-item label="时效">
        <el-radio v-model="form.effectType" :label="0" :disabled="!isAdd">实时</el-radio>
        <el-radio class="mr10" v-model="form.effectType" :label="1" :disabled="!isAdd">每天</el-radio>
        <el-select style="width:262px;" :disabled="isEdit" v-model="form.effectTime" v-if="form.effectType" placeholder="请选择时间">
          <el-option v-for="(v, i) in dayOptions" :key="i" :label="v.label" :value="v.value"></el-option>
        </el-select>
        <div class="layout--tips mt10" v-if="form.effectType">
          <!-- <i class="el-icon-info inline-block"></i> -->
          <div class="layout--tips__content">
            <p><span class="dm-status--primary pl10"></span>每天发送<b class="bold">图文、文本、图片</b>将使用微信群发接口，占用每个用户每月4条的群发次数</p>
            <p><span class="dm-status--primary pl10"></span>每天发送<b class="bold">小程序</b>使用客服接口，但客服接口需要用户在24小时之内与微信公众号互动才能发送成功，可能导致成功率过低，不占用每个用户每月4条的群发次数。</p>
            <p><span class="dm-status--primary pl10"></span>每天发送<b class="bold">短信、话务</b>均不占用群发次数，卡券详见卡券通知方式配置不同投放方式说明。</p>
          </div>
        </div>
        <div class="layout--tips" v-else>
          <span class="dm-status--primary pl10"></span>
          实时发送调用微信客服接口，不占用每个用户每月4条的群发次数
        </div>
      </el-form-item>
      <el-form-item label="触发行为" class="width50" v-if="!form.effectType">
        <el-select class="w400" :disabled="isEdit" v-model="form.effectAction" placeholder="选择发送状态" @change="effectActionChange">
          <el-option v-for="(v, i) in effectActionOptions" :key="i" :label="v.label" :value="v.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="常用场景" class="width50" v-if="form.effectType">
        <div class="fz12 gray">选填，勾选后生效</div>
        <el-checkbox-group v-model="checked" :max="1">
          <div class="pb10">
            <el-checkbox :disabled="isEdit" class="w150" label="brithday_day">会员生日前 </el-checkbox>
            <el-input-number controls-position="right" :min="checked[0] === 'brithday_day' ? 1 : 0" style="width:244px;" :disabled="checked[0] !== 'brithday_day' || isEdit" v-model="form.brithday_day"></el-input-number> 天
          </div>
          <div class="pb10">
            <el-checkbox :disabled="isEdit" class="w150" label="attention_day">关注时长超过 </el-checkbox>
            <el-input-number controls-position="right" :min="checked[0] === 'attention_day' ? 1 : 0" :max="100000" style="width:244px;" :disabled="checked[0] !== 'attention_day' || isEdit" v-model="form.attention_day"></el-input-number> 天
          </div>
          <div class="pb10">
            <el-checkbox :disabled="isEdit" class="w150" label="lastCost_day">最近消费间隔 </el-checkbox>
            <el-input-number controls-position="right" :min="checked[0] === 'lastCost_day' ? 1 : 0" style="width:244px;" :disabled="checked[0] !== 'lastCost_day' || isEdit" v-model="form.lastCost_day"></el-input-number> 天
          </div>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="营销场景">
        <span v-if="isEdit">{{ form.sceneSettingName }}</span>
        <el-select v-else class="w400" v-model="form.sceneSettingId" placeholder="选择营销场景">
          <el-option v-for="item in sceneSettingIdOptions" :key="item.sceneSettingId" :label="item.sceneName" :value="item.sceneSettingId"></el-option>
        </el-select>
      </el-form-item>
    </section>
    <!-- 消费触发配置 -->
    <section class="dm-form__wrap" v-if="!form.effectType && form.effectAction === 'consume'">
      <h3 class="dm-title__label">
        消费触发配置
        <i class="dm-title__label--icon iconfont icon-xinxixianshi"></i>
        <span class="gray fz13">仅适用于线下单笔消费</span>
      </h3>
      <el-form-item label="消费金额">
        <el-input-number :disabled="isEdit" controls-position="right" min="" style="width:150px;" v-model="form.lowest_cost" @change="handleLowestCost()"></el-input-number>
        <span class="ml5 mr5">至</span>
        <el-input-number :disabled="isEdit" controls-position="right" min="" style="width:150px;" v-model="form.max_cost" @change="handleLowestCost()"></el-input-number>
        <span class="pl5">元</span>
        <el-popover placement="right" title="" width="200" trigger="hover" content="最大值最小值可选填其一或两个都填写，包含边界值"><i class="el-icon-info ml5 gray" slot="reference"></i></el-popover>
        <!-- <span class="pl20 fz13 red" v-show="error_cost_info !== ''">* {{ error_cost_info }}</span> -->
      </el-form-item>
      <el-form-item label="消费件数">
        <el-input-number :disabled="isEdit" controls-position="right" min="" style="width:150px;" v-model="form.lowest_cost_count" @change="handleLowestCostCount()"></el-input-number>
        <span class="ml5 mr5">至</span>
        <el-input-number :disabled="isEdit" controls-position="right" min="" style="width:150px;" v-model="form.max_cost_count" @change="handleLowestCostCount()"></el-input-number>
        <span class="pl5">件</span>
        <el-popover placement="right" title="" width="200" trigger="hover" content="最大值最小值可选填其一或两个都填写，包含边界值，不包含赠品"><i class="el-icon-info ml5 gray" slot="reference"></i></el-popover>
        <!-- <span class="pl20 fz13 red" v-show="error_cost_count_info !== ''">* {{ error_cost_count_info }}</span> -->
      </el-form-item>
      <el-form-item label="指定消费门店">
        <el-radio-group v-model="form.store_mode" @change="initStoreCardLeft" :disabled="isEdit">
          <el-radio :label="0">所有门店</el-radio>
          <el-radio :label="1">部分门店</el-radio>
        </el-radio-group>
      </el-form-item>
      <vue-gic-store-card :readonly="isEdit" class="pt10" v-show="form.store_mode" ref="storeCard" :uuid.sync="form.order_store"></vue-gic-store-card>
    </section>
    <!-- 会员卡升/降级触发设置 -->
    <section class="dm-form__wrap" v-if="!form.effectType && (form.effectAction === 'degrade' || form.effectAction === 'upgrade')">
      <h3 class="dm-title__label">
        会员卡{{ form.effectAction === 'degrade' ? '降' : '升' }}级触发设置
        <i class="dm-title__label--icon iconfont icon-xinxixianshi"></i>
        <span class="gray fz13">仅限会员等级由GIC控制可用</span>
      </h3>
      <el-form-item :label="`会员卡${form.effectAction === 'degrade' ? '降' : '升'}级至`">
        <el-select :disabled="isEdit" v-model="form.gradeIds" multiple placeholder="请选择" class="w300">
          <el-option v-for="v in gradeList" :key="v.gradeId" :label="v.gradeName" :value="v.gradeId" :disabled="v.disabled"></el-option>
        </el-select>
      </el-form-item>
    </section>
    <!-- 营销次数配置 -->
    <section class="dm-form__wrap" v-if="!form.effectType && (form.effectAction === 'consume' || form.effectAction === 'upgrade' || form.effectAction === 'degrade')">
      <h3 class="dm-title__label">
        营销次数配置
        <i class="dm-title__label--icon iconfont icon-xinxixianshi"></i>
        <span class="gray fz13">设置本营销计划对同个会员的触发次数</span>
      </h3>
      <el-form-item label="营销次数配置" prop="marketingTimesType">
        <el-select :disabled="isEdit" v-model="form.marketingTimesType" class="w150 vertical-middle">
          <el-option v-for="(v, i) in marketingTimesTypeOptions" :key="i" :value="v.value" :label="v.label"></el-option>
        </el-select>
        <span class="vertical-middle" v-if="form.marketingTimesType !== -1"><el-input-number :disabled="isEdit" controls-position="right" class="w150" :min="1" v-model="form.marketingTimes"></el-input-number> 次</span>
        <span class="pl20 fz13 gray"> * 该营销计划{{ marketingTimesTips }}</span>
      </el-form-item>
    </section>
    <!-- 有效时间 -->
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">有效时间</h3>
      <el-form-item label="有效时间" prop="endDate" :show-message="showMessage">
        <el-radio v-model="form.expireType" :label="0">长期有效</el-radio>
        <el-radio v-model="form.expireType" :label="1">固定期限</el-radio>
        <el-date-picker class="ml10" v-if="form.expireType" v-model="form.beginDate" type="datetime" placeholder="开始时间" @change="checkBeginEndTime"> </el-date-picker>
        <el-date-picker v-if="form.expireType" v-model="form.endDate" type="datetime" :picker-options="endDatePickerOptions" placeholder="结束时间" @change="checkBeginEndTime"> </el-date-picker>
      </el-form-item>
    </section>
    <!-- 人群筛选器 -->
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">
        适用人群
        <i class="dm-title__label--icon iconfont icon-xinxixianshi"></i>
        <span class="gray fz13">适用人群创建后不支持修改</span>
      </h3>
      <el-radio-group class="pl20 pb20" v-model="form.memberType">
        <el-radio :disabled="isEdit" :label="0">会员筛选</el-radio>
        <el-radio :disabled="isEdit" :label="1">会员分组</el-radio>
      </el-radio-group>
      <div class="mb20" v-if="form.memberType === 0">
        <vue-gic-people :projectName="projectName" :isAdd="isAdd" :triggerReset="true" :useId="useId" :hasSearchData="hasSearchData" :sceneValue="sceneValue" ref="peopleFilter" @findFilter="findFilter" @getBackData="getBackData" @editHide="editHide" @editShow="editShow" @hideBtn="hideBtn" />
        <div class="gic-people--button" v-show="toggleTag">
          <el-button size="small" type="primary" @click="getData">确 定</el-button>
          <el-button size="small" @click="cancelFilter">取 消</el-button>
        </div>
      </div>
      <div :class="isEdit ? 'el-view-mask' : ''">
        <vue-gic-member-group v-if="form.memberType === 1" :defaltSelected="defaltSelected" :height="500" :projectName="projectName" :headerList="headerList" @handleDataTransferred="handleDataTransferred" @handleDataLeft="handleDataLeft"></vue-gic-member-group>
      </div>
    </section>
    <!-- 营销事件组件 -->
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">营销事件</h3>
      <marketing-event ref="marketingEvent" @has-card="hasCard" v-if="ecmPlanId" :ecmPlanId="ecmPlanId" :isSupportVar="form.effectType === 0" :code="code" :enabledMessageState="enabledMessageState"></marketing-event>
    </section>
    <!-- 只有存在卡券的情况下出现卡券通知方式 -->
    <section class="dm-form__wrap" v-if="currentCard.comName">
      <h3 class="dm-title__label">卡券通知方式配置</h3>
      <el-form-item label="通知方式" class="is-required" prop="cardNoticeType">
        <el-radio v-model="form.cardNoticeType" :label="0"
          >不通知
          <el-tooltip placement="top-start" content="不通知用户，但用户可以在GIC卡券包查看到该卡券。建议线下发券使用，或使用其他通知方式代替（如小程序、短信等）">
            <i class="iconfont icon-xinxixianshi pl5 gray"></i>
          </el-tooltip>
        </el-radio>
        <el-radio v-model="form.cardNoticeType" :label="1"
          >微信{{ form.effectType ? '群发' : '客服' }}接口
          <el-tooltip placement="top-start" :content="form.effectType ? '建议大规模发券、智能营销定时计划使用，占用每个会员每月4次的营销次数。' : '客服接口需要用户在24小时之内与微信公众号互动才能发送成功，不占用每个用户每月4条的群发次数。'">
            <i class="iconfont icon-xinxixianshi pl5 gray"></i>
          </el-tooltip>
        </el-radio>
        <el-radio v-model="form.cardNoticeType" :label="2" :disabled="form.templateUseEnable === 0"
          >微信模板消息
          <el-tooltip placement="top-start">
            <span slot="content">建议小规模发券、智能营销实时计划使用，滥用可能导致模板消息被封。参考微信<a target="_blank" href="https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1433751288">《模板消息运营规范》</a></span>
            <i class="iconfont icon-xinxixianshi pl5 gray"></i>
          </el-tooltip>
        </el-radio>
      </el-form-item>
      <!-- 模板消息选择 -->
      <el-form-item label="模板消息选择" v-if="(form.cardNoticeType === 1 && form.effectType === 0 && form.templateNoticeFlag === 1) || form.cardNoticeType === 2">
        <el-select style="width:262px;" v-model="triggerCode" v-if="form.templateUseEnable" placeholder="请选择模板消息" @change="changeTemplate">
          <el-option v-for="(v, i) in templateOptions" :key="i" :label="v.templateName" :value="v.triggerCode"></el-option>
        </el-select>
      </el-form-item>

      <!-- 如果时效是实时（0）并且通知方式是微信群发接口（1） 出现补发设置-->
      <el-form-item label="补发设置" prop="templateNoticeFlag" v-if="form.cardNoticeType === 1 && form.effectType === 0">
        <el-checkbox v-model="form.templateNoticeFlag" :true-label="1" :false-label="0"
          >发送失败使用微信模板消息补发该通知
          <el-tooltip placement="top-start" content="若微信客服接口调用失败，则使用微信模板消息进行补发卡券领取通知。">
            <i class="iconfont icon-xinxixianshi pl5 gray"></i>
          </el-tooltip>
        </el-checkbox>
      </el-form-item>
      <!-- 通知非 不通知-->
      <el-form-item label="效果预览" v-if="form.cardNoticeType">
        <div>
          <!-- 通知方式是微信群发接口 -->
          <item-card :item="currentCard.item" class="mr20" v-if="form.cardNoticeType === 1"></item-card>
          <!-- 模板消息预览 -->
          <!-- （如果时效是实时（0）并且通知方式是微信群发接口（1） 并且 勾选了补发设置 出现补发设置） 或者  通知方式是微信群发接口是模板消息  -->
          <div class="ecm-msg__preview" v-if="(form.cardNoticeType === 1 && form.effectType === 0 && form.templateNoticeFlag === 1) || form.cardNoticeType === 2">
            <div class="ecm-msg__preview--inner">
              <h4 class="pre-templateName">{{ template.templateName }}</h4>
              <p class="fz13 gray pre-updateTime">{{ template.updateTime | filterDate }}</p>
              <p class="pre-header" :style="'color:' + template.headerColor + ';'">{{ template.headerText }}</p>
              <p class="pre-keyName" v-for="(v, i) in template.templateKeyDataList" :key="i">
                <template v-if="v.keyName">
                  {{ v.keyName }}
                  <span :style="`color:${v.color}`">示例文字</span>
                </template>
              </p>
              <p class="pre-remark" :style="'color:' + template.remarkColor + ';'">{{ template.remarkText }}</p>
              <div class="pre-foot">
                <span class="fz13">详情</span>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
            <div class="text-center">
              <el-button type="text" :disabled="form.templateUseEnable === 0" @click="editTemplatePre">修改</el-button>
              <el-button type="text" :disabled="form.templateUseEnable === 0" @click="resetTemplate">重置</el-button>
            </div>
          </div>
        </div>
        <div class="ecm-send__tips">
          <i class="el-icon-info pl5 gray"></i>
          <span class="fz13">若一个智能营销计划中添加多张卡券，{{ form.cardNoticeType === 1 ? '则会推送多条对话框卡券投放' : '只会推送一条模板消息卡券领取' }}通知{{ form.templateNoticeFlag ? '；使用模板消息补发时只会推送一条模板消息卡券领取通知。' : '。' }}</span>
        </div>
      </el-form-item>
    </section>
    <!-- 操作区 -->
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="submit('form')">保 存</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
    <!-- 变量弹窗 -->
    <var-dialog :options="options" :show.sync="varDialogShow" @get-data="insetVar"></var-dialog>
    <!-- 模板消息修改弹窗 -->
    <el-dialog title="修改模板消息" :visible.sync="editDialogShow" width="600px" :before-close="close">
      <div class="ecm-msg__edit">
        <div class="ecm-msg__edit--inner">
          <el-form-item label-width="100px" label="头部文案">
            <el-input type="textarea" :style="'color:' + copyTemplate.headerColor" v-model="copyTemplate.headerText" :rows="4" class="w450" :maxlength="200"></el-input>
            <div class="input-suffix clearfix">
              <el-color-picker class="ml10 vertical-middle" v-model="copyTemplate.headerColor"></el-color-picker>
              <el-button type="text" class="vertical-middle" @click="insetVarPre('headerText')">插入变量</el-button>
              <span class="gray fz13 fr mr10">{{ copyTemplate.headerText.length }}/200</span>
            </div>
          </el-form-item>
          <el-form-item label-width="100px" :label="v.keyName" v-for="(v, i) in copyTemplate.templateKeyDataList" :key="i">
            <div v-if="v.keyName">
              <span class="vertical-middle">显示接收人{{ v.keyName }}</span>
              <el-color-picker class="ml10 vertical-middle" v-model="v.color"></el-color-picker>
            </div>
          </el-form-item>
          <el-form-item label-width="100px" label="尾部文案">
            <el-input type="textarea" :style="'color:' + copyTemplate.remarkColor" v-model="copyTemplate.remarkText" :rows="4" class="w450" :maxlength="200"></el-input>
            <div class="input-suffix clearfix">
              <el-color-picker class="ml10 vertical-middle" v-model="copyTemplate.remarkColor"></el-color-picker>
              <el-button type="text" class="vertical-middle" @click="insetVarPre('remarkText')">插入变量</el-button>
              <span class="gray fz13 fr mr10">{{ copyTemplate.remarkText.length }}/200</span>
            </div>
          </el-form-item>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="editTemplate" v-loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </el-form>
</template>
<script>
import ecmForm from './form.js';
export default ecmForm;
</script>
<style lang="scss" scoped>
.ecm-msg__edit {
  display: inline-block;
  vertical-align: top;
  max-height: 400px;
  overflow: auto;
  &--inner {
    background: #fff;
    width: 565px;
    // margin: 15px auto;
    // padding: 10px;
    /deep/ .input-suffix {
      width: 448px;
      height: 40px;
      background: #f0f2f5;
      border: 1px solid #e4e7ed;
      border-top: none;
      border-radius: 0 0 4px 4px;
    }
    /deep/ .el-textarea__inner {
      color: inherit;
    }
    /deep/ .el-form-item {
      margin-bottom: 3px;
    }
  }
}
.ecm-msg__preview {
  position: relative;
  width: 320px;
  display: inline-block;
  vertical-align: middle;
  &--inner {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    width: 320px;
    min-height: 100px;
    top: 103px;
    left: 37px;
    padding: 20px 10px 10px;

    .pre-templateName {
      font-size: 17px;
      font-weight: 700;
    }
    .pre-updateTime {
      font-size: 14px;
      line-height: 1.5;
    }
    .pre-header {
      font-size: 15px;
      margin: 10px 0;
    }
    .pre-keyName {
      font-size: 14px;
      line-height: 1.5;
    }
    .pre-remark {
      font-size: 15px;
      margin: 20px 0 10px 0;
    }
    .pre-foot {
      border-top: 1px solid #dcdfe6;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
.ecm-send__tips {
  display: inline-block;
  border: 1px solid #b3d8ff;
  padding: 10px 20px;
  background: #ecf5ff;
  margin: 10px;
  i {
    color: #1890ff;
  }
}
</style>
