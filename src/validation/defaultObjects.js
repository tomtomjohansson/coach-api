'use strict';

const validator = {
  'username': {
    notEmpty: true,
    matches:{
      options: [/^[^`~<>;:"/[\]|{}()=+*]+$/, 'i'],
      errorMessage: 'Användarnamnet innehåller otillåtna tecken'
    }
  },
  'password': {
    notEmpty:true,
    isLength:{
      options:[{min:8,max:20}],
      errorMessage: 'Lösenordet måste vara minst 8 tecken.'
    },
    matches:{
      options: [/^[^`~<>;:"/[\]|{}()=+*]+$/, 'i'],
      errorMessage: 'Lösenordet innehåller otillåtna tecken'
    }
  },
  'email':{
    notEmpty: true,
    'isEmail': {
      errorMessage: 'Du måste fylla i en giltig e-postadress.'
    }
  },
  'date':{
    notEmpty: true,
    'isDate': {
      errorMessage: 'Du måste fylla i ett giltigt datum.'
    }
  },
  'number': {
    optional: {
      options: { checkFalsy: true }
    },
    isInt:{
      errorMessage:'Fältet får bara innehålla siffror.'
    }
  },
  'numberRequired': {
    isInt:{
      errorMessage:'Fältet får bara innehålla siffror.'
    }
  },
  'string': {
    optional: {
      options: { checkFalsy: true }
    },
    matches:{
      options: [/^[^`~<>;:"/[\]|{}()=+*]+$/, 'i'],
      errorMessage: 'Ett textfält innehåller otillåtna tecken'
    }
  },
  'stringRequired': {
    notEmpty: true,
    matches:{
      options: [/^[^`~<>;:"/[\]|{}()=+*]+$/, 'i'],
      errorMessage: 'Ett textfält innehåller otillåtna tecken'
    }
  },
};

module.exports = validator;
