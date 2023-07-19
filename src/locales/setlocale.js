import * as yup from 'yup';
import i18next from 'i18next';

const setLocale = () => {
  yup.setLocale({
    string: {
      url: () => i18next.t('errors.invalidUrl'),
    },
    mixed: {
      notOneOf: () => i18next.t('errors.alreadyExists'),
      required: () => i18next.t('errors.required'),
    },
  });
};

export default setLocale;
