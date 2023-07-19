import onChange from 'on-change';

export default (elements, i18n, initialState) => {
  const renderForm = (state) => {
    const { input } = elements;
    if (state.form.valid) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');
    }
  };

  const renderFormFeedback = (state) => {
    const { feedback } = elements;
    if (state.form.valid) {
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
    } else {
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
    }
    feedback.textContent = state.form.message;
  };

  const renderFeeds = (state) => {
    const listGroup = document.querySelector('.feeds .card .list-group');
    state.feeds.forEach((feed) => {
      const item = document.createElement('li');
      item.classList.add('list-group-item', 'border-0', 'border-end-0');
      listGroup.appendChild(item);
      const itemTitle = document.createElement('h3');
      itemTitle.classList.add('h6', 'm-0');
      itemTitle.textContent = feed.title;
      item.appendChild(itemTitle);
      const itemDesc = document.createElement('p');
      itemDesc.classList.add('m-0', 'small-text-black-50');
      itemDesc.textContent = feed.description;
      item.appendChild(itemDesc);
    });
  };

  const renderPosts = (state) => {
    const listGroup = document.querySelector('.posts .card .list-group');
    state.posts.forEach((post) => {
      const { title, link, id } = post;
      const item = document.createElement('li');
      item.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      );
      listGroup.appendChild(item);
      const itemLink = document.createElement('a');
      const button = document.createElement('button');
      item.append(itemLink, button);
      itemLink.classList.add('fw-bold');
      itemLink.setAttribute('target', '_blank');
      itemLink.setAttribute('rel', 'noopener noreferrer');
      itemLink.dataset.id = id;
      itemLink.href = link;
      itemLink.textContent = title;
      if (state.uiState.viewedPosts.includes(id)) {
        itemLink.classList.remove('fw-bold');
        itemLink.classList.add('fw-normal', 'link-secondary');
      }
      button.outerHTML = `<button type="button" data-id="${id}" class="btn btn-outline-primary btn-sm" 
        data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('view')}</button>`;
    });
  };

  const renderModal = (state) => {
    const modalTitle = elements.modal.querySelector('.modal-title');
    const modalBody = elements.modal.querySelector('.modal-body');
    const modalLink = elements.modal.querySelector('.full-article');
    const id = state.uiState.activeModal;
    const { title, link, description } = state.posts.find((post) => post.id === id);
    modalTitle.textContent = title;
    modalBody.textContent = description;
    modalLink.href = link;
  };

  const renderContainer = (state, type) => {
    const parent = document.querySelector(`.${type}`);
    parent.innerHTML = '';
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    parent.appendChild(card);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18n.t(type);
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(cardBody, cardTitle, listGroup);
    switch (type) {
      case 'feeds':
        renderFeeds(state);
        break;
      case 'posts':
        renderPosts(state);
        break;
      default:
        break;
    }
  };

  const handleLoadingProcess = (state) => {
    const {
      form, feedback, input, submit,
    } = elements;

    switch (state.loadingProcess.state) {
      case 'loading':
        feedback.textContent = '';
        submit.setAttribute('disabled', '');
        input.setAttribute('disabled', '');
        break;
      case 'success':
        feedback.textContent = i18n.t('loadSuccess');
        feedback.classList.replace('text-danger', 'text-success');
        form.reset();
        break;
      case 'failed':
        feedback.textContent = state.loadingProcess.message;
        feedback.classList.replace('text-success', 'text-danger');
        break;
      case 'idle':
        submit.removeAttribute('disabled');
        input.removeAttribute('disabled');
        elements.input.focus();
        break;
      default:
        break;
    }
  };

  const state = onChange(initialState, (path) => {
    switch (path) {
      case 'loadingProcess.state':
        handleLoadingProcess(state);
        break;
      case 'form.valid':
        renderForm(state);
        break;
      case 'form.message':
        renderFormFeedback(state);
        break;
      case 'feeds':
        renderContainer(state, 'feeds');
        break;
      case 'uiState.viewedPosts':
      case 'posts':
        renderContainer(state, 'posts');
        break;
      case 'uiState.activeModal':
        renderModal(state);
        break;
      default:
        break;
    }
  });

  return state;
};
