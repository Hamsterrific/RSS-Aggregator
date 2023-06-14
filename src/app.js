import i18next from 'i18next';
import * as yup from 'yup';
import watch from './view.js';
import resources from './locales/index.js';

const initState = {
  urls: [],
  form: {
    status: null,
    valid: true,
  },
  feedback: {
    valid: false,
    message: '',
  },
};

const elements = {
  form: document.querySelector('.rss-form'),
  submit: document.querySelector('button[type="submit"]'),
  input: document.querySelector('#url-input'),
  feedback: document.querySelector('.feedback'),
};

const defaultLang = 'ru';

yup.setLocale({
  string: {
    url: () => i18next.t('errors.invalidUrl'),
  },
  mixed: {
    notOneOf: () => i18next.t('errors.alreadyExists'),
    required: () => i18next.t('errors.required'),
  },
});

const watchedState = watch(elements, i18next, initState);
watchedState.form.status = 'filling';

const storeUrl = (url) => {
  watchedState.urls.push(url);
};

export default () => {
  i18next
    .init({
      debug: false,
      lng: defaultLang,
      resources,
    })
    .then(() => {
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.feedback.message = '';
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const schema = yup
          .string()
          .url()
          .required()
          .notOneOf(watchedState.urls, 'alreadyExists');

        schema
          .validate(url, { abortEarly: false })
          .then(() => {
            watchedState.form.valid = true;
            watchedState.feedback.valid = true;
            watchedState.form.status = 'submitted';
            watchedState.feedback.message = i18next.t('loadSuccess');
            storeUrl(url);
          })
          .catch((err) => {
            const { message } = err;
            watchedState.feedback.valid = false;
            watchedState.feedback.message = message;
            watchedState.form.valid = false;
          });
      });
    });
};
