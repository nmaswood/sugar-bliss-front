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

      this.carrierPrices = [];
      this.perItemArray= [];
      this.custom = [];
      this.errors = [];

      const data = this.processInformation();

      const URL = 'https://z9cherqts7.execute-api.us-west-2.amazonaws.com/api/submit'
      const promise = axios.post(URL, data);
      this.loading = true;

      const that = this;

      promise.then(function(res) {
        that.loading = false;

        if (res.data.status == 'fail'){
          that.errors = res.data.errors;
          return;
        }
        const data_body = res.data.data;


        const base_price_dict = data_body.base_price_dict;
        const food_item_dict = data_body.food_item_dict;

        var ls = [];
        var usm = [];

        that.bestUsmPrice = base_price_dict.best_usm_price;
        that.bestUsmCarrier = base_price_dict.best_usm;

        that.bestLdPrice = base_price_dict.best_ld_price;
        that.bestLdCarrier = base_price_dict.best_ld_carrier;

        that.carrierPrices = base_price_dict.carrier_prices;

        const multiplier = base_price_dict.multiplier;

        that.multiplier = multiplier;


        const ld_food = food_item_dict.ld;
        const usm_food = food_item_dict.usm;

        that.ld_food = ld_food;
        that.usm_food = usm_food;


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
      bestUsmPrice: 'N/A',
      bestUsmCarrier: 'N/A',
      bestLdPrice: 'N/A',
      bestLdCarrier: 'N/A',
      loading: false,
      usmBase: 0,
      carrierPrices: [],
      ld_food: 'N/A',
      usm_food: 'N/A',
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
      perItemArray: [],
      errors: [],
      prices : {},
      custom: [],
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
