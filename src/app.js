//import i18next from 'i18next';
import * as yup from 'yup';
import watch from './view.js';

    const initState = {
    urls: [],
    form: {
        status: null,
        valid: false,
        errors: [],
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
    const schema = yup.string().url().notOneOf(initState.urls).required();


    const watchedState = watch(elements, i18n, initState);
    watchedState.form.status = 'filling';

    const storeUrl = (url) => {
        watchedState.urls.push(url);
        state.feedback.valid = true;
    }

export default async () => {
    elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('1');
    const formData = new FormData(e.target);
    const url = Object.fromEntries(formData);
    try {
      await schema.validate(url, { abortEarly: false });
      watchedState.form.errors = [];
      watchedState.form.valid = true;
    } catch (err) {
      const validationErrors = err.inner.reduce((acc, cur) => {
        const { path, message } = cur;
        return {...acc, [path]: [...acc[path] || [], message]};
      }, {});
      watchedState.form.errors = validationErrors;
    };
  })
  .then((url) => storeUrl(url));
};