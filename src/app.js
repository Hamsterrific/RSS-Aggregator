import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import customValidationMsg from './locales/custom_validation_msg.js';
import watch from './view.js';
import resources from './locales/index.js';
import parseRss from './rss.js';

const defaultLang = 'en';
const updateInterval = 5000;
const axiosTimeout = 10000;

const extractUrls = (state) => {
  const urls = state.feeds.map((feed) => feed.url);
  return urls;
};

const validate = (url, urls) => {
  const schema = yup.string().url().notOneOf(urls).required();
  return schema
    .validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const createProxyUrl = (url) => {
  const proxyUrl = new URL('get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('disableCache', true);
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.href;
};

const getErrorCode = (error) => {
  if (error.isAxiosError) {
    return 'networkError';
  }
  if (error.isParseError) {
    return 'parseError';
  }
  return 'unknownError';
};

const getRss = (url, state) => {
  // eslint-disable-next-line no-param-reassign
  state.loadingProcess = { status: 'loading' };
  const proxyUrl = createProxyUrl(url);
  return axios({
    method: 'get',
    url: proxyUrl,
    timeout: axiosTimeout,
  })
    .then((response) => {
      const { data } = response;
      const { title, description, items } = parseRss(data.contents);
      // eslint-disable-next-line no-param-reassign
      state.loadingProcess = { error: '', status: 'success' };
      const feed = {
        id: uniqueId(),
        title,
        description,
        url,
      };
      const posts = items.map((item) => ({
        ...item,
        feedId: feed.id,
        id: uniqueId(),
      }));
      state.feeds.push(feed);
      state.posts.push(...posts);
    })
    .catch((err) => {
      // eslint-disable-next-line no-param-reassign
      state.loadingProcess = { error: getErrorCode(err), status: 'failed' };
    });
};

const updateRss = (time, state) => {
  const axiosRequests = state.feeds.map((feed) => {
    const proxyUrl = createProxyUrl(feed.url);
    return axios({
      method: 'get',
      url: proxyUrl,
      timeout: axiosTimeout,
    })
      .then((response) => {
        const { items } = parseRss(response.data.contents);
        const oldLinks = state.posts
          .filter(({ feedId }) => feedId === feed.id)
          .map((post) => post.link);
        const newPosts = items.filter(
          ({ link }) => !oldLinks.some((post) => post === link),
        );
        const relatedPosts = newPosts.map((item) => ({
          ...item,
          id: uniqueId(),
          feedId: feed.id,
        }));
        // eslint-disable-next-line no-param-reassign
        state.posts = [...relatedPosts, ...state.posts];
      })
      .catch((error) => {
        console.error(error);
      });
  });

  return Promise.all(axiosRequests).finally(() => {
    setTimeout(() => updateRss(time, state), time);
  });
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    submit: document.querySelector('button[type="submit"]'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };
  const initState = {
    form: {
      isValid: true,
      error: '',
    },
    loadingProcess: {
      status: 'idle',
      error: '',
    },
    ui: {
      activePost: '',
    },
    posts: [],
    feeds: [],
    viewedPosts: new Set(),
  };
  i18next
    .init({
      debug: false,
      lng: defaultLang,
      resources,
    })
    .then(() => {
      yup.setLocale(customValidationMsg);
      const watchedState = watch(elements, i18next, initState);
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const urls = extractUrls(watchedState);
        validate(url, urls).then((error) => {
          if (error) {
            watchedState.form = { isValid: false, error };
            return;
          }
          watchedState.form = { isValid: true, error: '' };
          getRss(url, watchedState);
        });
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) {
          return;
        }
        watchedState.ui.activePost = id;
        watchedState.viewedPosts.add(id);
      });
      updateRss(updateInterval, watchedState);
    });
};
