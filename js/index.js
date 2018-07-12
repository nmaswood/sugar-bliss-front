import Vue from 'vue';
import axios from 'axios';

import 'bootstrap';

import '../style/index.scss';


var vm = new Vue({
  el: '#vue-instance',
  methods: {
    processInformation: function() {

      const values = {}

      this.foodItems.forEach((x) => values[x.model] = x.value || 0)
      this.configItems.forEach((x) => values[x.model] = x.value)

      return values;
    },

    postInformation: function() {
      const errors = this.validateData(this.form);

      if (errors.length) {
        console.log(errors);
        return;
      }

      this.carrierItems = [];
      this.foodItemsRes = [];
      this.custom = [];

      const data = this.processInformation();

      const URL = 'https://20h5r08zva.execute-api.us-east-1.amazonaws.com/api/submit'
      const promise = axios.post(URL, data);
      
      const that = this;

      promise.then(function(res) {

        const data = res.data;

        console.log(data);

        that.vendor = data.vendor;
        that.price= data.price;

        that.carrierItems.push({
          'price': data.base_price_dict.USM,
          'msg': data.base_price_dict.USM,
          'carrier': 'USM'
        });

        that.carrierItems.push({
          'price': data.base_price_dict.LS,
          'carrier': 'LD'
        });

        const keys = ['cakePops', 'frenchMacarons', 'miniCupcakes', 'other', 'regularCupcakes', 'tiers'];
        const display = ['Cake Pops', 'French Macarons', 'Mini Cupcakes', 'Other', 'Regular Cupcakes', 'Tiers'];

        that.custom = data.food_item_dict.custom;

        that.ldSum = data.food_item_dict.ld_sum;
        that.usmSum = data.food_item_dict.usm_sum;

        for (let i = 0; i < keys.length; i++) {
          let item = data.food_item_dict.per_item[keys[i]];

          if (!item._input) {
            continue;
          }

          const status = item.status;
          let msg = '';

          if (status == 'LD_NULL' || status == 'USM_NULL' || status == 'LD_AND_USM_NULL') {
          } else if (status == 'CUSTOM') {
            msg = 'Price needs to be custom calculated';
          }
          that.foodItemsRes.push({
            'name': display[i],
            'usm': item.usm,
            'ls': item.ld
          })
        }

      });

    },
    validateData: function(formData) {
      const errors = [];
      //if (!/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(formData.zipCode)){
      //errors.push('Invalid Zipcode');
      //}

      return errors;

    }
  },
  data: function() {

    const currentDateTime = new Date();
    const asString = currentDateTime.toISOString();

    return {
      zipCode: '',
      dateTime: '',
      miniCupcakes: '',
      regularCupcakes: '',
      cakePops: '',
      frenchMacarons: '',
      tiers: '',
      other: '',
      carrierItems: [],
      foodItemsRes: [],
      vendor:'',
      price :0,
      custom: [],
      ldSum: 0,
      usmSum: 0,
      configItems: [{
          'model': 'zipCode',
          'label': 'Enter your zipcode.',
          'inputType': 'text',
          'value': '60601'
        },
        {
          'model': 'dateTime',
          'label': 'Enter the date.',
          'inputType': 'datetime-local',
          'value': asString
        }
      ],
      foodItems: [{
          'model': 'miniCupcakes',
          'displayName': 'Mini Cupcakes',
          'hint': 'In dozens',
          'value': 0
        },
        {
          'model': 'regularCupcakes',
          'displayName': 'Regular Cupcakes',
          'hint': 'In dozens',
          'value': 0
        },
        {
          'model': 'cakePops',
          'displayName': 'Cake Pops',
          'hint': 'In dozens',
          'value': 0
        },
        {
          'model': 'frenchMacarons',
          'displayName': 'French Macarons',
          'hint': 'In dozens',
          'value': 0
        },
        {
          'model': 'tiers',
          'displayName': 'Tiers',
          'hint': '',
          'value': 0
        },
        {
          'model': 'other',
          'displayName': 'Other',
          'hint': '',
          'value': 0
        }
      ]
    }
  }
});
