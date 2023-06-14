import i18next from 'i18next';
import * as yup from 'yup';
import watch from './view.js';

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
    const watchedState = watch(elements, i18next, initState);
    watchedState.form.status = 'filling';

const storeUrl = (url, state) => {
        state.urls.push(url);
        console.log("store URL " + url);
        console.log(state.urls);
    };

export default () => {
    elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    try {
      const schema = yup.string().url().required().notOneOf(watchedState.urls, 'alreadyExists');
      const result = await schema.validate(url, { abortEarly: false });
      console.log(result);
      watchedState.form.valid = true;
      watchedState.feedback.valid = true;
      storeUrl(url, watchedState);
    } catch (err) {
        const { message } = err;
        console.log(message);
        watchedState.feedback.valid = false;
        watchedState.feedback.message = message;
        watchedState.form.valid = false;
      };
    });
};