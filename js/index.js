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

      return values;
    },

    postInformation: function() {

      this.carrierItems = [];
      this.perItemArray= [];
      this.custom = [];
      this.errors = [];

      const data = this.processInformation();

      const URL = 'https://20h5r08zva.execute-api.us-east-1.amazonaws.com/api/submit'
      const promise = axios.post(URL, data);

      const that = this;

      promise.then(function(res) {

        if (res.data.status == 'fail'){
          that.errors = res.data.errors;
          return;
        }
        const data_body = res.data.data;

        const usm_final = data_body.usm_final;
        const ld_final = data_body.ld_final;


        const base_price_dict = data_body.all.base_price_dict;
        const food_item_dict = data_body.all.food_item_dict;

        //debugger;

        const ldBase = base_price_dict.LS;
        const usmBase = base_price_dict.USM;
        const multiplier = base_price_dict.multiplier;

        that.ldBase = ldBase;
        that.usmBase = usmBase;
        that.multiplier = multiplier;


        const ld_food = food_item_dict.ld;
        const usm_food = food_item_dict.usm;


        const perItemArray = []

        const keys = ['cakePops', 'frenchMacarons', 'miniCupcakes', 'other', 'regularCupcakes', 'tiers'];
        const display = ['Cake Pops', 'French Macarons', 'Mini Cupcakes', 'Other', 'Regular Cupcakes', 'Tiers'];


        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          let displayWord = display[i];

          let item = food_item_dict.per_item[key];


          if (!item._input) {
            continue;
          }

          const status = item.status;
          let msg = '';

          var ld = '$' + item.ld;
          var usm = '$'+ item.usm;

          if (status == 'LD_NULL'){
            ld = 'N/A'
          } else if (status == 'USM_NULL') {
            usm = 'N/A'
          } else if (status == 'LD_AND_USM_NULL'){
            ld = 'N/A'
            usm = 'N/A'
          } else if (status == 'CUSTOM'){
            ld = 'N/A'
            usm = 'N/A'
            msg = `${displayWord} price needs to be custom calculated`;
          }
          perItemArray.push({
            'name': display[i],
            'usm': usm,
            'ls': ld
          })
        }
      that.perItemArray = perItemArray;
      });

    },
  },
  data: function() {

    const currentDateTime = new Date();
    const asString = currentDateTime.toDateString();

    return {
      usmBase: 0,
      ldBase: 0,
      multiplier: 0,
      zipCode: '',
      dateTime: '',
      miniCupcakes: '',
      regularCupcakes: '',
      cakePops: '',
      frenchMacarons: '',
      tiers: '',
      other: '',
      carrierItems: [],
      perItemArray: [],
      errors: [],
      vendor:'',
      prices : {},
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
        'hint': 'dozens (min 9, max 56)',
        'value': 0,
        'min': 8,
        'max': 56
      },
        {
          'model': 'regularCupcakes',
          'displayName': 'Regular Cupcakes',
          'hint': 'dozens (min 5, max 52) ',
          'value': 0,
          'min': 5,
          'max': 52
        },
        {
          'model': 'cakePops',
          'displayName': 'Cake Pops',
          'hint': 'dzn (min 23, max 110)',
          'value': 0,
          'min': 23,
          'max': 110
        },
        {
          'model': 'frenchMacarons',
          'displayName': 'French Macarons',
          'hint': 'dozens (min 17, max 79)',
          'value': 0,
          'min': 17,
          'max': 79
        },
        {
          'model': 'tiers',
          'displayName': 'Tiers',
          'hint': '(min 1, max 5)',
          'value': 0,
          'min': 1,
          'max': 5
        },
        {
          'model': 'other',
          'displayName': 'Other',
          'hint': '(min 1, max 5)',
          'value': 0,
          'min': 1,
          'max': 5
        }
      ]
    }
  }
});
