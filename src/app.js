import i18next from 'i18next';
import * as yup from 'yup';
import watch from './view.js';
import resources from './locales/index.js';
import getRss, { processFeed, processPosts } from './rss.js';

const initState = {
  status: null,
  form: {
    valid: true,
    submitted: false,
  },
  feedback: {
    valid: false,
    message: '',
  },
  posts: [],
  feeds: [],
  urls: [],
  rssLoaded: false,
};

const elements = {
  form: document.querySelector('.rss-form'),
  submit: document.querySelector('button[type="submit"]'),
  input: document.querySelector('#url-input'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
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
watchedState.status = 'filling';

const processRss = (data) => {
  const { url, rss } = data;
  const feed = processFeed(rss);
  const posts = processPosts(rss)
  watchedState.rssLoaded = true;
  watchedState.urls.push(url);
  watchedState.feeds.push(feed);
  watchedState.posts.push(...posts);
  watchedState.feedback.message = i18next.t('loadSuccess');
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
          .notOneOf(watchedState.urls);

        schema
          .validate(url, { abortEarly: false })
          .then((url) => {
            watchedState.form.valid = true;
            watchedState.feedback.valid = true;
            watchedState.form.submitted = true;
            return url;
          })
          .then((url) => getRss(url))
          .then((data) => processRss(data))
          .catch((err) => {
            const { message } = err;
            watchedState.feedback.valid = false;
            watchedState.feedback.message = message;
            watchedState.form.valid = false;
          });
      });
    });
};
