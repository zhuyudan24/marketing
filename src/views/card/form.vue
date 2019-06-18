<template>
  <el-form class="dm-wrap" :model="form" ref="form" :rules="rules" label-width="120px">
    <el-form-item label="卡券类型">
      <el-radio-group v-model="form.cardType" :disabled="isEdit || isInfo" @change="reset">
        <el-radio :label="0">抵金券</el-radio>
        <el-radio :label="1">折扣券</el-radio>
        <el-radio :label="2">兑换券</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="卡券适用渠道" prop="cardApplyChannel">
      <el-select v-model="form.cardApplyChannel" multiple class="w400" placeholder="请选择" :disabled="isEdit || isInfo">
        <el-option v-for="item in cardApplyChannelOptions" :key="item.value" :label="item.name" :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="cardName" label="卡券名称">
      <dm-input v-model="form.cardName" class="w400" placeholder="请输入卡券名称" :disabled="isEdit || isInfo" :byteType="1" :maxlength="9"></dm-input>
    </el-form-item>

    <el-form-item prop="subName" label="备注名">
      <dm-input v-model="form.subName" class="w400" placeholder="请输入备注名称" :disabled="isEdit || isInfo" :byteType="1" :maxlength="10"></dm-input>
    </el-form-item>

    <el-form-item prop="subTitle" label="卡券副标题">
      <dm-input v-model="form.subTitle" class="w400" placeholder="请输入卡券副标题" :disabled="isEdit || isInfo" :byteType="1" :maxlength="18"></dm-input>
    </el-form-item>

    <el-form-item prop="erpDemoCode" label="demo券号">
      <el-input v-model="form.erpDemoCode" class="w400" placeholder="请输入demo券号" :disabled="isEdit || isInfo" @blur="checkErpDemoCode"></el-input>
    </el-form-item>

    <el-form-item prop="cardColor" label="卡券颜色" style="height: 40px;">
      <el-color-picker v-model="form.cardColor" :disabled="isInfo"></el-color-picker> <span class="vertical-top">{{ form.cardColor }}</span>
    </el-form-item>

    <!-- 抵金券 -->
    <el-form-item prop="cardDenomination" label="减免金额" v-if="form.cardType === 0"> <el-input-number controls-position="right" :disabled="isEdit || isInfo" v-model="form.cardDenomination" class="200" :precison="0" :min="0"></el-input-number> 元 <span class="fz12 gray">请输入大于0的整数</span> </el-form-item>

    <!-- 折扣券 -->
    <el-form-item prop="cardDenomination" label="折扣额度" v-if="form.cardType === 1"> <el-input-number controls-position="right" :disabled="isEdit || isInfo" v-model="form.cardDenomination" class="200" :precision="1" :step="0.1" :max="9.9" :min="0"></el-input-number> 折 <span class="fz12 gray">请填写1-9.9之间的数字</span></el-form-item>

    <el-form-item label="优惠金额封顶" v-if="form.cardType === 1"> <el-input-number controls-position="right" :disabled="isEdit || isInfo || discountAmountCheck" v-model="form.discount_amount_upper_limit" class="200" :precision="2" :step="1" :min="0"></el-input-number> 元 &nbsp;<el-checkbox v-model="discountAmountCheck" :disabled="isEdit || isInfo">不封顶</el-checkbox><span class="pl10 fz12 gray vertical-baseline">*该条件目前仅线上可用</span> </el-form-item>

    <el-form-item label="最大商品优惠数" v-if="form.cardType === 1"> <el-input-number controls-position="right" :disabled="isEdit || isInfo || goodsDiscountCheck" v-model="form.goods_discounts_number_upper_limit" class="200" :precision="0" :step="1" :min="0"></el-input-number> 件 &nbsp;<el-checkbox v-model="goodsDiscountCheck" :disabled="isEdit || isInfo">无上限</el-checkbox><span class="pl10 fz12 gray vertical-baseline">*该条件目前仅线上可用</span> </el-form-item>

    <!-- 兑换券无 -->
    <el-form-item prop="" label="使用条件">
      <div v-show="form.cardType === 0" class="mb10">
        <el-checkbox :disabled="isEdit || isInfo" v-model="sale_limit.flag">最低消费满</el-checkbox>
        <el-input-number controls-position="right" :min="0" @focus="sale_limit.flag = true" :disabled="isEdit || isInfo" v-model="sale_limit.fee" class="w200"></el-input-number> 元可使用
      </div>
      <div v-show="form.cardType !== 2"><el-checkbox :disabled="isEdit || isInfo" v-model="goods.flag">适用商品</el-checkbox> <span class="fz12 gray">（至少填写一项）</span></div>
      <div class="mb10" v-show="form.cardType !== 2"><span class="inline-block w110 text-right">适用商品</span> <dm-input @focus="goods.flag = true" v-model="goods.ok" :disabled="isEdit || isInfo" class="w300" placeholder="限制18个汉字内" :maxlength="18"></dm-input></div>
      <div v-show="form.cardType !== 2" class="mb10"><span class="inline-block w110 text-right">不适用商品</span> <dm-input @focus="goods.flag = true" v-model="goods.no" :disabled="isEdit || isInfo" class="w300" placeholder="限制18个汉字内" :maxlength="18"></dm-input></div>
      <!-- 微盟适用商品 -->
      <div v-loading="wmloading" element-loading-spinner="el-icon-loading" element-loading-background="rgba(255, 255, 255, 0)">
        <div v-if="(form.cardType === 0 || form.cardType === 1) && form.cardApplyChannel.indexOf('WMmicroMall') !== -1">
          <div v-for="(list, idx) in goodsList" :key="idx" class="mb10" id="wnsysp">
            <span class="inline-block w110 text-right">
              微盟适用商品
              <span v-show="goodsList.length !== 1">{{ idx + 1 }}</span>
            </span>
            <el-select :disabled="isEdit" class="w200" v-model="list.v1" filterable placeholder=" 选择商品类目" clearable :loading="loading" @change="handleF1Change($event, idx)">
              <el-option v-for="item in f1" :key="item.id" :label="item.title" :value="item.id"></el-option>
            </el-select>
            <el-select v-show="list.f2.length > 0" :disabled="isEdit || list.isCopy" class="w200" v-model="list.v2" filterable remote reserve-keyword placeholder="选择商品参数" clearable :loading="loading" @change="handleF2Change($event, idx)">
              <el-option v-for="item in list.f2" :key="item.id" :label="item.title" :value="item.id"></el-option>
            </el-select>
            <el-select v-if="list.f3.length > 0" :disabled="isEdit || list.isCopy" class="w250" v-model="list.v3" multiple filterable remote reserve-keyword placeholder="选择商品参数值" clearable :loading="loading">
              <el-option v-for="item in list.f3" :key="item.id" :label="item.title" :value="item.id"></el-option>
            </el-select>
            <div v-if="isAdd || isCopy" class="inline-block">
              <el-button v-if="list.isCopy" type="warning" icon="el-icon-edit" circle @click="getLine(idx)"></el-button>
              <el-button v-show="idx === goodsList.length - 1 && goodsList.length < 10" type="primary" icon="el-icon-plus" circle @click="addLine"></el-button>
              <el-button icon="el-icon-delete" circle @click="delLine(idx)"></el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- {{ goodsList }} -->
      <!-- {{ coupGoodsWeimobList }} -->
      <!-- 兑换券 -->
      <div v-show="form.cardType === 2" class="mb10"><el-checkbox :disabled="isEdit || isInfo" v-model="sale_limit.flag">消费条件</el-checkbox> <span class="fz12 gray">（至少填写一项）</span></div>
      <div class="mb10" v-show="form.cardType === 2">
        <el-radio v-model="sale_limit.type" :label="1" :disabled="isEdit || isInfo">
          消费金额满
          <el-input-number
            controls-position="right"
            @focus="
              sale_limit.type = 1;
              sale_limit.flag = true;
            "
            :disabled="isEdit || isInfo"
            :precision="1"
            :min="0"
            class="w300"
            v-model="sale_limit.fee"
          ></el-input-number>
          元可使用
        </el-radio>
      </div>
      <div v-show="form.cardType === 2" class="mb10">
        <el-radio v-model="sale_limit.type" :label="2" :disabled="isEdit || isInfo">
          消费指定商品
          <el-input
            @focus="
              sale_limit.type = 2;
              sale_limit.flag = true;
            "
            :disabled="isEdit || isInfo"
            class="w300"
            v-model="sale_limit.goods"
          ></el-input>
          可使用
          <div class="pl25 pt10">指定商品货号 <dm-goods-input :disabled="isEdit || isInfo" class="w300 inline-block" v-model="form.proNoList" :multiple="false"></dm-goods-input></div>
          <div class="pl25 pt10" v-show="products_exchange_number_show">兑换商品件数 <el-input-number controls-position="right" :disabled="isEdit || isInfo" v-model="form.products_exchange_number" class="200" :precision="0" :step="1" :min="0"></el-input-number></div>
        </el-radio>
      </div>
      <div>
        <el-checkbox v-model="only" :disabled="isEdit || isInfo">不与其它优惠共享</el-checkbox>
      </div>
    </el-form-item>
    <el-form-item prop="cardLimit" label="领券限制">
      <el-radio-group v-model="cardLimitRadio" :disabled="isEdit || isInfo">
        <el-radio :label="1">1张/人</el-radio>
        <el-radio :label="100">100张/人</el-radio>
        <el-radio :label="0"> <el-input-number controls-position="right" :min="0" class="w150" v-model="form.cardLimit" :disabled="isEdit || isInfo"></el-input-number> 张/人 <span class="fz13 gray">每个用户领券上限，默认为1</span> </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item prop="costValue" label="成本费用" v-show="form.cardType !== 1"> <el-input-number controls-position="right" :disabled="isEdit || isInfo" :precision="2" :min="0" class="w200" v-model="form.costValue"></el-input-number> 元 <span class="fz13 gray">请填写大于0的数字（限制两位小数）</span> </el-form-item>
    <el-form-item label="code类型">
      <el-radio v-model="form.useCustomCode" :label="0" :disabled="isEdit || isInfo">随机生成</el-radio>
      <el-radio v-model="form.useCustomCode" :label="1" :disabled="isEdit || isInfo">自定义号段</el-radio>
    </el-form-item>

    <el-form-item prop="customCodeBegin" label="code号段" v-show="form.useCustomCode === 1">
      <el-input :disabled="isEdit || isInfo" :min="0" :maxlength="16" class="w250" v-model="form.customCodeBegin" @blur="checkInputNumber(form.customCodeBegin, 'customCodeBegin')"></el-input> —
      <el-input :disabled="isEdit || isInfo" :min="0" :maxlength="16" class="w250" v-model="form.customCodeEnd" @blur="checkInputNumber(form.customCodeEnd, 'customCodeEnd')"></el-input>
      <span class="fz13 gray">限制16位以内纯数字</span>
      <div class="pt20">
        <el-checkbox v-model="form.useCodePrefix" :true-label="1" :false-label="0" :disabled="isEdit || isInfo">固定开头</el-checkbox>
        <el-input class="w400" :disabled="isEdit || isInfo" v-model="form.customCodePrefix" :maxlength="6" @focus="form.useCodePrefix = 1" @blur="checkInputString(form.customCodePrefix, 'customCodePrefix')"></el-input>
        <span class="fz13 gray">限制6位以内字母/数字</span>
      </div>
      <div class="pt20">
        <el-checkbox v-model="form.useCodeSuffix" :true-label="1" :false-label="0" :disabled="isEdit || isInfo">固定结尾</el-checkbox>
        <el-input :disabled="isEdit || isInfo" class="w400" v-model="form.customCodeSuffix" :maxlength="4" @focus="form.useCodeSuffix = 1" @blur="checkInputString(form.customCodeSuffix, 'customCodeSuffix')"></el-input>
        <span class="fz13 gray">限制4位以内字母/数字</span>
      </div>
    </el-form-item>

    <el-form-item prop="cardCodeCount" :label="form.useCustomCode ? '默认数量' : '新建数量'">
      <div v-show="!form.useCustomCode"><el-input-number controls-position="right" :min="0" :max="10000000" :disabled="isEdit || isInfo" class="w200" v-model="form.cardCodeCount"></el-input-number> 张 <span class="fz13 gray">优惠券创建数量，如不填，则默认为100,000张</span></div>
      <div v-show="form.useCustomCode"><el-input-number controls-position="right" :min="0" :max="100000" disabled class="w200" :value="form.customCodeEnd - form.customCodeBegin + 1"></el-input-number> 张 <span class="fz13 gray">优惠券创建数量，如不填，则默认为100,000张</span></div>
    </el-form-item>

    <el-form-item class="is-required" prop="useCustomCode" label="有效期">
      <div>
        <el-radio v-model="form.cardEffectiveMode" :disabled="isEdit || isInfo" :label="0">固定日期</el-radio>
        <el-date-picker v-model="form.dateTime" @focus="form.cardEffectiveMode = 0" :disabled="isEdit || isInfo" :picker-options="pickerOptions" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </div>
      <div class="pt20">
        <el-radio v-model="form.cardEffectiveMode" :label="1" :disabled="isEdit || isInfo">领取后，</el-radio>
        <el-select v-model="form.startDay" @focus="form.cardEffectiveMode = 1" class="w200" placeholder="请选择" :disabled="isEdit || isInfo">
          <el-option v-for="item in startDayOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        生效，有效天数 <el-input-number controls-position="right" class="w200" @focus="form.cardEffectiveMode = 1" :disabled="isEdit || isInfo" v-model="form.limitDay" :precision="0" :min="0"></el-input-number> 天
      </div>
    </el-form-item>

    <el-form-item prop="cardExplain" label="适用门店说明">
      <dm-input class="w400" v-model="form.cardExplain" :disabled="isInfo" :maxlength="50"></dm-input>
    </el-form-item>

    <el-form-item label="适用门店">
      <el-radio v-model="storeMode" :label="0">所有门店</el-radio>
      <el-radio v-model="storeMode" :label="1">部分门店</el-radio>
      <vue-gic-store-card class="pt10" v-show="storeMode" ref="storeCard" :uuid.sync="uuid"></vue-gic-store-card>
    </el-form-item>

    <el-form-item prop="image" label="(选填)封面图片">
      <dm-upload-img :disabled="isEdit || isInfo" :model.sync="form.image" width="64" label="上传图片" url="/api-plug/upload-img" tips="图片建议尺寸：850px*350px，大小不超过2M"></dm-upload-img>
    </el-form-item>

    <el-form-item prop="coverDescript" label="(选填)封面简介">
      <dm-input class="w400" v-model="form.coverDescript" :disabled="isEdit || isInfo" :maxlength="12"></dm-input>
    </el-form-item>

    <el-form-item prop="useDescript" label="使用说明">
      <dm-input class="w400" type="textarea" :rows="4" v-model="form.useDescript" :maxlength="500" :disabled="isInfo"></dm-input>
    </el-form-item>

    <el-form-item prop="teletexts" label="(选填)图文介绍">
      <p class="fz13 gray">图片建议尺寸：900px*500px，大小不超过2M，格式限制JPG；至少上传1组图文，最多输入5000字</p>
      <img-text-drag :list.sync="imgTextList" :disabled="form.auditingStatus === 1"></img-text-drag>
    </el-form-item>

    <el-form-item label="放入卡券展架" v-show="cardLimitRadio === 1" v-loading="cardShelfsLoading">
      <el-transfer :disabled="isInfo" filterable :filter-method="filterMethod" filter-placeholder="输入展架名称搜索" v-model="form.shelfIds" :titles="['所有门店展架', '选中的展架']" :data="cardShelfsList"> </el-transfer>
    </el-form-item>

    <el-form-item prop="verificationType" label="核销方式" v-show="form.cardType === 2">
      <el-radio v-model="form.verificationType" :label="0" :disabled="isEdit || isInfo">会员自助核销</el-radio>
      <el-radio v-model="form.verificationType" :label="1" :disabled="isEdit || isInfo">收银台录入核销</el-radio>
    </el-form-item>

    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="submitForm('form')" v-loading="submitLoading" v-show="!isInfo">保存并提交审核</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
  </el-form>
</template>

<script>
import cardForm from './form.js';
export default cardForm;
</script>
