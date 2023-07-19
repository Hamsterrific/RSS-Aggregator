import i18next from 'i18next';
import * as yup from 'yup';
import setLocale from './locales/setlocale.js';
import watch from './view.js';
import resources from './locales/index.js';
import getRss, { processFeed, processPosts } from './rss.js';

const elements = {
  form: document.querySelector('.rss-form'),
  submit: document.querySelector('button[type="submit"]'),
  input: document.querySelector('#url-input'),
  feedback: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
  modal: document.querySelector('#modal'),
};

const defaultLang = 'ru';

const validate = (url, urls) => {
  const schema = yup.string().url().notOneOf(urls).required();
  return schema
    .validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const processRss = (data, state) => {
  const { url, rss } = data;
  const feed = processFeed(rss);
  const posts = processPosts(rss);
  state.urls.push(url);
  state.feeds.push(feed);
  state.posts.push(...posts);
  // eslint-disable-next-line no-param-reassign
  state.loadingProcess.state = 'success';
};

const updateRss = (time, state) => {
  setTimeout(() => {
    const { urls } = state;
    const newRss = urls.map(getRss);
    const oldPosts = state.posts;
    Promise.all(newRss).then((item) => {
      const newPosts = item.map(({ rss }) => processPosts(rss));
      const uniquePosts = newPosts
        .flat()
        .filter(
          (newPost) => !oldPosts.some((oldPost) => oldPost.id === newPost.id)
        );
      if (uniquePosts.length > 0) {
        // eslint-disable-next-line no-param-reassign
        state.posts = [...uniquePosts, ...state.posts];
      }
    });
    updateRss(time, state);
  }, time);
};

export default () => {
  const initState = {
    form: {
      valid: true,
      message: '',
    },
    loadingProcess: {
      state: 'idle',
      message: '',
    },
    uiState: {
      activeModal: '',
      viewedPosts: [],
    },
    posts: [],
    feeds: [],
    urls: [],
  };
  i18next
    .init({
      debug: false,
      lng: defaultLang,
      resources,
    })
    .then(setLocale())
    .then(() => {
      const watchedState = watch(elements, i18next, initState);
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        validate(url, watchedState.urls).then((error) => {
          if (error) {
            console.log(error);
            watchedState.form.valid = false;
            watchedState.form.message = error;
            return;
          }
          watchedState.form.valid = true;
          watchedState.loadingProcess.state = 'loading';
          getRss(url)
            .then((data) => processRss(data, watchedState))
            .catch((err) => {
              const { message } = err;
              watchedState.form.valid = false;
              watchedState.loadingProcess.state = 'failed';
              if (message === 'parseError' || message === 'networkError') {
                watchedState.form.message = i18next.t(`errors.${message}`);
              } else {
                watchedState.form.message = message;
              }
            })
            .finally(() => {
              watchedState.loadingProcess.state = 'idle';
            });
        });
      });

      elements.posts.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          watchedState.uiState.activeModal = e.target.dataset.id;
          watchedState.uiState.viewedPosts.push(e.target.dataset.id);
        }
        if (e.target.tagName === 'A') {
          watchedState.uiState.viewedPosts.push(e.target.dataset.id);
        }
      });
      updateRss(5000, watchedState);
    });
};
