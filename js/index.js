import Vue from 'vue';
import axios from 'axios';

import 'bootstrap';

import '../style/index.scss';


var vm = new Vue({
  el: '#vue-instance',
  methods: {
    processInformation: function() {

      const values = {};

      this.foodItems.forEach((x) => values[x.model] = x.value || 0);
      this.configItems.forEach((x) => values[x.model] = x.value);

      if (this.time.toString() == '[object Object]'){
        values.time = '';
      } else {
        values.time = this.time;
      }
      debugger;

      return values;
    },

    postInformation: function() {

      this.carrierItems = [];
      this.foodItemsRes = [];
      this.custom = [];
      this.errors = [];

      const data = this.processInformation();

      const URL = 'https://z9cherqts7.execute-api.us-west-2.amazonaws.com/api/submit'
      const promise = axios.post(URL, data);

      const that = this;

      promise.then(function(res) {

        const data = res.data;

        if (res.data.status == 'fail'){
          that.errors = res.data.errors;
          return;
        }

        debugger;


        console.log(data);

        that.price = data.price;

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
  },
  data: function() {

    const currentDateTime = new Date();
    const asString = currentDateTime.toDateString();

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
      errors: [],
      vendor:'',
      price :0,
      custom: [],
      ldSum: 0,
      usmSum: 0,
      time: {
        'model': 'time',
        'value': ''
      },
      configItems: [{
        'model': 'zipCode',
        'label': 'Enter your zipcode.',
        'inputType': 'text',
        'value': '60601'
      },
        {
          'model': 'dateTime',
          'label': 'Enter the date.',
          'inputType': 'date',
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
